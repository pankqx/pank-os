import { useEffect, useRef } from 'react'
import { useFx } from '../lib/fx'

/**
 * Red ink splatter + white speed lines + embers, redrawn ~11 times a second so it "boils" like stop-motion.
 * Fills its positioned parent. Pauses off-screen; one still frame with minimum effects.
 */
export function FireBackdrop({ intensity = 1, focus = [0.62, 0.5] as [number, number], seed = 1 }: { intensity?: number; focus?: [number, number]; seed?: number }) {
  const cv = useRef<HTMLCanvasElement>(null)
  const { level } = useFx()
  useEffect(() => {
    const c = cv.current!, g = c.getContext('2d')!
    let W = 0, H = 0, visible = true, raf = 0, last = 0, frame = seed * 97
    const size = () => {
      const r = c.parentElement!.getBoundingClientRect()
      const d = Math.min(devicePixelRatio || 1, level === 'full' ? 1.5 : 1)
      W = r.width; H = r.height
      c.width = W * d; c.height = H * d; c.style.width = W + 'px'; c.style.height = H + 'px'
      g.setTransform(d, 0, 0, d, 0, 0)
    }
    size()
    const ro = new ResizeObserver(size); ro.observe(c.parentElement!)
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting }); io.observe(c)
    let rs = 1
    const rnd = () => { rs = (rs * 16807) % 2147483647; return rs / 2147483647 }
    const draw = () => {
      rs = 1 + (frame % 3) * 7919 + seed * 31 // only 3 "drawings" that alternate: classic boil
      const fx = W * focus[0], fy = H * focus[1]
      g.fillStyle = '#060404'; g.fillRect(0, 0, W, H)
      // red glow
      const rg = g.createRadialGradient(fx, fy, 10, fx, fy, Math.max(W, H) * 0.65)
      rg.addColorStop(0, `rgba(200,16,40,${0.55 * intensity})`); rg.addColorStop(0.45, `rgba(120,8,22,${0.35 * intensity})`); rg.addColorStop(1, 'rgba(0,0,0,0)')
      g.fillStyle = rg; g.fillRect(0, 0, W, H)
      // splatter clusters
      for (let k = 0; k < 9 * intensity; k++) {
        const a = rnd() * Math.PI * 2, d = (0.15 + rnd() * 0.5) * Math.min(W, H)
        const cx = fx + Math.cos(a) * d * 1.4, cy = fy + Math.sin(a) * d
        const n = 18 + rnd() * 40
        g.fillStyle = rnd() > 0.25 ? `rgba(214,20,48,${0.55 + rnd() * 0.4})` : `rgba(120,6,20,0.8)`
        for (let i = 0; i < n; i++) {
          const rr = Math.pow(rnd(), 2.2) * 26 + 1.2
          const px = cx + (rnd() - 0.5) * 220 * rnd(), py = cy + (rnd() - 0.5) * 160 * rnd()
          g.beginPath(); g.ellipse(px, py, rr * (0.6 + rnd()), rr, rnd() * 3, 0, 6.283); g.fill()
          if (rnd() > 0.93) { g.fillRect(px - 1, py, 2 + rnd() * 2, 30 + rnd() * 90) } // drip
        }
      }
      // speed lines
      g.strokeStyle = 'rgba(255,255,255,0.75)'
      for (let i = 0; i < 70; i++) {
        const a = rnd() * Math.PI * 2, r0 = Math.min(W, H) * (0.28 + rnd() * 0.25), r1 = r0 + Math.max(W, H) * (0.2 + rnd() * 0.6)
        g.lineWidth = 0.6 + rnd() * 2.2
        g.globalAlpha = 0.25 + rnd() * 0.6
        g.beginPath(); g.moveTo(fx + Math.cos(a) * r0, fy + Math.sin(a) * r0); g.lineTo(fx + Math.cos(a) * r1, fy + Math.sin(a) * r1); g.stroke()
      }
      g.globalAlpha = 1
      // embers
      for (let i = 0; i < 40; i++) {
        const x = rnd() * W, y = (rnd() * H - (frame * 9 * (0.5 + rnd()))) % H
        g.fillStyle = rnd() > 0.5 ? '#ffd60a' : '#ff4b2b'
        g.fillRect(x, y < 0 ? y + H : y, 2, 2)
      }
      // grain
      for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(255,255,255,${rnd() * 0.05})`; g.fillRect(rnd() * W, rnd() * H, 1.5, 1.5) }
    }
    if (level === 'min') { draw(); return () => { ro.disconnect(); io.disconnect() } }
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      if (!visible || document.hidden || now - last < 90) return
      last = now; frame++
      draw()
    }
    raf = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect() }
  }, [level, intensity, focus[0], focus[1], seed])
  return <canvas ref={cv} className="fire-bg" aria-hidden="true" />
}
