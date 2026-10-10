import { useEffect, useRef, type RefObject } from 'react'
import { useFx } from '../lib/fx'

interface Pulse { pts: [number, number][]; seg: number; t: number; speed: number; col: string; w: number }

/**
 * Neurons: a faint network across the whole surface, light travelling round the borders,
 * and pulses that shoot through the character's brain (behind the drawing, never over the face).
 * `brain` is the element whose head the pulses aim at; the head is ~36% down its box.
 */
export function NeuronField({ brain, accent = '#ffd60a', headAt = 0.36 }: { brain: RefObject<HTMLElement | null>; accent?: string; headAt?: number }) {
  const cv = useRef<HTMLCanvasElement>(null)
  const { level } = useFx()
  useEffect(() => {
    const c = cv.current!, g = c.getContext('2d')!
    let W = 0, H = 0, nodes: [number, number][] = [], nbr: number[][] = []
    const build = () => {
      const r = c.parentElement!.getBoundingClientRect()
      const d = Math.min(devicePixelRatio || 1, 1.5)
      W = r.width; H = r.height
      c.width = W * d; c.height = H * d; c.style.width = W + 'px'; c.style.height = H + 'px'
      g.setTransform(d, 0, 0, d, 0, 0)
      const n = Math.round((W * H) / (level === 'full' ? 9000 : 16000))
      nodes = []
      for (let i = 0; i < n; i++) {
        // bias towards the borders
        const edge = Math.random() < 0.55
        let x = Math.random() * W, y = Math.random() * H
        if (edge) { if (Math.random() < 0.5) x = Math.random() < 0.5 ? Math.random() * W * 0.12 : W - Math.random() * W * 0.12; else y = Math.random() < 0.5 ? Math.random() * H * 0.12 : H - Math.random() * H * 0.12 }
        nodes.push([x, y])
      }
      nbr = nodes.map((p, i) => nodes.map((q, j) => [j, Math.hypot(p[0] - q[0], p[1] - q[1])] as [number, number]).filter(([j]) => j !== i).sort((a, b) => a[1] - b[1]).slice(0, 3).map(([j]) => j))
    }
    build()
    const ro = new ResizeObserver(build); ro.observe(c.parentElement!)

    const brainPt = (): [number, number] => {
      const b = brain.current, cr = c.getBoundingClientRect()
      if (!b) return [W * 0.35, H * 0.4]
      const r = b.getBoundingClientRect()
      return [r.left + r.width / 2 - cr.left, r.top + r.height * headAt - cr.top]
    }
    const pulses: Pulse[] = []
    const border = (): Pulse => {
      const m = 6, cw = Math.random() < 0.5
      const ring: [number, number][] = [[m, m], [W - m, m], [W - m, H - m], [m, H - m], [m, m]]
      const pts = cw ? ring : [...ring].reverse()
      return { pts, seg: Math.floor(Math.random() * 4), t: Math.random(), speed: 3 + Math.random() * 3, col: Math.random() < 0.6 ? '#ffd60a' : accent, w: 2.2 }
    }
    const strike = (): Pulse => {
      // greedy walk from a border node towards the brain, then out the other side
      const [bx, by] = brainPt()
      let i = Math.floor(Math.random() * nodes.length)
      const pts: [number, number][] = [nodes[i]]
      for (let k = 0; k < 6; k++) {
        const cur = nodes[i], dc = Math.hypot(cur[0] - bx, cur[1] - by)
        const nx = nbr[i].find((j) => Math.hypot(nodes[j][0] - bx, nodes[j][1] - by) < dc)
        if (nx === undefined) break
        i = nx; pts.push(nodes[i])
      }
      pts.push([bx + (Math.random() - 0.5) * 30, by + (Math.random() - 0.5) * 30])
      const a = Math.atan2(by - pts[0][1], bx - pts[0][0]) + (Math.random() - 0.5) * 0.8
      pts.push([bx + Math.cos(a) * Math.max(W, H), by + Math.sin(a) * Math.max(W, H)])
      return { pts, seg: 0, t: 0, speed: 8 + Math.random() * 6, col: Math.random() < 0.7 ? '#ffd60a' : accent, w: 3 }
    }
    for (let i = 0; i < 3; i++) pulses.push(border())

    let raf = 0, visible = true, flash = 0, last = 0, tt = 0
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting }); io.observe(c)
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      if (!visible || document.hidden) return
      const dt = Math.min(50, now - (last || now)); last = now; tt += dt / 1000
      g.clearRect(0, 0, W, H)
      // network, shimmering
      g.lineWidth = 0.6
      for (let i = 0; i < nodes.length; i++) {
        const [x, y] = nodes[i]
        for (const j of nbr[i]) { if (j < i) continue; g.strokeStyle = `rgba(255,214,10,${0.05 + 0.05 * Math.sin(tt * 2 + i)})`; g.beginPath(); g.moveTo(x, y); g.lineTo(nodes[j][0], nodes[j][1]); g.stroke() }
        g.fillStyle = `rgba(255,240,180,${0.15 + 0.35 * Math.max(0, Math.sin(tt * 3 + i * 1.7))})`
        g.fillRect(x - 1, y - 1, 2, 2)
      }
      // brain glow (behind the drawing)
      const [bx, by] = brainPt()
      if (flash > 0) {
        const gr = g.createRadialGradient(bx, by, 4, bx, by, 220)
        gr.addColorStop(0, `rgba(255,214,10,${0.5 * flash})`); gr.addColorStop(1, 'rgba(255,214,10,0)')
        g.fillStyle = gr; g.beginPath(); g.arc(bx, by, 220, 0, 6.283); g.fill()
        flash = Math.max(0, flash - dt / 400)
      }
      // spawn strikes
      if (level === 'full' ? Math.random() < 0.12 : Math.random() < 0.05) pulses.push(strike())
      // pulses
      g.lineCap = 'round'
      for (let p = pulses.length - 1; p >= 0; p--) {
        const q = pulses[p]
        let move = q.speed * (dt / 16)
        while (move > 0 && q.seg < q.pts.length - 1) {
          const a = q.pts[q.seg], b = q.pts[q.seg + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1
          const left = (1 - q.t) * L
          if (move < left) { q.t += move / L; move = 0 } else { move -= left; q.seg++; q.t = 0; if (q.seg === q.pts.length - 2 && q.w > 2.4) flash = 1 }
        }
        if (q.seg >= q.pts.length - 1) { if (q.w < 2.4) { pulses[p] = border() } else pulses.splice(p, 1); continue }
        // trail: walk backwards ~90px
        const a = q.pts[q.seg], b = q.pts[q.seg + 1]
        const hx = a[0] + (b[0] - a[0]) * q.t, hy = a[1] + (b[1] - a[1]) * q.t
        const trail: [number, number][] = [[hx, hy]]
        let need = 170, s = q.seg, px = hx, py = hy
        while (need > 0 && s >= 0) { const [sx, sy] = q.pts[s]; const d = Math.hypot(px - sx, py - sy); if (d >= need) { trail.push([px + (sx - px) * need / d, py + (sy - py) * need / d]); break } trail.push([sx, sy]); need -= d; px = sx; py = sy; s-- }
        g.strokeStyle = q.col; g.shadowColor = q.col; g.shadowBlur = 12
        for (let k = 1; k < trail.length; k++) { g.globalAlpha = 1 - k / trail.length * 0.8; g.lineWidth = q.w * (1 - k / (trail.length + 1)); g.beginPath(); g.moveTo(trail[k - 1][0], trail[k - 1][1]); g.lineTo(trail[k][0], trail[k][1]); g.stroke() }
        g.globalAlpha = 1; g.fillStyle = '#fffbe0'; g.beginPath(); g.arc(hx, hy, q.w, 0, 6.283); g.fill()
        g.shadowBlur = 0
      }
    }
    if (level === 'min') return () => { ro.disconnect(); io.disconnect() }
    raf = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect() }
  }, [brain, accent, level, headAt])
  return <canvas ref={cv} className="neurons" aria-hidden="true" />
}
