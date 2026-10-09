import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { useFx } from '../lib/fx'

export interface FireworksHandle { burst: (x: number, y: number, big?: boolean) => void; show: (n?: number) => void }
const COLORS = ['#ffd60a', '#c8ff2e', '#ff4b2b', '#ece7da', '#ff6a3d']

interface P { x: number; y: number; vx: number; vy: number; life: number; max: number; c: string; trail: [number, number][]; rocket?: { tx: number; ty: number; big: boolean } }

/** Crackers. Fixed full-screen canvas, idle (no rAF) until something explodes. */
export const Fireworks = forwardRef<FireworksHandle>(function Fireworks(_, ref) {
  const cv = useRef<HTMLCanvasElement>(null)
  const parts = useRef<P[]>([])
  const raf = useRef(0)
  const { level } = useFx()

  const run = () => {
    if (raf.current) return
    const c = cv.current!, g = c.getContext('2d')!
    const step = () => {
      const W = c.width, H = c.height, dpr = Math.min(devicePixelRatio || 1, 2)
      g.globalCompositeOperation = 'destination-out'
      g.fillStyle = 'rgba(0,0,0,0.22)'
      g.fillRect(0, 0, W, H)
      g.globalCompositeOperation = 'lighter'
      const next: P[] = []
      for (const p of parts.current) {
        if (p.rocket) {
          p.x += (p.rocket.tx - p.x) * 0.09; p.y += (p.rocket.ty - p.y) * 0.09
          g.fillStyle = '#ffd60a'; g.fillRect(p.x * dpr - 2, p.y * dpr - 2, 4, 4)
          if (Math.abs(p.y - p.rocket.ty) < 4) explode(p.x, p.y, p.rocket.big)
          else next.push(p)
          continue
        }
        p.vy += 0.06; p.vx *= 0.985; p.vy *= 0.985
        p.x += p.vx; p.y += p.vy; p.life++
        const a = 1 - p.life / p.max
        if (a <= 0) continue
        g.strokeStyle = p.c; g.globalAlpha = a; g.lineWidth = 2 * dpr
        g.beginPath(); g.moveTo((p.x - p.vx * 2.4) * dpr, (p.y - p.vy * 2.4) * dpr); g.lineTo(p.x * dpr, p.y * dpr); g.stroke()
        if (Math.random() < 0.06) { g.fillStyle = '#fff'; g.fillRect(p.x * dpr, p.y * dpr, 2 * dpr, 2 * dpr) }
        next.push(p)
      }
      g.globalAlpha = 1
      parts.current = next
      raf.current = next.length ? requestAnimationFrame(step) : 0
      if (!next.length) g.clearRect(0, 0, W, H)
    }
    raf.current = requestAnimationFrame(step)
  }
  const explode = (x: number, y: number, big = true) => {
    const n = big ? 90 : 34
    const c1 = COLORS[Math.floor(Math.random() * COLORS.length)], c2 = COLORS[Math.floor(Math.random() * COLORS.length)]
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + Math.random() * 0.2
      const s = (big ? 3.2 : 2) * (0.55 + Math.random() * 0.6)
      parts.current.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0, max: 50 + Math.random() * 40, c: i % 3 ? c1 : c2, trail: [] })
    }
  }

  useImperativeHandle(ref, () => ({
    burst(x, y, big = false) {
      if (level === 'min') return
      explode(x, y, big); run()
    },
    show(n = 6) {
      if (level === 'min') return
      for (let i = 0; i < n; i++) {
        setTimeout(() => {
          const tx = innerWidth * (0.15 + Math.random() * 0.7), ty = innerHeight * (0.15 + Math.random() * 0.35)
          parts.current.push({ x: tx + (Math.random() - 0.5) * 80, y: innerHeight + 10, vx: 0, vy: 0, life: 0, max: 1, c: '#ffd60a', trail: [], rocket: { tx, ty, big: true } })
          run()
        }, i * 260)
      }
    },
  }), [level])

  useEffect(() => {
    const c = cv.current!
    const size = () => { const d = Math.min(devicePixelRatio || 1, 2); c.width = innerWidth * d; c.height = innerHeight * d }
    size()
    addEventListener('resize', size)
    return () => { removeEventListener('resize', size); cancelAnimationFrame(raf.current) }
  }, [])

  return <canvas ref={cv} className="fireworks" aria-hidden="true" />
})
