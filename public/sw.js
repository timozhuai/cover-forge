/*
 * ============================================================
 * 封面锻造厂 Cover Forge · Service Worker 卸载桩
 *
 * 本站**不使用** Service Worker，也**不加载任何第三方广告 Service Worker**。
 *
 * 这个文件为什么存在：
 *   站点根目录曾经放过一个广告联盟（Monetag）的 sw.js，它的真实行为是
 *   动态 importScripts 拉取远端脚本，而根目录 SW 的作用域是整站，
 *   能拦截本站每一个网络请求。我们已将其移除，但有两件事必须处理：
 *
 *   1) 已经注册过旧 SW 的浏览器不会因为你删文件就自动卸载 ——
 *      它需要在下一次更新检查时拿到一个合法 JS 才会执行卸载逻辑。
 *      若该请求返回 404 或 HTML，Chrome 只会让更新失败，旧 SW 会长期驻留。
 *
 *   2) 广告脚本仍可能尝试注册 /sw.js。让这个请求命中旧广告脚本，
 *      就等于把它又装回来了。
 *
 * 因此这里放一个「只负责自我注销」的空壳：没有任何 fetch 拦截逻辑，
 * 不会改写、缓存或转发本站任何请求。
 *
 * 何时可以彻底删除本文件：
 *   确认线上已无旧注册（浏览器 DevTools → Application → Service Workers
 *   列表为空）之后，可直接删除 public/sw.js 并重新部署。
 * ============================================================
 */

// 立即接管，缩短旧版本继续存活的窗口
self.addEventListener('install', () => {
  self.skipWaiting()
})

// 清空所有缓存，然后注销自己，让浏览器回到「无 SW」的干净状态
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const keys = await caches.keys()
        await Promise.all(keys.map((key) => caches.delete(key)))
      } catch (e) {
        /* 忽略：不同浏览器 Cache Storage 行为差异 */
      }
      try {
        await self.registration.unregister()
      } catch (e) {
        /* 忽略：注销失败不影响页面正常访问 */
      }
    })()
  )
})
