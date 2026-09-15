#!/usr/bin/env node
/**
 * 一键替换站点域名
 * ------------------------------------------------------------
 * 用法：
 *   node scripts/set-domain.mjs https://your-domain.com
 *
 * 作用：
 *   把 index.html / public/robots.txt / public/sitemap.xml
 *   等文件里所有的旧域名，整体替换为新的域名。
 *   旧域名会自动从 index.html 的 <link rel="canonical"> 中读取，
 *   因此可以反复执行，用来切换到任意自定义域名。
 * ------------------------------------------------------------
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

/** 需要参与域名替换的文件
 *  注意：public/sitemap.xml 已改为构建时由 scripts/build-posts.mjs 生成
 * （域名取自 index.html 的 canonical），不再需要在这里替换。
 */
const TARGET_FILES = ['index.html', 'public/robots.txt']

/** 兜底：首次使用时的占位域名 */
const FALLBACK_ORIGIN = 'https://cover-forge.pages.dev'

/** 解析入口参数并做基础校验 */
function parseOrigin(input) {
  if (!input) {
    console.error('❌ 缺少域名参数\n   用法: node scripts/set-domain.mjs https://your-domain.com')
    process.exit(1)
  }

  let raw = input.trim()
  if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`

  let url
  try {
    url = new URL(raw)
  } catch {
    console.error(`❌ 域名格式不正确: ${input}`)
    process.exit(1)
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    console.error('❌ 仅支持 http / https 协议')
    process.exit(1)
  }
  if (!url.hostname.includes('.')) {
    console.error(`❌ 域名看起来不完整: ${url.hostname}`)
    process.exit(1)
  }

  // 统一输出 origin（去掉末尾斜杠与路径）
  return url.origin
}

/** 从 index.html 的 canonical 读取当前域名 */
function detectCurrentOrigin() {
  const htmlPath = join(ROOT, 'index.html')
  if (!existsSync(htmlPath)) return FALLBACK_ORIGIN

  const html = readFileSync(htmlPath, 'utf8')
  const match = html.match(/<link\s+rel="canonical"\s+href="(https?:\/\/[^"/]+)/i)
  return match ? match[1] : FALLBACK_ORIGIN
}

function main() {
  const newOrigin = parseOrigin(process.argv[2])
  const oldOrigin = detectCurrentOrigin()

  if (oldOrigin === newOrigin) {
    console.log(`ℹ️  当前域名已经是 ${newOrigin}，无需修改。`)
    return
  }

  console.log(`🔁 域名替换: ${oldOrigin}  →  ${newOrigin}\n`)

  let touched = 0
  let totalHits = 0

  for (const rel of TARGET_FILES) {
    const file = join(ROOT, rel)
    if (!existsSync(file)) {
      console.log(`   ⏭  ${rel}  (不存在，跳过)`)
      continue
    }

    const before = readFileSync(file, 'utf8')
    const hits = before.split(oldOrigin).length - 1
    if (hits === 0) {
      console.log(`   ⏭  ${rel}  (未发现旧域名)`)
      continue
    }

    writeFileSync(file, before.split(oldOrigin).join(newOrigin), 'utf8')
    console.log(`   ✅ ${rel}  (替换 ${hits} 处)`)
    touched += 1
    totalHits += hits
  }

  console.log(`\n完成：${touched} 个文件，共替换 ${totalHits} 处。`)
  console.log('\n下一步：')
  console.log('  1. 重新构建  npm run build')
  console.log('  2. 提交推送  git add -A && git commit -m "chore: 切换站点域名" && git push')
  console.log('  3. 到 Cloudflare Pages → Custom domains 绑定该域名')
}

main()
