import { useEffect, useRef } from 'react'
import { onFrame, clamp } from './ticker'
import { useFx } from '../lib/fx'

/** Things the worm must not crawl over. */
const AVOID = 'h2, h3, p, ul, ol, dl, form, figure, pre, .artifact, .strip-wrap, .algo-term, .hobby-board, .royal-stage, .makes li, .portrait, .contact-links, .filters, .post-card, .rejected, .ledger li, .cheer, .algo-cta, .snake-scroll, .person-title, .chapter-no'
/** Whole blocks it dives under. */
const BLOCK = '.stopmo, .hscene, .marquee'

type R = { x0: number; x1: number; y0: number; y1: number }

/**
 * A little yellow worm that crawls, hops and wiggles through the empty spaces of the page as you scroll down.
 * It follows a path built from the page's actual free space and only ever shows a short body (~150px).
 */
export function YellowLine({ targetSelector = '.world' }: { targetSelector?: string }) {
  const svg = useRef<SVGSVGElement>(null)
  const path = useRef<SVGPathElement>(null)
  const body = useRef<SVGPathElement>(null)
  const glow = useRef<SVGPathElement>(null)
  const head = useRef<SVGGElement>(null)
  const sparks = useRef<SVGGElement>(null)
  const { level } = useFx()

  useEffect(() => {
    const host = document.querySelector<HTMLElement>(targetSelector)
    if (!host || level === 'min') return
    let len = 0
    const occupied: R[] = [], blocks: R[] = []
    const inside = (x: number, y: number, list: R[]) => list.some((q) => x > q.x0 && x < q.x1 && y > q.y0 && y < q.y1)

    const build = () => {
      const W = host.clientWidth, H = host.scrollHeight
      const hb = host.getBoundingClientRect()
      svg.current!.setAttribute('viewBox', `0 0 ${W} ${H}`)
      svg.current!.style.height = H + 'px'
      occupied.length = 0; blocks.length = 0
      host.querySelectorAll<HTMLElement>(BLOCK).forEach((el) => { const r = el.getBoundingClientRect(); blocks.push({ x0: -20, x1: W + 20, y0: r.top - hb.top, y1: r.bottom - hb.top }) })
      const pad = 18
      host.querySelectorAll<HTMLElement>(AVOID).forEach((el) => {
        if (el.closest(BLOCK)) return
        const r = el.getBoundingClientRect()
        if (!r.width || !r.height) return
        occupied.push({ x0: r.left - hb.left - pad, x1: r.right - hb.left + pad, y0: r.top - hb.top - pad, y1: r.bottom - hb.top + pad })
      })
      const all = [...occupied, ...blocks]
      // walk down the page row by row, wandering between free spots
      const rowH = 150, step = 36
      let x = W * 0.85, rnd = 7
      const rand = () => { rnd = (rnd * 16807) % 2147483647; return rnd / 2147483647 }
      const pts: { x: number; y: number; hop: boolean }[] = [{ x, y: 0, hop: false }]
      for (let y = rowH; y < H - 40; y += rowH) {
        if (inside(W / 2, y, blocks)) continue // dive under big blocks
        const free: number[] = []
        for (let cx = 30; cx < W - 30; cx += step) if (!inside(cx, y, all)) free.push(cx)
        if (!free.length) continue
        const target = Math.max(30, Math.min(W - 30, x + (rand() - 0.5) * 520))
        const nx = free.reduce((a, b) => (Math.abs(b - target) < Math.abs(a - target) ? b : a))
        const prev = pts[pts.length - 1]
        const hop = Math.abs(nx - prev.x) > 260 || y - prev.y > rowH * 1.5
        pts.push({ x: nx, y, hop })
        // crawl a little sideways inside the same free gap
        const side = nx + (rand() < 0.5 ? -1 : 1) * (60 + rand() * 120)
        if (side > 30 && side < W - 30 && !inside(side, y + 30, all) && !inside((side + nx) / 2, y + 15, all)) pts.push({ x: side, y: y + 30, hop: false })
        x = pts[pts.length - 1].x
      }
      pts.push({ x: W * 0.5, y: H, hop: false })
      let d = `M${pts[0].x} ${pts[0].y}`
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1], b = pts[i]
        if (b.hop) { const lift = Math.min(220, 60 + Math.abs(b.x - a.x) * 0.35); d += ` Q${(a.x + b.x) / 2} ${Math.min(a.y, b.y) - lift} ${b.x} ${b.y}` }
        else { const my = (a.y + b.y) / 2; d += ` C${a.x} ${my} ${b.x} ${my} ${b.x} ${b.y}` }
      }
      path.current!.setAttribute('d', d)
      body.current!.setAttribute('d', d)
      glow.current!.setAttribute('d', d)
      len = path.current!.getTotalLength()
    }
    const t = window.setTimeout(build, 700)
    const ro = new ResizeObserver(() => { window.clearTimeout(rt); rt = window.setTimeout(build, 200) })
    let rt = 0
    ro.observe(host)

    let cur = 0, vis = 0, sparkI = 0
    const WORM = 190
    const off = onFrame((now) => {
      if (!len) return
      const top = host.getBoundingClientRect().top + scrollY
      const target = clamp((scrollY + innerHeight * 0.62 - top) / host.scrollHeight) * len
      const vel = (target - cur) * 0.07
      cur += vel // crawl, don't teleport
      const speed = Math.min(1, Math.abs(vel) / 25)
      const wig = Math.sin(now / 120) * (8 + speed * 18) + Math.sin(now / 900) * 22 // idle sway + excited wriggle
      const pos = Math.max(0, cur + wig)
      const dash = `${WORM} ${len + WORM}`
      for (const el of [body.current!, glow.current!]) { el.style.strokeDasharray = dash; el.style.strokeDashoffset = String(-(pos - WORM)) }
      const p = path.current!.getPointAtLength(pos)
      const q = path.current!.getPointAtLength(Math.max(0, pos - 6))
      const ang = Math.atan2(p.y - q.y, p.x - q.x) * 180 / Math.PI
      head.current!.setAttribute('transform', `translate(${p.x} ${p.y}) rotate(${ang})`)
      const hide = inside(p.x, p.y, blocks)
      vis += ((hide ? 0 : 1) - vis) * 0.15
      svg.current!.style.opacity = vis.toFixed(3)
      // sparks shed while it moves
      const sp = sparks.current!.children
      if (speed > 0.08 && Math.random() < speed) {
        const c = sp[sparkI++ % sp.length] as SVGCircleElement
        c.setAttribute('cx', String(p.x + (Math.random() - 0.5) * 16)); c.setAttribute('cy', String(p.y + (Math.random() - 0.5) * 16))
        c.style.transition = 'none'; c.style.opacity = '1'; c.style.transform = 'translate(0,0)'
        void c.getBoundingClientRect()
        c.style.transition = 'opacity 0.9s, transform 0.9s'; c.style.opacity = '0'; c.style.transform = `translate(${(Math.random() - 0.5) * 40}px, ${20 + Math.random() * 30}px)`
      }
      head.current!.querySelector('.yl-tongue')?.setAttribute('opacity', Math.sin(now / 90) > 0.2 ? '1' : '0')
    })
    return () => { off(); ro.disconnect(); clearTimeout(t); clearTimeout(rt) }
  }, [targetSelector, level])

  if (level === 'min') return null
  return (
    <svg ref={svg} className="yellow-line" aria-hidden="true">
      <path ref={path} fill="none" stroke="none" />
      <path ref={glow} className="yl-glow" />
      <path ref={body} className="yl-body" />
      <g ref={sparks}>{Array.from({ length: 14 }, (_, i) => <circle key={i} r={2 + (i % 3)} className="yl-spark" style={{ opacity: 0 }} />)}</g>
      <g ref={head} className="yl-head">
        <ellipse cx="2" cy="0" rx="9" ry="6.5" />
        <circle cx="5" cy="-3" r="1.6" className="yl-eye" /><circle cx="5" cy="3" r="1.6" className="yl-eye" />
        <path d="M11 0 L17 0 M17 0 L20 -3 M17 0 L20 3" className="yl-tongue" />
      </g>
    </svg>
  )
}
