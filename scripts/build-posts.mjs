#!/usr/bin/env node
/**
 * 静态博客生成器
 * ------------------------------------------------------------
 * 读取 posts/*.md（Markdown + YAML frontmatter），在构建时生成：
 *   public/blog/<slug>/index.html   每篇文章一个独立静态页（/blog/<slug>/）
 *   public/blog/index.html          文章列表页（/blog/）
 *   public/blog/rss.xml             RSS 订阅源（/blog/rss.xml）
 *   public/sitemap.xml              站点地图（首页 + 专栏 + 全部文章）
 *
 * 设计原则：
 *   1. 域名从 index.html 的 canonical 读取（与 set-domain.mjs 同源，单点维护）
 *   2. 任何一篇文章解析失败只跳过并告警，绝不让整个构建失败
 *   3. 生成的页面是纯静态 HTML + 内联 CSS，不依赖 JS，爬虫可直接读取
 *   4. posts/ 下的 _ 开头文件与 README.md 不参与生成
 * ------------------------------------------------------------
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'
import { marked } from 'marked'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const POSTS_DIR = path.join(ROOT, 'posts')
const BLOG_OUT = path.join(ROOT, 'public', 'blog')
const SITEMAP_OUT = path.join(ROOT, 'public', 'sitemap.xml')

const SITE_NAME = '封面锻造厂 Cover Forge'
const BLOG_NAME = '自媒体创作专栏'
const BLOG_DESC = '封面设计技巧、多平台尺寸规范与自媒体运营方法，持续更新。'

marked.setOptions({ gfm: true })

// ---------------------------------------------------------------- 工具

function readSiteUrl() {
  try {
    const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')
    const m = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)
    if (m) return m[1].replace(/\/+$/, '')
  } catch { /* ignore */ }
  return 'https://fm.mozhuai.site'
}

const SITE_URL = readSiteUrl()

function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function escXml(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&apos;')
}

/** 把 frontmatter 的 date 统一成 YYYY-MM-DD；接受 Date 对象或各类字符串写法 */
function toDateStr(v) {
  if (!v) return null
  if (v instanceof Date && !Number.isNaN(v.getTime())) return v.toISOString().slice(0, 10)
  const m = String(v).match(/(\d{4})\s*[-/年.]\s*(\d{1,2})\s*[-/月.]\s*(\d{1,2})/)
  if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`
  return null
}

function slugFromFilename(name) {
  return name
    .replace(/\.md$/i, '')
    .replace(/^\d{4}-\d{2}-\d{2}-/, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9一-龥-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '')
}

function plainText(md) {
  return md
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#>*`_|[\]()!~-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

// ---------------------------------------------------------------- 读取文章

function readPosts() {
  if (!fs.existsSync(POSTS_DIR)) {
    console.log('  ℹ posts/ 目录不存在，生成空专栏')
    return []
  }
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.toLowerCase().endsWith('.md'))
  const posts = []
  const seenSlug = new Set()

  for (const file of files) {
    if (file.startsWith('_') || file.toLowerCase() === 'readme.md') continue
    try {
      const raw = fs.readFileSync(path.join(POSTS_DIR, file), 'utf8')
      const { data, content } = matter(raw)

      if (data.draft === true || data.draft === 'true') {
        console.log(`  ⏭ 草稿跳过: ${file}`)
        continue
      }

      const title = String(data.title || '').trim()
      if (!title) {
        console.warn(`  ⚠️ 缺少 title，跳过: ${file}`)
        continue
      }

      const date =
        toDateStr(data.date) ||
        toDateStr(file.replace(/\.md$/i, '').slice(0, 10)) ||
        new Date().toISOString().slice(0, 10)

      const slug = String(data.slug || slugFromFilename(file)).trim()
      if (!slug) {
        console.warn(`  ⚠️ 无法生成 slug，跳过: ${file}`)
        continue
      }
      if (seenSlug.has(slug)) {
        console.warn(`  ⚠️ slug 重复 (${slug})，跳过: ${file}`)
        continue
      }
      seenSlug.add(slug)

      // 正文里若第一个 H1 与标题重复，去掉，避免页面出现两个 H1
      let body = content.trim()
      body = body.replace(/^#\s+(.+)\n+/, (m, h1) => (title.includes(h1.trim()) || h1.trim().includes(title) ? '' : m))

      const html = marked.parse(body)
      const description =
        String(data.description || '').trim() || plainText(body).slice(0, 150)

      const tags = Array.isArray(data.tags)
        ? data.tags.map(String)
        : data.tags
          ? [String(data.tags)]
          : []

      posts.push({
        title,
        date,
        slug,
        description,
        tags,
        keywords: String(data.keywords || '').trim(),
        html,
        file,
      })
    } catch (err) {
      console.warn(`  ⚠️ 解析失败，跳过: ${file} — ${err.message}`)
    }
  }

  posts.sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug))
  return posts
}

