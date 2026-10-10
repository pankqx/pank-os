import { useEffect, useRef } from 'react'
import { onFrame, clamp } from './ticker'
import { useFx } from '../lib/fx'

/**
 * The yellow live wire: one taut yellow string stretched across the whole screen.
 * It glides down the viewport as you scroll through the story, ripples when you scroll fast,
 * and you can pluck it with the cursor — it leans toward you, arcs a bolt, and sprays sparks.
 */
export function YellowWire() {
  const cv = useRef<HTMLCanvasElement>(null)
  const { level } = useFx()

  useEffect(() => {
    const c = cv.current
    if (!c || level === 'min') return
    const ctx = c.getContext('2d')!
    const N = 90
    let W = 0, H = 0, dpr = 1
    const y = new Float32Array(N), v = new Float32Array(N)
    const ptr = { x: -999, y: -999, px: -999, py: -999, on: false }
    let baseY = 0, lastScroll = scrollY, scrollV = 0, energy = 0
    const sparks: { x: number; y: number; vx: number; vy: number; life: number }[] = []

    const size = () => {
      dpr = Math.min(2, devicePixelRatio || 1)
      W = innerWidth; H = innerHeight
      c.width = W * dpr; c.height = H * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    size()
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      ptr.px = ptr.x; ptr.py = ptr.y; ptr.x = e.clientX; ptr.y = e.clientY; ptr.on = true
    }
    const onLeave = () => { ptr.on = false }
    addEventListener('resize', size)
    addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeave)

    const spark = (x: number, yy: number, n: number, power: number) => {
      for (let i = 0; i < n && sparks.length < 160; i++) {
        const a = Math.random() * Math.PI * 2
        sparks.push({ x, y: yy, vx: Math.cos(a) * power * (0.4 + Math.random()), vy: Math.sin(a) * power * (0.4 + Math.random()) - 1, life: 1 })
      }
    }

    const off = onFrame((now) => {
      const doc = document.documentElement
      const prog = clamp(scrollY / Math.max(1, doc.scrollHeight - innerHeight))
      const target = H * (0.14 + prog * 0.72)
      baseY += (target - baseY) * 0.06
      scrollV += ((scrollY - lastScroll) - scrollV) * 0.25
      lastScroll = scrollY
      // scroll shakes the wire
      const kick = clamp(Math.abs(scrollV) / 60) * 0.9
      if (kick > 0.05) {
        for (let i = 1; i < N - 1; i++) v[i] += Math.sin(i * 0.35 + now / 70) * kick * 1.2
      }
      // pointer pluck
      if (ptr.on) {
        const i = Math.round((ptr.x / W) * (N - 1))
        const wy = baseY + y[Math.max(0, Math.min(N - 1, i))]
        const d = ptr.y - wy
        if (Math.abs(d) < 90) {
          for (let k = -9; k <= 9; k++) {
            const j = i + k
            if (j < 1 || j >= N - 1) continue
            const w = Math.exp(-(k * k) / 28)
            v[j] += (d * 0.05 - y[j] * 0.02) * w
          }
          const crossed = (ptr.py - wy) * (ptr.y - wy) < 0
          const fast = Math.hypot(ptr.x - ptr.px, ptr.y - ptr.py)
          if (crossed || fast > 18) { spark(ptr.x, wy + y[Math.max(0, Math.min(N - 1, i))], crossed ? 8 : 2, 3 + fast * 0.08); energy = Math.min(1, energy + 0.35) }
        }
      }
      // string physics
      for (let i = 1; i < N - 1; i++) v[i] += (y[i - 1] + y[i + 1] - 2 * y[i]) * 0.42 - y[i] * 0.004
      for (let i = 1; i < N - 1; i++) { v[i] *= 0.965; y[i] += v[i] }
      y[0] = y[N - 1] = 0
      energy *= 0.94

      ctx.clearRect(0, 0, W, H)
      const pt = (i: number) => [(i / (N - 1)) * W, baseY + y[i]] as const
      const trace = () => {
        ctx.beginPath()
        let [px0, py0] = pt(0); ctx.moveTo(px0, py0)
        for (let i = 1; i < N; i++) { const [x1, y1] = pt(i); ctx.quadraticCurveTo(px0, py0, (px0 + x1) / 2, (py0 + y1) / 2); px0 = x1; py0 = y1 }
        ctx.lineTo(px0, py0)
      }
      const live = 0.55 + energy * 0.45
      ctx.lineCap = 'round'; ctx.lineJoin = 'round'
      ctx.globalAlpha = 0.35 * live; ctx.strokeStyle = '#ffd60a'; ctx.lineWidth = 12 + energy * 10; trace(); ctx.shadowColor = '#ffd60a'; ctx.shadowBlur = 24; ctx.stroke()
      ctx.shadowBlur = 0
      ctx.globalAlpha = 0.95; ctx.strokeStyle = '#ffe44d'; ctx.lineWidth = 3.2; trace(); ctx.stroke()
      ctx.globalAlpha = 1; ctx.strokeStyle = '#fffbe0'; ctx.lineWidth = 1.2; trace(); ctx.stroke()

      // a bead of current runs along the wire
      const bx = ((now / 2600) % 1) * W
      const bi = Math.round((bx / W) * (N - 1))
      ctx.fillStyle = '#fffbe0'; ctx.shadowColor = '#ffd60a'; ctx.shadowBlur = 22
      ctx.beginPath(); ctx.arc(bx, baseY + y[bi], 4.5, 0, 7); ctx.fill(); ctx.shadowBlur = 0

      // lightning from pointer to the wire when close
      if (ptr.on) {
        const i = Math.round((ptr.x / W) * (N - 1))
        const wy = baseY + y[Math.max(0, Math.min(N - 1, i))]
        const d = Math.abs(ptr.y - wy)
        if (d < 170 && d > 6) {
          ctx.strokeStyle = '#fffbe0'; ctx.shadowColor = '#ffd60a'; ctx.shadowBlur = 14
          ctx.lineWidth = 1.6; ctx.globalAlpha = 1 - d / 190
          ctx.beginPath(); ctx.moveTo(ptr.x, ptr.y)
          const steps = 7
          for (let s = 1; s < steps; s++) { const f = s / steps; ctx.lineTo(ptr.x + (Math.random() - 0.5) * 26, ptr.y + (wy - ptr.y) * f + (Math.random() - 0.5) * 8) }
          ctx.lineTo(ptr.x, wy); ctx.stroke(); ctx.shadowBlur = 0; ctx.globalAlpha = 1
        }
      }
      // sparks
      for (let k = sparks.length - 1; k >= 0; k--) {
        const s = sparks[k]
        s.x += s.vx; s.y += s.vy; s.vy += 0.16; s.life -= 0.03
        if (s.life <= 0) { sparks.splice(k, 1); continue }
        ctx.globalAlpha = s.life; ctx.fillStyle = '#ffe44d'; ctx.fillRect(s.x, s.y, 2.4, 2.4)
      }
      ctx.globalAlpha = 1
    })
    return () => { off(); removeEventListener('resize', size); removeEventListener('pointermove', onMove); document.removeEventListener('pointerleave', onLeave) }
  }, [level])

  if (level === 'min') return null
  return <canvas ref={cv} className="yellow-wire" aria-hidden="true" />
}
