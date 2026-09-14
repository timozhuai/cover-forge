import { useEffect, useRef, useState } from 'react'
import { RATIO_PRESETS } from '../data/presets'
import Cover from './Cover'
import { downloadOne, downloadZip, safeName } from '../utils/export'

function useBoxSize() {
  const ref = useRef(null)
  const [box, setBox] = useState({ w: 0, h: 0 })
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      setBox({ w: el.clientWidth, h: el.clientHeight })
    })
    ro.observe(el)
    setBox({ w: el.clientWidth, h: el.clientHeight })
    return () => ro.disconnect()
  }, [])
  return [ref, box]
}

export default function Stage({ s, size, setSize, selectedId, onSelect }) {
  const [stageRef, box] = useBoxSize()
  const [customW, setCustomW] = useState('800')
  const [customH, setCustomH] = useState('800')
  const [exporting, setExporting] = useState(false)
  const [msg, setMsg] = useState('')

  const currentRef = useRef(null)

  const scale = Math.min(box.w / size.w, box.h / size.h) || 0.15

  const filename = (w, h) =>
    `${safeName(s.brand)}_${s.template}_${w}x${h}.png`

  const handleExportOne = async () => {
    if (!currentRef.current) return
    setExporting(true)
    setMsg('正在生成…')
    try {
      await downloadOne(currentRef.current, size.w, size.h, filename(size.w, size.h))
      setMsg('已导出 ✓')
    } catch (err) {
      console.error(err)
      setMsg('导出失败，请重试')
    } finally {
      setExporting(false)
    }
  }

  const handleExportAll = async () => {
    setExporting(true)
    setMsg('正在批量生成…')
    try {
      await downloadZip(
        RATIO_PRESETS.map((p) => ({
          node: document.getElementById(`batch-${p.id}`),
          w: p.w,
          h: p.h,
          filename: filename(p.w, p.h),
        })),
        `${safeName(s.brand)}_${s.template}_全平台.zip`,
      )
      setMsg('已打包下载 ✓')
    } catch (err) {
      console.error(err)
      setMsg('批量导出失败，请重试')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="panel">
        <span className="label">平台比例</span>
        <div className="flex flex-wrap gap-2 mb-4">
          {RATIO_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              className="chip"
              data-active={selectedId === p.id}
              onClick={() => onSelect(p)}
            >
              <span className="font-black text-sm">{p.name}</span>
              <span className="opacity-70 ml-1">· {p.ratio} · {p.w}×{p.h}</span>
            </button>
          ))}
        </div>
        <div className="flex items-end gap-3 flex-wrap border-t border-black/10 pt-3 mt-1">
          <div className="w-24">
            <span className="label">自定义宽</span>
            <input className="input" type="number" min={200} max={4000} value={customW} onChange={(e) => setCustomW(e.target.value)} />
          </div>
          <span className="pb-2 opacity-60">×</span>
          <div className="w-24">
            <span className="label">高</span>
            <input className="input" type="number" min={200} max={4000} value={customH} onChange={(e) => setCustomH(e.target.value)} />
          </div>
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => onSelect({ id: 'custom', name: '自定义', w: Number(customW) || 800, h: Number(customH) || 800, ratio: '自定义' })}
          >
            应用
          </button>
          <span className="text-xs opacity-70 ml-auto pb-2 font-mono">
            当前 {size.w}×{size.h}
          </span>
        </div>
      </div>

      <div className="panel panel-flush">
        <div className="px-5 pt-4 flex items-center justify-between border-b border-black/10 pb-3">
          <span className="label label-inline">实时预览</span>
          <span className="text-xs opacity-60 font-mono">{selectedId === 'custom' ? '自定义' : '预览'}</span>
        </div>
        <div
          ref={stageRef}
          className="stage"
          style={{ height: 520 }}
        >
          <div
            className="scale-box"
            style={{ width: Math.ceil(size.w * scale), height: Math.ceil(size.h * scale), padding: 12 }}
          >
            <div className="cover-scaler" style={{ transform: `scale(${scale})` }}>
              <div ref={currentRef} style={{ width: size.w, height: size.h }}>
                <Cover template={s.template} s={s} w={size.w} h={size.h} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="flex items-center gap-3 flex-wrap">
          <button type="button" className="btn" disabled={exporting} onClick={handleExportOne}>
            导出当前 PNG
          </button>
          <button type="button" className="btn btn-ghost" disabled={exporting} onClick={handleExportAll}>
            批量导出全部平台（ZIP）
          </button>
          {msg && <span className="text-sm font-bold">{msg}</span>}
        </div>
        <p className="mt-3 text-xs opacity-60 leading-relaxed">
          按所选比例精确尺寸导出高清 PNG。批量导出会按上方列表生成全部平台尺寸，并打包为 ZIP 下载。
        </p>
      </div>

      <div aria-hidden style={{ position: 'fixed', left: -99999, top: 0, pointerEvents: 'none' }}>
        {RATIO_PRESETS.map((p) => (
          <div key={p.id} id={`batch-${p.id}`} style={{ width: p.w, height: p.h }}>
            <Cover template={s.template} s={s} w={p.w} h={p.h} />
          </div>
        ))}
      </div>
    </div>
  )
}