// ---------------------------------------------------------------- 样式（全站内联，爬虫友好）

const CSS = `
  * { box-sizing: border-box; }
  html { -webkit-text-size-adjust: 100%; }
  body {
    margin: 0; background: #f9f8f6; color: #1c1c1c;
    font-family: system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", "Segoe UI", sans-serif;
    font-size: 16px; line-height: 1.9;
  }
  a { color: #1c1c1c; }
  .top {
    max-width: 1080px; margin: 0 auto; padding: 22px 20px;
    display: flex; justify-content: space-between; align-items: baseline;
    border-bottom: 1px solid rgba(28,28,28,0.1);
  }
  .brand { text-decoration: none; font-family: Georgia, "Times New Roman", "Songti SC", "SimSun", serif; font-size: 19px; letter-spacing: 0.02em; }
  .brand span { font-size: 11px; letter-spacing: 0.28em; text-transform: uppercase; color: rgba(28,28,28,0.42); margin-left: 6px; }
  .nav { font-size: 13px; text-decoration: none; color: rgba(28,28,28,0.62); }
  .nav:hover { color: #1c1c1c; }
  .wrap { max-width: 760px; margin: 0 auto; padding: 40px 20px 64px; }
  .crumb { font-size: 12.5px; color: rgba(28,28,28,0.42); margin-bottom: 26px; }
  .crumb a { color: rgba(28,28,28,0.42); text-decoration: none; }
  .crumb a:hover { color: #1c1c1c; }
  .kicker { font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase; color: rgba(28,28,28,0.42); margin: 0 0 14px; }
  h1 {
    font-family: Georgia, "Times New Roman", "Songti SC", "SimSun", serif; font-weight: 400;
    font-size: clamp(26px, 4vw, 36px); line-height: 1.35; margin: 0 0 14px; letter-spacing: 0.01em;
  }
  .lead { font-size: 15.5px; color: rgba(28,28,28,0.62); margin: 0 0 40px; max-width: 62ch; }
  .meta { font-size: 12.5px; color: rgba(28,28,28,0.42); margin: 0 0 34px; display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
  .tag { border: 1px solid rgba(28,28,28,0.1); padding: 3px 10px; font-size: 11px; letter-spacing: 0.06em; }
  .content h2 {
    font-family: Georgia, "Times New Roman", "Songti SC", "SimSun", serif; font-weight: 400;
    font-size: 22px; line-height: 1.4; margin: 44px 0 14px; padding-bottom: 10px;
    border-bottom: 1px solid rgba(28,28,28,0.1);
  }
  .content h3 { font-size: 15.5px; font-weight: 600; margin: 30px 0 8px; }
  .content p { margin: 0 0 14px; color: rgba(28,28,28,0.78); }
  .content ul, .content ol { margin: 0 0 14px; padding-left: 22px; color: rgba(28,28,28,0.78); }
  .content li { margin-bottom: 6px; }
  .content strong { color: #1c1c1c; }
  .content code {
    font-family: ui-monospace, Consolas, monospace; font-size: 13.5px;
    background: rgba(28,28,28,0.05); padding: 2px 6px; border-radius: 3px;
  }
  .content pre { background: #1c1c1c; color: #f9f8f6; padding: 16px 18px; overflow-x: auto; margin: 0 0 14px; }
  .content pre code { background: none; color: inherit; padding: 0; }
  .content blockquote {
    margin: 0 0 14px; padding: 12px 18px; border-left: 2px solid #1c1c1c;
    color: rgba(28,28,28,0.62); font-size: 14.5px;
  }
  .content img { max-width: 100%; height: auto; display: block; margin: 18px auto; }
  .content table { border-collapse: collapse; width: 100%; margin: 0 0 16px; font-size: 14px; }
  .content th, .content td { text-align: left; padding: 10px 12px; border-bottom: 1px solid rgba(28,28,28,0.1); }
  .content th { font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(28,28,28,0.42); font-weight: 400; }
  .content a { text-decoration: underline; text-underline-offset: 3px; }
  .cta { margin-top: 56px; border: 1px solid rgba(28,28,28,0.1); padding: 26px 28px; }
  .cta-k { font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase; color: rgba(28,28,28,0.42); margin: 0 0 10px; }
  .cta h2 { font-family: Georgia, "Times New Roman", "Songti SC", "SimSun", serif; font-weight: 400; font-size: 21px; margin: 0 0 10px; }
  .cta p { font-size: 14px; color: rgba(28,28,28,0.62); margin: 0 0 18px; }
  .btn {
    display: inline-block; background: #1c1c1c; color: #f9f8f6 !important; text-decoration: none;
    padding: 12px 26px; font-size: 13.5px; letter-spacing: 0.05em;
  }
  .list { display: grid; gap: 0; }
  .item {
    display: block; text-decoration: none; padding: 26px 0;
    border-bottom: 1px solid rgba(28,28,28,0.1);
  }
  .item time { font-size: 11.5px; letter-spacing: 0.14em; color: rgba(28,28,28,0.42); text-transform: uppercase; }
  .item h2 {
    font-family: Georgia, "Times New Roman", "Songti SC", "SimSun", serif; font-weight: 400;
    font-size: 21px; line-height: 1.45; margin: 8px 0 8px;
  }
  .item p { font-size: 13.5px; color: rgba(28,28,28,0.62); margin: 0; }
  .item:hover h2 { text-decoration: underline; text-underline-offset: 4px; }
  .empty { color: rgba(28,28,28,0.42); font-size: 14px; padding: 30px 0; }
  .foot {
    max-width: 1080px; margin: 0 auto; padding: 20px; font-size: 11.5px;
    color: rgba(28,28,28,0.42); letter-spacing: 0.1em; text-transform: uppercase;
    border-top: 1px solid rgba(28,28,28,0.1);
  }
  .foot a { color: rgba(28,28,28,0.62); }
`

