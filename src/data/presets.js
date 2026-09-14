export const RATIO_PRESETS = [
  { id: 'xianyu', name: '闲鱼', w: 750, h: 750, ratio: '1:1', note: '商品封面 · 1:1' },
  { id: 'wechat-big', name: '公众号大图', w: 900, h: 383, ratio: '2.35:1', note: '头条大图' },
  { id: 'wechat-main', name: '公众号次图', w: 900, h: 500, ratio: '9:5', note: '列表封面' },
  { id: 'xiaohongshu', name: '小红书', w: 1242, h: 1656, ratio: '3:4', note: '笔记封面' },
  { id: 'douyin', name: '抖音/视频号', w: 1080, h: 608, ratio: '16:9', note: '视频封面' },
  { id: 'bilibili', name: 'B站', w: 1146, h: 717, ratio: '16:10', note: '视频封面' },
  { id: 'zhihu', name: '知乎/头条', w: 1210, h: 681, ratio: '16:9', note: '回答/图文' },
  { id: 'weibo', name: '微博', w: 1104, h: 621, ratio: '16:9', note: '文章头图' },
  { id: 'ins-portrait', name: 'Ins 竖版', w: 1080, h: 1350, ratio: '4:5', note: '信息流' },
  { id: 'story', name: 'Story 竖屏', w: 1080, h: 1920, ratio: '9:16', note: '全屏故事' },
]

export const TEMPLATES = [
  { id: 'neo', name: 'NEO', label: '野蛮主义', hint: '促销 · 折扣 · 抢购' },
  { id: 'editorial', name: 'EDITORIAL', label: '杂志风', hint: '品牌 · 深度 · 格调' },
  { id: 'geometric', name: 'GEOMETRIC', label: '几何大胆', hint: '艺术 · 设计 · 潮流' },
  { id: 'neumo', name: 'NEUMO', label: '新拟物', hint: '精致 · 质感 · 高端' },
]

export const NEO_COLORS = [
  { name: '品红', value: '#ff006e' },
  { name: '荧光绿', value: '#ccff00' },
  { name: '电光蓝', value: '#00d9ff' },
  { name: '橙色', value: '#ff9500' },
  { name: '明黄', value: '#ffff00' },
  { name: '墨黑', value: '#000000' },
]

export const GEOMETRIC_COLORS = [
  { name: '正红', value: '#ef4444' },
  { name: '正蓝', value: '#2563eb' },
  { name: '正黄', value: '#facc15' },
  { name: '正绿', value: '#22c55e' },
  { name: '品红', value: '#ff006e' },
]

export const ACCENT_PALETTES = {
  neo: NEO_COLORS,
  geometric: GEOMETRIC_COLORS,
}

export const DEFAULT_SETTINGS = {
  title: '限量上架 · 手慢无',
  subtitle: '黑五特价 · 仅此一批 · 正品保证',
  brand: 'LOGO 出品',
  tags: '新品',
  watermark: '我的账号名',
  logoUrl: '/1.png',
  accent: '#ccff00',
  template: 'editorial',
}