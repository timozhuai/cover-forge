#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
生产环境巡检脚本
================
对线上站点做全面健康检查：页面可用性、SEO 元数据、结构化数据合法性、
安全响应头、静态资源、sitemap 与 RSS 一致性、广告脚本与 SW 卸载桩状态。

用法：
    python scripts/prod-check.py                 # 检查线上 https://fm.mozhuai.site
    python scripts/prod-check.py http://127.0.0.1:4173   # 检查本地预览

退出码：全部 PASS 为 0；存在 FAIL 为 1（WARN 不影响）。
"""

import json
import re
import sys
import urllib.request
import urllib.error
import xml.etree.ElementTree as ET

sys.stdout.reconfigure(encoding="utf-8")

BASE = (sys.argv[1] if len(sys.argv) > 1 else "https://fm.mozhuai.site").rstrip("/")
INDEXNOW_KEY = "a1d372b20f4a13d4e572e30afd72309c"
ARTICLES = [
    "/blog/xiaohongshu-cover-size-guide/",
    "/blog/wechat-official-cover-guide/",
]

UA = {"User-Agent": "Mozilla/5.0 (compatible; prod-check/1.0)"}
_results = []


def ok(name, detail=""):
    _results.append(("PASS", name, detail))


def fail(name, detail=""):
    _results.append(("FAIL", name, detail))


def warn(name, detail=""):
    _results.append(("WARN", name, detail))


class _NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a, **k):
        return None


_FOLLOW = urllib.request.build_opener()
_NOFOLLOW = urllib.request.build_opener(_NoRedirect)


def fetch(url, follow=True):
    """返回 (status, headers, body_bytes)；网络错误时 status 为 None"""
    req = urllib.request.Request(url, headers=UA)
    try:
        with (_FOLLOW if follow else _NOFOLLOW).open(req, timeout=25) as r:
            return r.status, dict(r.headers), r.read()
    except urllib.error.HTTPError as e:
        return e.code, dict(e.headers), e.read()
    except Exception as e:  # noqa: BLE001
        return None, {}, str(e).encode("utf-8", "replace")


def text_of(body):
    return body.decode("utf-8", "replace")


def ld_json_blocks(html):
    blocks = []
    for m in re.finditer(
        r'<script\s+type="application/ld\+json">(.*?)</script>', html, re.S
    ):
        try:
            blocks.append(json.loads(m.group(1)))
        except json.JSONDecodeError:
            blocks.append(None)
    return blocks


def graph_types(blocks):
    types = set()
    for b in blocks:
        if not b:
            continue
        nodes = b.get("@graph", [b]) if isinstance(b, dict) else []
        for n in nodes:
            t = n.get("@type")
            if isinstance(t, list):
                types.update(t)
            elif t:
                types.add(t)
    return types


def count_h1(html):
    return len(re.findall(r"<h1[\s>]", html, re.I))


def meta_content(html, name):
    m = re.search(
        rf'<meta\s+(?:name|property)="(?:og:)?{re.escape(name)}"\s+content="([^"]*)"',
        html,
    )
    if not m:
        m = re.search(
            rf'<meta\s+content="([^"]*)"\s+(?:name|property)="(?:og:)?{re.escape(name)}"',
            html,
        )
    return m.group(1) if m else None


def canonical_of(html):
    m = re.search(r'<link\s+rel="canonical"\s+href="([^"]*)"', html)
    return m.group(1) if m else None


# ---------------------------------------------------------------- 1. 页面可用性
PAGES = [
    ("/", "text/html"),
    ("/blog/", "text/html"),
    (ARTICLES[0], "text/html"),
    (ARTICLES[1], "text/html"),
    ("/blog/rss.xml", "application/xml"),
    ("/sitemap.xml", "application/xml"),
    ("/robots.txt", "text/plain"),
    ("/sw.js", "javascript"),
]
ASSETS = [
    "/og-cover.png",
    "/1.png",
    "/logo.png",
    "/icon-192.png",
    "/icon-512.png",
    "/apple-touch-icon.png",
    "/site.webmanifest",
    f"/{INDEXNOW_KEY}.txt",
]

home_html = None
for path, ctype in PAGES:
    status, headers, body = fetch(BASE + path)
    if status == 200 and ctype in headers.get("Content-Type", ""):
        ok(f"GET {path}", f"200 · {headers.get('Content-Type', '')} · {len(body)} B")
    else:
        fail(f"GET {path}", f"status={status} ctype={headers.get('Content-Type', '')}")
    if path == "/":
        home_html = text_of(body)

for path in ASSETS:
    status, headers, body = fetch(BASE + path)
    if status == 200:
        ok(f"GET {path}", f"200 · {headers.get('Content-Type', '')} · {len(body)} B")
    else:
        fail(f"GET {path}", f"status={status}")

# ---------------------------------------------------------------- 2. 首页 SEO
if home_html:
    title = re.search(r"<title>(.*?)</title>", home_html, re.S)
    if title and "封面锻造厂" in title.group(1):
        ok("首页 title", title.group(1)[:50])
    else:
        fail("首页 title", title.group(1) if title else "缺失")

    desc = meta_content(home_html, "description")
    ok("首页 description", f"{len(desc)} 字") if desc else fail("首页 description", "缺失")

    can = canonical_of(home_html)
    ok("首页 canonical", can) if can == BASE + "/" else fail("首页 canonical", str(can))

    ogimg = meta_content(home_html, "image")
    ok("首页 og:image 绝对地址", ogimg) if ogimg and ogimg.startswith("https://") else fail(
        "首页 og:image", str(ogimg)
    )

    n = count_h1(home_html)
    ok("首页唯一 H1", f"{n} 个") if n == 1 else fail("首页 H1 数量", f"{n} 个（应为 1）")

    blocks = ld_json_blocks(home_html)
    if None in blocks:
        fail("首页 JSON-LD 合法性", "存在无法解析的 ld+json")
    else:
        types = graph_types(blocks)
        need = {"WebSite", "Organization", "HowTo", "FAQPage"}
        missing = need - types
        app = {"WebApplication", "SoftwareApplication"} & types
        if not missing and app:
            ok("首页 JSON-LD", f"类型齐全: {sorted(types)}")
        else:
            fail("首页 JSON-LD", f"缺少 {missing or 'WebApplication'}")

    ok("广告脚本 nap5k", "zone 11800280") if "nap5k.com" in home_html and "11800280" in home_html else fail(
        "广告脚本 nap5k", "未找到"
    )
    ok("首页→专栏内链", "/blog/") if "/blog/" in home_html else fail("首页→专栏内链", "缺失")
    ok("静态 SEO 内容区", "seo-page") if "seo-page" in home_html else fail("静态 SEO 内容区", "缺失")

# ---------------------------------------------------------------- 3. 博客列表页
status, _, body = fetch(BASE + "/blog/")
if status == 200:
    html = text_of(body)
    can = canonical_of(html)
    ok("专栏 canonical", can) if can == BASE + "/blog/" else fail("专栏 canonical", str(can))
    types = graph_types(ld_json_blocks(html))
    ok("专栏 Blog JSON-LD") if "Blog" in types else fail("专栏 Blog JSON-LD", f"实际: {types}")
    ok("专栏 RSS alternate") if 'type="application/rss+xml"' in html else fail("专栏 RSS alternate", "缺失")
    listed = [a for a in ARTICLES if a in html]
    ok("专栏列出全部文章", f"{len(listed)}/{len(ARTICLES)}") if len(listed) == len(ARTICLES) else fail(
        "专栏列出全部文章", f"{len(listed)}/{len(ARTICLES)}"
    )

# ---------------------------------------------------------------- 4. 文章页
for path in ARTICLES:
    status, _, body = fetch(BASE + path)
    if status != 200:
        continue
    html = text_of(body)
    slug = path.strip("/")
    can = canonical_of(html)
    if can == f"{BASE}{path}":
        ok(f"文章 canonical {slug}")
    else:
        fail(f"文章 canonical {slug}", str(can))

    types = graph_types(ld_json_blocks(html))
    need = {"Article", "BreadcrumbList"}
    if need <= types:
        ok(f"文章 JSON-LD {slug}", f"{sorted(need)}")
    else:
        fail(f"文章 JSON-LD {slug}", f"缺少 {need - types}")

    n = count_h1(html)
    ok(f"文章唯一 H1 {slug}") if n == 1 else fail(f"文章 H1 {slug}", f"{n} 个")

    cn = len(re.findall(r"[一-龥]", re.sub(r"<style[\s\S]*?</style>|<script[\s\S]*?</script>", "", html)))
    ok(f"文章正文中文字数 {slug}", f"{cn} 字") if cn >= 600 else warn(
        f"文章正文中文字数 {slug}", f"仅 {cn} 字（建议 ≥600）"
    )
    ok(f"文章回流 CTA {slug}") if re.search(r'<a class="btn" href="/"', html) else fail(
        f"文章回流 CTA {slug}", "缺失"
    )

# ---------------------------------------------------------------- 5. sitemap 一致性
status, _, body = fetch(BASE + "/sitemap.xml")
if status == 200:
    try:
        ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
        root = ET.fromstring(body)
        locs = [e.text for e in root.findall(".//sm:loc", ns)]
        ok("sitemap XML 合法", f"{len(locs)} 个 URL")
        for loc in locs:
            s, _, _ = fetch(loc)
            ok(f"sitemap URL 可访问 {loc.replace(BASE, '')}") if s == 200 else fail(
                f"sitemap URL {loc}", f"status={s}"
            )
    except ET.ParseError as e:
        fail("sitemap XML 合法性", str(e))

# ---------------------------------------------------------------- 6. RSS
status, _, body = fetch(BASE + "/blog/rss.xml")
if status == 200:
    try:
        root = ET.fromstring(body)
        items = root.findall(".//item")
        ok("RSS XML 合法", f"{len(items)} 篇文章") if len(items) == len(ARTICLES) else warn(
            "RSS 文章数", f"{len(items)}（预期 {len(ARTICLES)}）"
        )
    except ET.ParseError as e:
        fail("RSS XML 合法性", str(e))

# ---------------------------------------------------------------- 7. robots.txt
status, _, body = fetch(BASE + "/robots.txt")
if status == 200:
    rb = text_of(body)
    ok("robots Sitemap 指向") if f"Sitemap: {BASE}/sitemap.xml" in rb else fail(
        "robots Sitemap 指向", "缺失或不匹配"
    )
    ok("robots 允许抓取") if "Allow: /" in rb else fail("robots 允许抓取", "缺失")

# ---------------------------------------------------------------- 8. 安全响应头
_, headers, _ = fetch(BASE + "/")
sec = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": None,
    "Strict-Transport-Security": None,
    "Referrer-Policy": None,
}
lower = {k.lower(): v for k, v in headers.items()}
for h, expect in sec.items():
    v = lower.get(h.lower())
    if v is None:
        warn(f"响应头 {h}", "缺失（_headers 未生效？）")
    elif expect and expect not in v:
        fail(f"响应头 {h}", v)
    else:
        ok(f"响应头 {h}", v[:40])

# ---------------------------------------------------------------- 9. 跳转行为
status, headers, _ = fetch(BASE + "/blog", follow=False)
loc = headers.get("Location", "")
if status in (301, 302, 307, 308) and loc.rstrip("/").endswith("/blog"):
    ok("无斜杠跳转 /blog → /blog/", f"{status}")
else:
    warn("无斜杠跳转 /blog", f"status={status} loc={loc}")

status, headers, _ = fetch("http://" + BASE.split("://", 1)[1] + "/", follow=False)
if status in (301, 302, 307, 308):
    ok("HTTP → HTTPS 跳转", f"{status}")
else:
    warn("HTTP → HTTPS 跳转", f"status={status}")

# ---------------------------------------------------------------- 10. sw.js 卸载桩
status, headers, body = fetch(BASE + "/sw.js")
if status == 200:
    sw = text_of(body)
    if "unregister" in sw and "5gvci" not in sw:
        ok("sw.js 为卸载桩（无第三方脚本）")
    else:
        fail("sw.js 内容异常", "仍含第三方引用或缺少 unregister")
    cc = headers.get("Cache-Control", "")
    ok("sw.js 不缓存", cc) if "no-store" in cc else fail("sw.js Cache-Control", cc)

# ---------------------------------------------------------------- 11. IndexNow 密钥
status, _, body = fetch(f"{BASE}/{INDEXNOW_KEY}.txt")
if status == 200 and text_of(body).strip() == INDEXNOW_KEY:
    ok("IndexNow 密钥文件", "内容匹配")
else:
    fail("IndexNow 密钥文件", f"status={status}")

# ---------------------------------------------------------------- 12. 已知问题：软 404
status, _, _ = fetch(BASE + "/this-page-should-not-exist-404")
if status == 404:
    ok("不存在路径返回 404")
elif status == 200:
    warn("软 404 未解决", "不存在的路径返回 200+首页（已知遗留，非本次引入）")
else:
    warn("不存在路径状态码异常", f"status={status}")

# ---------------------------------------------------------------- 汇总
print(f"\n===== 生产环境巡检 · {BASE} =====\n")
for status, name, detail in _results:
    icon = {"PASS": "✅", "FAIL": "❌", "WARN": "⚠️ "}[status]
    line = f"{icon} {name}"
    if detail:
        line += f"  —  {detail}"
    print(line)

np = sum(1 for r in _results if r[0] == "PASS")
nf = sum(1 for r in _results if r[0] == "FAIL")
nw = sum(1 for r in _results if r[0] == "WARN")
print(f"\n合计 {len(_results)} 项：✅ {np} 通过 · ❌ {nf} 失败 · ⚠️ {nw} 警告")
sys.exit(1 if nf else 0)