// ---------------------------------------------------------------- 页面模板

function shell({ title, description, canonical, ogType = 'website', extraHead = '', body }) {
  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escHtml(title)}</title>
    <meta name="description" content="${escHtml(description)}" />
    <meta name="robots" content="index, follow, max-image-preview:large" />
    <link rel="canonical" href="${escHtml(canonical)}" />
    <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
    <meta property="og:type" content="${ogType}" />
    <meta property="og:site_name" content="${escHtml(SITE_NAME)}" />
    <meta property="og:locale" content="zh_CN" />
    <meta property="og:title" content="${escHtml(title)}" />
    <meta property="og:description" content="${escHtml(description)}" />
    <meta property="og:url" content="${escHtml(canonical)}" />
    <meta property="og:image" content="${SITE_URL}/og-cover.png" />
    <meta name="twitter:card" content="summary_large_image" />
${extraHead}
    <style>${CSS}</style>
  </head>
  <body>
    <header class="top">
      <a class="brand" href="/">封面锻造厂<span>Cover Forge</span></a>
      <a class="nav" href="/blog/">创作专栏</a>
    </header>
${body}
    <footer class="foot">
      © ${new Date().getFullYear()} 封面锻造厂 Cover Forge ·
      <a href="/">免费封面生成器</a> · 浏览器本地渲染，素材不上传
    </footer>
  </body>
</html>
`
}

function articleJsonLd(p, canonical) {
  const graph = [
    {
      '@type': 'Article',
      '@id': `${canonical}#article`,
      headline: p.title,
      description: p.description,
      datePublished: p.date,
      dateModified: p.date,
      inLanguage: 'zh-CN',
      image: `${SITE_URL}/og-cover.png`,
      author: { '@type': 'Organization', name: SITE_NAME, url: `${SITE_URL}/` },
      publisher: {
        '@type': 'Organization',
        name: SITE_NAME,
        url: `${SITE_URL}/`,
        logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
      },
      mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '首页', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: BLOG_NAME, item: `${SITE_URL}/blog/` },
        { '@type': 'ListItem', position: 3, name: p.title, item: canonical },
      ],
    },
  ]
  return `    <script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph })}</script>\n`
}

function renderArticle(p) {
  const canonical = `${SITE_URL}/blog/${p.slug}/`
  const tags = p.tags.map((t) => `<span class="tag">${escHtml(t)}</span>`).join('')
  const body = `    <main class="wrap">
      <nav class="crumb" aria-label="面包屑"><a href="/">首页</a> / <a href="/blog/">创作专栏</a> / <span>${escHtml(p.title)}</span></nav>
      <article>
        <h1>${escHtml(p.title)}</h1>
        <p class="meta"><time datetime="${p.date}">${p.date}</time>${tags}</p>
        <div class="content">
${p.html}
        </div>
      </article>
      <aside class="cta">
        <p class="cta-k">免费工具</p>
        <h2>用封面锻造厂，30 秒做出多平台封面</h2>
        <p>上传 Logo、填好标题卖点，一键生成闲鱼、小红书、公众号、抖音、B站等 10 种平台的精确尺寸封面，支持批量打包 ZIP 下载，免费、无需注册。</p>
        <a class="btn" href="/">立即免费使用 →</a>
      </aside>
    </main>
`
  return shell({
    title: `${p.title}｜${SITE_NAME} 创作专栏`,
    description: p.description,
    canonical,
    ogType: 'article',
    extraHead:
      `    <meta property="article:published_time" content="${p.date}" />\n` +
      `    <meta property="article:modified_time" content="${p.date}" />\n` +
      (p.keywords ? `    <meta name="keywords" content="${escHtml(p.keywords)}" />\n` : '') +
      articleJsonLd(p, canonical),
    body,
  })
}

