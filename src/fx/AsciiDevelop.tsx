import { useEffect, useRef } from 'react'
import { onFrame, clamp, smooth } from './ticker'
import { useFx } from '../lib/fx'

const RAMP = '@%#*+=-:. '
const SCR = '01<>/\\[]{}#%&*+=?'

/**
 * A photo that develops out of ASCII as it reaches the centre of the viewport, then hands over to the ink print.
 * Works inside pinned horizontal scenes and normal vertical flow (it only reads its own bounding box).
 */
export function AsciiDevelop({ src, alt, cell = 9, className = '', paper = true }: { src: string; alt: string; cell?: number; className?: string; paper?: boolean }) {
  const wrap = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const img = useRef<HTMLImageElement>(null)
  const { level } = useFx()

  useEffect(() => {
    const w = wrap.current!, c = canvas.current!, im = img.current!
    if (level === 'min') { im.style.opacity = '1'; c.style.opacity = '0'; return }
    const ctx = c.getContext('2d')!
    let lum: Float32Array | null = null, cols = 0, rows = 0, W = 0, H = 0
    let tick = 0, lastDev = -1

    const build = () => {
      const r = w.getBoundingClientRect()
      W = Math.max(1, Math.round(r.width)); H = Math.max(1, Math.round(r.height))
      const dpr = Math.min(devicePixelRatio || 1, 1.5)
      c.width = W * dpr; c.height = H * dpr
      c.style.width = W + 'px'; c.style.height = H + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const cw = cell * 0.6
      cols = Math.ceil(W / cw); rows = Math.ceil(H / cell)
      if (!im.complete || !im.naturalWidth) return
      const off = document.createElement('canvas')
      off.width = cols; off.height = rows
      const g = off.getContext('2d')!
      // object-fit: cover mapping
      const s = Math.max(cols * cw / im.naturalWidth, rows * cell / im.naturalHeight)
      const dw = im.naturalWidth * s / cw, dh = im.naturalHeight * s / cell
      g.drawImage(im, (cols - dw) / 2, (rows - dh) / 2, dw, dh)
      const d = g.getImageData(0, 0, cols, rows).data
      lum = new Float32Array(cols * rows)
      for (let i = 0; i < lum.length; i++) lum[i] = (d[i * 4] * 0.3 + d[i * 4 + 1] * 0.59 + d[i * 4 + 2] * 0.11) / 255
      lastDev = -1
    }
    if (im.complete) build(); else im.addEventListener('load', build, { once: true })
    const ro = new ResizeObserver(build)
    ro.observe(w)

    const draw = (dev: number) => {
      if (!lum) return
      ctx.fillStyle = paper ? '#e9e5da' : '#08090a'
      ctx.fillRect(0, 0, W, H)
      ctx.font = `${cell}px "JetBrains Mono Variable", monospace`
      ctx.textBaseline = 'top'
      ctx.fillStyle = paper ? '#151615' : '#ece7da'
      const cw = cell * 0.6
      tick++
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
        const L = lum[y * cols + x]
        const h = Math.sin(x * 12.99 + y * 78.23) * 43758.5
        const r = h - Math.floor(h)
        if (r > dev * 1.25) continue // not yet developed
        const settled = r < dev * 0.9
        const v = paper ? L : 1 - L
        const ch = settled ? RAMP[Math.min(RAMP.length - 1, Math.floor(v * RAMP.length))] : SCR[(x * 7 + y * 3 + tick) % SCR.length]
        if (ch !== ' ') ctx.fillText(ch, x * cw, y * cell)
      }
    }

    const off = onFrame(() => {
      const r = w.getBoundingClientRect()
      if (r.right < -200 || r.left > innerWidth + 200 || r.bottom < -200 || r.top > innerHeight + 200) return
      const dx = (r.left + r.width / 2 - innerWidth / 2) / innerWidth
      const dy = (r.top + r.height / 2 - innerHeight / 2) / innerHeight
      const dev = clamp(1.35 - Math.hypot(dx, dy) * 2.2)
      const photo = smooth((dev - 0.78) / 0.2)
      im.style.opacity = photo.toFixed(3)
      c.style.opacity = (1 - photo * 0.98).toFixed(3)
      if (Math.abs(dev - lastDev) > 0.004 || (dev > 0 && dev < 0.9 && tick % 3 === 0)) { draw(dev); lastDev = dev }
      else tick++
    })
    return () => { off(); ro.disconnect() }
  }, [src, cell, level, paper])

  return (
    <div ref={wrap} className={`develop ${className}`}>
      <img ref={img} src={src} alt={alt} loading="lazy" decoding="async" style={{ opacity: 0 }} />
      <canvas ref={canvas} aria-hidden="true" />
    </div>
  )
}
