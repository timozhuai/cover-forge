import { toPng } from 'html-to-image'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

export async function nodeToPngBlob(node, w, h) {
  const dataUrl = await toPng(node, {
    width: w,
    height: h,
    pixelRatio: 1,
    cacheBust: true,
    backgroundColor: undefined,
  })
  const res = await fetch(dataUrl)
  return res.blob()
}

export function safeName(str) {
  return (str || 'cover')
    .replace(/[\\/:*?"<>|\s]+/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 40)
}

export async function downloadOne(node, w, h, filename) {
  const blob = await nodeToPngBlob(node, w, h)
  saveAs(blob, filename)
}

export async function downloadZip(items, zipName) {
  const zip = new JSZip()
  for (const it of items) {
    const blob = await nodeToPngBlob(it.node, it.w, it.h)
    zip.file(it.filename, blob)
  }
  const content = await zip.generateAsync({ type: 'blob' })
  saveAs(content, zipName)
}