function renderIndex(posts) {
  const canonical = `${SITE_URL}/blog/`
  const items = posts
    .map(
      (p) => `      <a class="item" href="/blog/${p.slug}/">
        <time datetime="${p.date}">${p.date}</time>
        <h2>${escHtml(p.title)}</h2>
        <p>${escHtml(p.description)}</p>
      </a>`
    )
    .join('\n')

  const body = `    <main class="wrap">
      <p class="kicker">Blog · 创作专栏</p>
      <h1>${escHtml(BLOG_NAME)}</h1>
      <p class="lead">${escHtml(BLOG_DESC)}配合免费工具「封面锻造厂」，从封面设计到内容分发，帮你把自媒体的每一步都做对。</p>
      <div class="list">
${items || '        <p class="empty">第一篇文章正在路上，明天见。</p>'}
      </div>
    </main>
`

  const blogJsonLd = `    <script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': `${canonical}#blog`,
    name: `${SITE_NAME} · ${BLOG_NAME}`,
    description: BLOG_DESC,
    url: canonical,
    inLanguage: 'zh-CN',
    publisher: { '@type': 'Organization', name: SITE_NAME, url: `${SITE_URL}/` },
  })}</script>\n`

  return shell({
    title: `${BLOG_NAME}｜${SITE_NAME}`,
    description: BLOG_DESC,
    canonical,
    extraHead:
      `    <link rel="alternate" type="application/rss+xml" title="${escHtml(SITE_NAME)} RSS" href="/blog/rss.xml" />\n` +
      blogJsonLd,
    body,
  })
}

// ---------------------------------------------------------------- RSS

function renderRss(posts) {
  const items = posts
    .map((p) => {
      const link = `${SITE_URL}/blog/${p.slug}/`
      const pub = new Date(`${p.date}T08:00:00+08:00`).toUTCString()
      return `    <item>
      <title>${escXml(p.title)}</title>
      <link>${escXml(link)}</link>
      <guid isPermaLink="true">${escXml(link)}</guid>
      <pubDate>${pub}</pubDate>
      <description>${escXml(p.description)}</description>
    </item>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escXml(SITE_NAME)} · ${escXml(BLOG_NAME)}</title>
    <link>${escXml(SITE_URL)}/blog/</link>
    <description>${escXml(BLOG_DESC)}</description>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>
`
}

// ---------------------------------------------------------------- Sitemap

function renderSitemap(posts) {
  const today = new Date().toISOString().slice(0, 10)
  const urls = []

  urls.push(`  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
    <image:image>
      <image:loc>${SITE_URL}/og-cover.png</image:loc>
      <image:title>封面锻造厂 Cover Forge 免费多平台封面生成器</image:title>
    </image:image>
    <xhtml:link rel="alternate" hreflang="zh-CN" href="${SITE_URL}/" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}/" />
  </url>`)

  urls.push(`  <url>
    <loc>${SITE_URL}/blog/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`)

  for (const p of posts) {
    urls.push(`  <url>
    <loc>${SITE_URL}/blog/${p.slug}/</loc>
    <lastmod>${p.date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`)
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
>
${urls.join('\n')}
</urlset>
`
}

// ---------------------------------------------------------------- 主流程

function main() {
  const posts = readPosts()
  console.log(`\n📝 文章生成：共 ${posts.length} 篇`)

  // 全量重建 public/blog（保证删除/改名的文章不会残留旧页面）
  fs.rmSync(BLOG_OUT, { recursive: true, force: true })
  fs.mkdirSync(BLOG_OUT, { recursive: true })

  fs.writeFileSync(path.join(BLOG_OUT, 'index.html'), renderIndex(posts), 'utf8')
  fs.writeFileSync(path.join(BLOG_OUT, 'rss.xml'), renderRss(posts), 'utf8')

  for (const p of posts) {
    const dir = path.join(BLOG_OUT, p.slug)
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(path.join(dir, 'index.html'), renderArticle(p), 'utf8')
    console.log(`   ✅ /blog/${p.slug}/  (${p.date})  ${p.title}`)
  }

  fs.writeFileSync(SITEMAP_OUT, renderSitemap(posts), 'utf8')
  console.log(`   ✅ sitemap.xml（${posts.length + 2} 个 URL）\n`)
}

main()
