import { useRef } from 'react'
import { TEMPLATES, ACCENT_PALETTES, DEFAULT_SETTINGS } from '../data/presets'

export default function Controls({ s, onChange, onLogoFile }) {
  const fileRef = useRef(null)

  const set = (k, v) => onChange({ ...s, [k]: v })

  const handleFile = (e) => {
    const f = e.target.files && e.target.files[0]
    if (f) onLogoFile(f)
    e.target.value = ''
  }

  const showAccent = s.template === 'neo' || s.template === 'geometric'
  const palette = ACCENT_PALETTES[s.template] || []

  return (
    <div className="space-y-6">
      <div className="panel">
        <span className="label">封面风格</span>
        <div className="flex flex-col gap-3">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              className="chip text-left flex items-center justify-between w-full"
              data-active={s.template === t.id}
              onClick={() => set('template', t.id)}
            >
              <span>
                <span className="font-serif text-sm tracking-[0.1em]">{t.name}</span>
                <span className="opacity-60 ml-2 text-xs">· {t.label}</span>
              </span>
              <span className="opacity-50 text-[10px] tracking-[0.15em] uppercase">{t.hint}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="panel">
        <span className="label">Logo</span>
        <div className="flex items-center gap-4">
          <img src={s.logoUrl} alt="logo" className="logo-thumb" />
          <div className="flex flex-col gap-2">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => fileRef.current?.click()}>
              上传 Logo
            </button>
            <button type="button" className="chip chip-sm" onClick={() => set('logoUrl', DEFAULT_SETTINGS.logoUrl)}>
              重置默认
            </button>
          </div>
        </div>
        <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="hidden" onChange={handleFile} />
        <p className="mt-3 text-xs opacity-60 leading-relaxed">建议透明背景 PNG，导出时会原样嵌入封面。</p>
      </div>

      <div className="panel space-y-4">
        <div>
          <span className="label">文章标题</span>
          <textarea className="input" rows={2} value={s.title} onChange={(e) => set('title', e.target.value)} placeholder="一句话抓住眼球" />
        </div>
        <div>
          <span className="label">副标题 / 卖点</span>
          <input className="input" value={s.subtitle} onChange={(e) => set('subtitle', e.target.value)} placeholder="价格、优惠、亮点" />
        </div>
        <div className="grid grid-cols-2 gap-5">
          <div>
            <span className="label">品牌名</span>
            <input className="input" value={s.brand} onChange={(e) => set('brand', e.target.value)} />
          </div>
          <div>
            <span className="label">标签</span>
            <input className="input" value={s.tags} onChange={(e) => set('tags', e.target.value)} placeholder="如 HOT" />
          </div>
        </div>
        <div>
          <span className="label">个人水印 · 账号名</span>
          <input className="input" value={s.watermark} onChange={(e) => set('watermark', e.target.value)} placeholder="输入你的账号名，如：闲鱼小铺" />
          <p className="mt-2 text-xs opacity-60">会显示在封面上的「平台·比例」位置，用作你的个人水印。</p>
        </div>
      </div>

      {showAccent && (
        <div className="panel">
          <span className="label">强调色</span>
          <div className="flex items-center gap-2 flex-wrap">
            {palette.map((c) => (
              <button
                key={c.value}
                type="button"
                title={c.name}
                className="swatch"
                style={{ background: c.value }}
                data-active={s.accent === c.value}
                onClick={() => set('accent', c.value)}
              />
            ))}
            <label
              className="swatch"
              style={{ background: 'conic-gradient(#ef4444,#2563eb,#facc15,#22c55e,#ff006e,#ef4444)' }}
              title="自定义"
            >
              <input
                type="color"
                value={s.accent}
                onChange={(e) => set('accent', e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </label>
          </div>
        </div>
      )}
    </div>
  )
}