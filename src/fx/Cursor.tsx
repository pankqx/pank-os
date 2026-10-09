import { useEffect, useRef } from 'react'
import { useFx } from '../lib/fx'

/**
 * Thunder cursor: a yellow bolt that shakes with speed and leaves a crackling lightning trail.
 * Fine pointers only; off with minimum effects. Text fields keep the normal text cursor.
 */
export function Cursor() {
  const bolt = useRef<HTMLDivElement>(null)
  const cv = useRef<HTMLCanvasElement>(null)
  const { level } = useFx()
  useEffect(() => {
    if (level === 'min' || !matchMedia('(pointer: fine)').matches) return
    const root = document.documentElement
    root.classList.add('has-cursor')
    const c = cv.current!, g = c.getContext('2d')!
    const size = () => { const d = Math.min(devicePixelRatio || 1, 2); c.width = innerWidth * d; c.height = innerHeight * d; g.setTransform(d, 0, 0, d, 0, 0) }
    size(); addEventListener('resize', size)
    const pts: { x: number; y: number; t: number }[] = []
    let x = -100, y = -100, px = x, py = y, shake = 0, hot = false, raf = 0, text = false
    const move = (e: PointerEvent) => {
      x = e.clientX; y = e.clientY
      const tgt = e.target as HTMLElement
      hot = !!tgt.closest?.('a, button, [role="link"], label, .piece, .artifact')
      text = !!tgt.closest?.('input, textarea')
      pts.push({ x, y, t: performance.now() })
      if (pts.length > 24) pts.shift()
    }
    const down = () => { shake = 30 }
    addEventListener('pointermove', move)
    addEventListener('pointerdown', down)
    const jag = (x0: number, y0: number, x1: number, y1: number, amp: number) => {
      g.moveTo(x0, y0)
      const n = 4
      for (let i = 1; i < n; i++) {
        const t = i / n
        g.lineTo(x0 + (x1 - x0) * t + (Math.random() - 0.5) * amp, y0 + (y1 - y0) * t + (Math.random() - 0.5) * amp)
      }
      g.lineTo(x1, y1)
    }
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      const v = Math.hypot(x - px, y - py)
      px = x; py = y
      shake = Math.min(40, shake * 0.82 + v * 0.35)
      const sx = (Math.random() - 0.5) * shake * 0.35, sy = (Math.random() - 0.5) * shake * 0.35
      const el = bolt.current!
      el.style.transform = `translate3d(${x + sx}px, ${y + sy}px, 0) rotate(${(Math.random() - 0.5) * shake * 0.6}deg) scale(${hot ? 1.5 : 1})`
      el.style.opacity = text ? '0' : '1'
      el.classList.toggle('charged', shake > 8 || hot)
      // lightning trail
      g.clearRect(0, 0, innerWidth, innerHeight)
      while (pts.length && now - pts[0].t > 220) pts.shift()
      if (pts.length > 1 && shake > 3) {
        g.lineCap = 'round'; g.lineJoin = 'bevel'
        for (const [w, col, blur] of [[5, 'rgba(255,214,10,0.25)', 14], [1.6, '#fff7c2', 6]] as const) {
          g.beginPath()
          for (let i = 1; i < pts.length; i++) jag(pts[i - 1].x, pts[i - 1].y, pts[i].x, pts[i].y, Math.min(26, shake * 0.8))
          g.strokeStyle = col; g.lineWidth = w; g.shadowColor = '#ffd60a'; g.shadowBlur = blur; g.stroke()
        }
        // forks
        if (shake > 18 && Math.random() < 0.5) {
          const p = pts[Math.floor(Math.random() * pts.length)]
          g.beginPath(); jag(p.x, p.y, p.x + (Math.random() - 0.5) * 80, p.y + (Math.random() - 0.5) * 80, 18)
          g.strokeStyle = '#ffd60a'; g.lineWidth = 1.2; g.stroke()
        }
        g.shadowBlur = 0
      }
    }
    raf = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(raf); removeEventListener('pointermove', move); removeEventListener('pointerdown', down); removeEventListener('resize', size); root.classList.remove('has-cursor') }
  }, [level])
  return (
    <>
      <canvas ref={cv} className="cursor-trail" aria-hidden="true" />
      <div ref={bolt} className="cursor-bolt" aria-hidden="true">
        <svg viewBox="0 0 24 32" width="22" height="30"><path d="M3 1 L15 1 L10 12 L19 12 L5 31 L9 17 L1 17 Z" /></svg>
      </div>
    </>
  )
}
