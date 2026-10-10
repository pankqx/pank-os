import { useEffect, useRef } from 'react'
import { onFrame, clamp } from './ticker'
import { useFx } from '../lib/fx'

/**
 * A glass pipe down the right edge of the screen. As you scroll, current fills it from the top;
 * a lightning bolt crackles inside it down to the fill front, harder when you scroll fast.
 */
export function PowerPipe() {
  const cv = useRef<HTMLCanvasElement>(null)
  const { level } = useFx()

  useEffect(() => {
    const c = cv.current
    if (!c || level === 'min') return
    const ctx = c.getContext('2d')!
    let W = 0, H = 0
    const size = () => {
      const dpr = Math.min(2, devicePixelRatio || 1)
      const r = c.getBoundingClientRect()
      W = r.width; H = r.height
      c.width = W * dpr; c.height = H * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    size()
    addEventListener('resize', size)

    let fill = 0, lastY = scrollY, vel = 0, lastSeed = 0
    let bolt: number[] = [], branch: { y: number; pts: number[] }[] = []
    const sparks: { x: number; y: number; vx: number; vy: number; l: number }[] = []
    const cx = () => W / 2
    const tubeW = () => Math.min(10, W * 0.42)

    const reseed = (front: number, power: number) => {
      bolt = []
      const n = Math.max(4, Math.round(front / 14))
      for (let i = 0; i <= n; i++) bolt.push((Math.random() - 0.5) * (tubeW() * 0.8) * (i === 0 || i === n ? 0.2 : 1))
      branch = []
      const nb = Math.random() < 0.35 + power * 0.5 ? 1 + Math.floor(Math.random() * 2) : 0
      for (let b = 0; b < nb; b++) branch.push({ y: Math.random() * front, pts: [Math.random() < 0.5 ? -1 : 1, 0.4 + Math.random() * 0.6] })
    }

    const off = onFrame((now) => {
      const doc = document.documentElement
      const p = clamp(scrollY / Math.max(1, doc.scrollHeight - innerHeight))
      vel += (Math.abs(scrollY - lastY) - vel) * 0.2
      lastY = scrollY
      fill += (p - fill) * 0.12
      const power = clamp(vel / 50)
      const top = 14, bot = H - 14, len = bot - top
      const front = len * fill
      if (now - lastSeed > 70 - power * 40) { lastSeed = now; reseed(front, power) }

      ctx.clearRect(0, 0, W, H)
      const x = cx(), tw = tubeW()
      // glass tube
      const tube = () => { ctx.beginPath(); ctx.roundRect(x - tw / 2 - 3, top - 6, tw + 6, len + 12, 8) }
      tube(); ctx.fillStyle = 'rgba(236,231,218,0.04)'; ctx.fill()
      tube(); ctx.strokeStyle = 'rgba(236,231,218,0.28)'; ctx.lineWidth = 1.2; ctx.stroke()
      ctx.strokeStyle = 'rgba(236,231,218,0.35)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x - tw / 2 - 0.5, top + 4); ctx.lineTo(x - tw / 2 - 0.5, bot - 4); ctx.stroke()
      // fill (liquid current)
      if (front > 1) {
        const g = ctx.createLinearGradient(0, top, 0, top + front)
        g.addColorStop(0, 'rgba(255,214,10,0.18)'); g.addColorStop(1, 'rgba(255,214,10,0.7)')
        ctx.fillStyle = g; ctx.shadowColor = '#ffd60a'; ctx.shadowBlur = 12
        ctx.beginPath(); ctx.roundRect(x - tw / 2, top, tw, front, 4); ctx.fill(); ctx.shadowBlur = 0
      }
      // lightning inside the lit part
      if (front > 6 && bolt.length) {
        const step = front / (bolt.length - 1)
        ctx.lineJoin = 'round'; ctx.lineCap = 'round'
        const draw = (w: number, col: string, blur: number) => {
          ctx.strokeStyle = col; ctx.lineWidth = w; ctx.shadowColor = '#ffd60a'; ctx.shadowBlur = blur
          ctx.beginPath()
          bolt.forEach((o, i) => { const yy = top + i * step; i ? ctx.lineTo(x + o, yy) : ctx.moveTo(x + o, yy) })
          ctx.stroke()
        }
        draw(3, 'rgba(255,214,10,0.55)', 14); draw(1.2, '#fffbe0', 4)
        ctx.shadowBlur = 0
        // branches that touch the glass
        ctx.strokeStyle = 'rgba(255,251,224,0.8)'; ctx.lineWidth = 1
        branch.forEach((b) => {
          const i = Math.min(bolt.length - 1, Math.round((b.y / front) * (bolt.length - 1)))
          const sx = x + bolt[i], sy = top + i * step
          ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + b.pts[0] * tw * 0.5, sy + 5 * b.pts[1]); ctx.lineTo(sx + b.pts[0] * tw * 0.8, sy + 11 * b.pts[1]); ctx.stroke()
        })
      }
      // front: bright head + sparks
      const fy = top + front
      ctx.fillStyle = '#fffbe0'; ctx.shadowColor = '#ffd60a'; ctx.shadowBlur = 18
      ctx.beginPath(); ctx.arc(x, fy, 4 + power * 3, 0, 7); ctx.fill(); ctx.shadowBlur = 0
      if (Math.random() < 0.25 + power) sparks.push({ x, y: fy, vx: (Math.random() - 0.5) * 2.2, vy: Math.random() * 1.6 - 0.4, l: 1 })
      for (let k = sparks.length - 1; k >= 0; k--) {
        const s = sparks[k]
        s.x += s.vx; s.y += s.vy; s.l -= 0.04
        if (s.l <= 0) { sparks.splice(k, 1); continue }
        ctx.globalAlpha = s.l; ctx.fillStyle = '#ffe44d'; ctx.fillRect(s.x, s.y, 2, 2)
      }
      ctx.globalAlpha = 1
      // unlit part: faint idle crackle
      if (Math.random() < 0.06 && fy < bot - 30) {
        const y0 = fy + 10 + Math.random() * (bot - fy - 24)
        ctx.strokeStyle = 'rgba(255,214,10,0.35)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x - tw / 2, y0); ctx.lineTo(x + (Math.random() - 0.5) * tw, y0 + 4); ctx.lineTo(x + tw / 2, y0 + 8); ctx.stroke()
      }
      // flanges
      ctx.fillStyle = 'rgba(236,231,218,0.5)'
      for (const yy of [top - 8, bot + 8]) { ctx.beginPath(); ctx.roundRect(x - tw / 2 - 5, yy - 2, tw + 10, 4, 2); ctx.fill() }
    })
    return () => { off(); removeEventListener('resize', size) }
  }, [level])

  if (level === 'min') return null
  return <canvas ref={cv} className="power-pipe" aria-hidden="true" />
}
