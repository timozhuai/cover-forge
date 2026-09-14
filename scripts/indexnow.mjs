#!/usr/bin/env node
/**
 * IndexNow 批量提交
 * ------------------------------------------------------------
 * 用法：
 *   npm run indexnow              # 提交 sitemap.xml 里的全部 URL
 *   npm run indexnow -- <url>...  # 额外提交指定 URL（可多个）
 *
 * 原理：
 *   IndexNow 是一个开放协议，Bing / Yandex / Seznam / Naver 等搜索引擎共用。
 *   网站只需在根目录放一个「以密钥命名、内容也是该密钥」的 txt 文件来证明归属，
 *   然后向 api.indexnow.org POST 一批 URL，引擎就会主动来抓。
 *   —— 不需要注册 Bing 站长账号即可生效（注册后可看到提交量与抓取状态）。
 * ------------------------------------------------------------
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const PUBLIC_DIR = join(ROOT, 'public')
const ENDPOINT = 'https://api.indexnow.org/indexnow'

/** 站点域名：从 index.html 的 canonical 读取，保证与线上一致 */
function getOrigin() {
  const html = readFileSync(join(ROOT, 'index.html'), 'utf8')
  const m = html.match(/<link\s+rel="canonical"\s+href="(https?:\/\/[^"/]+)/i)
  if (!m) throw new Error('无法从 index.html 的 canonical 中解析出站点域名')
  return m[1]
}

/** 找到 IndexNow 密钥：public/ 下「文件名（去扩展名）= 文件内容」的 txt */
function getKey() {
  const candidates = readdirSync(PUBLIC_DIR).filter(
    (f) => /^[A-Za-z0-9-]{8,128}\.txt$/.test(f) && f !== 'robots.txt',
  )

  for (const file of candidates) {
    const name = file.replace(/\.txt$/, '')
    const content = readFileSync(join(PUBLIC_DIR, file), 'utf8').trim()
    if (content === name) return { key: name, file }
  }
  throw new Error('未在 public/ 下找到合法的 IndexNow 密钥文件（文件名应等于文件内容）')
}

/** 从 sitemap.xml 抽出所有 <loc> */
function getSitemapUrls() {
  const p = join(PUBLIC_DIR, 'sitemap.xml')
  if (!existsSync(p)) return []
  const xml = readFileSync(p, 'utf8')
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1].trim())
}

async function main() {
  const origin = getOrigin()
  const { key, file } = getKey()
  const keyLocation = `${origin}/${file}`

  const extra = process.argv.slice(2).filter((a) => a.startsWith('http'))
  const urlList = [...new Set([...getSitemapUrls(), ...extra])]

  if (urlList.length === 0) {
    console.error('❌ 没有可提交的 URL')
    process.exit(1)
  }

  console.log(`🔑 密钥:     ${key}`)
  console.log(`📄 密钥位置: ${keyLocation}`)
  console.log(`🌐 待提交:   ${urlList.length} 条`)
  urlList.forEach((u) => console.log(`   - ${u}`))

  const body = {
    host: new URL(origin).host,
    key,
    keyLocation,
    urlList,
  }

  let res
  try {
    res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(body),
    })
  } catch (err) {
    console.error(`\n❌ 请求失败: ${err.message}`)
    process.exit(1)
  }

  const statusMap = {
    200: '✅ 200 OK —— 提交成功',
    202: '✅ 202 Accepted —— 已接受，等待处理',
    400: '❌ 400 —— 请求格式错误',
    403: '❌ 403 —— 密钥无效（检查密钥文件是否能被公网访问、内容是否与文件名一致）',
    422: '❌ 422 —— URL 不属于该 host，或密钥格式不符',
    429: '⚠️  429 —— 提交过于频繁（疑似滥用），请降低频率',
  }

  console.log(`\n${statusMap[res.status] ?? `⚠️  未预期状态码 ${res.status}`}`)

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    if (text) console.log(text.slice(0, 500))
    process.exit(1)
  }

  console.log('\n提示：IndexNow 提交后引擎通常在数分钟到数小时内回抓。')
  console.log('      想看提交量与抓取状态，去 Bing Webmaster Tools 添加并验证站点。')
}

main()
