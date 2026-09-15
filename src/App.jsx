import { useState } from 'react'
import Controls from './components/Controls'
import Stage from './components/Stage'
import { DEFAULT_SETTINGS, TEMPLATES } from './data/presets'

export default function App() {
  const [s, setS] = useState(DEFAULT_SETTINGS)
  const [selectedId, setSelectedId] = useState('xianyu')
  const [size, setSize] = useState({ w: 750, h: 750 })

  const selectPreset = (p) => {
    setSelectedId(p.id)
    setSize({ w: p.w, h: p.h })
  }

  const onLogoFile = (file) => {
    const reader = new FileReader()
    reader.onload = () => setS((prev) => ({ ...prev, logoUrl: reader.result }))
    reader.readAsDataURL(file)
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex items-baseline gap-4">
            <span className="brand-mark">Cover Forge</span>
            <span className="text-[11px] opacity-50 tracking-[0.25em] uppercase">封面锻造厂</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="hidden md:inline text-[11px] opacity-50 tracking-[0.25em] uppercase">
              {TEMPLATES.length} 种风格 · 10 个平台比例
            </span>
            <a className="btn btn-sm btn-ghost" href="/blog/">
              创作专栏
            </a>
            <button type="button" className="btn btn-sm" onClick={() => document.querySelector('.stage')?.scrollIntoView({ behavior: 'smooth' })}>
              开始制作
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-5 md:px-8 py-8">
        <div className="grid gap-6 lg:grid-cols-[360px_1fr] items-start">
          <Controls s={s} onChange={setS} onLogoFile={onLogoFile} />
          <Stage
            s={s}
            size={size}
            setSize={setSize}
            selectedId={selectedId}
            onSelect={selectPreset}
          />
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-5 md:px-8 pb-10 pt-6 border-t border-black/10">
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-[11px] opacity-50 tracking-[0.15em] uppercase">
          <span>Logo → 多平台封面</span>
          <a href="/blog/" className="hover:opacity-100 underline underline-offset-4">
            自媒体创作专栏
          </a>
          <span>野蛮主义 · 促销抢购</span>
          <span>杂志风 · 品牌格调</span>
          <span>几何大胆 · 艺术潮流</span>
          <span>新拟物 · 精致质感</span>
          <span className="ml-auto">COVER FORGE™</span>
        </div>
      </footer>
    </div>
  )
}