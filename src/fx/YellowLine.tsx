import { useEffect, useRef } from 'react'
import { onFrame, clamp } from './ticker'

/** Content the line must never cross: it ducks behind these and reappears in the empty space after. */
const AVOID = 'h2, h3, p, ul, ol, dl, form, figure, pre, .artifact, .strip-wrap, .algo-term, .hobby-board, .royal-stage, .makes li, .portrait, .contact-links, .filters, .post-card, .rejected, .ledger li, .cheer, .algo-cta, .snake-scroll, .person-title'
const BLOCK = '.stopmo, .hscene, .marquee'

/** One yellow thread down the site — visible only in the gaps between things, so it "jumps" from space to space. */
export function YellowLine({ targetSelector = '.world' }: { targetSelector?: string }) {
  const svg = useRef<SVGSVGElement>(null)
  const path = useRef<SVGPathElement>(null)
  const dot = useRef<SVGCircleElement>(null)
  const holes = useRef<SVGGElement>(null)

  useEffect(() => {
    const host = document.querySelector<HTMLElement>(targetSelector)
    if (!host) return
    let len = 0
    const rects: { y0: number; y1: number; x0: number; x1: number }[] = []
    const build = () => {
      const W = host.clientWidth, H = host.scrollHeight
      const hb = host.getBoundingClientRect()
      svg.current!.setAttribute('viewBox', `0 0 ${W} ${H}`)
      svg.current!.style.height = H + 'px'
      const secs = Array.from(host.querySelectorAll<HTMLElement>(':scope > section, :scope > .marquee'))
      const pts: [number, number][] = [[W * 0.92, 0]]
      secs.forEach((s, i) => pts.push([i % 2 ? W * 0.04 : W * 0.96, s.offsetTop + Math.min(s.offsetHeight * 0.5, 700)]))
      pts.push([W * 0.5, H])
      let d = `M${pts[0][0]} ${pts[0][1]}`
      for (let i = 1; i < pts.length; i++) {
        const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], my = (y0 + y1) / 2
        d += ` C${x0} ${my} ${x1} ${my} ${x1} ${y1}`
      }
      path.current!.setAttribute('d', d)
      len = path.current!.getTotalLength()
      path.current!.style.strokeDasharray = `${len}`
      // holes over content
      rects.length = 0
      const pad = 22
      host.querySelectorAll<HTMLElement>(BLOCK).forEach((el) => { const r = el.getBoundingClientRect(); rects.push({ x0: -10, x1: W + 10, y0: r.top - hb.top - 10, y1: r.bottom - hb.top + 10 }) })
      host.querySelectorAll<HTMLElement>(AVOID).forEach((el) => {
        if (el.closest(BLOCK)) return
        const r = el.getBoundingClientRect()
        if (!r.width || !r.height) return
        rects.push({ x0: r.left - hb.left - pad, x1: r.right - hb.left + pad, y0: r.top - hb.top - pad, y1: r.bottom - hb.top + pad })
      })
      holes.current!.innerHTML = rects.map((q) => `<rect x="${q.x0}" y="${q.y0}" width="${q.x1 - q.x0}" height="${q.y1 - q.y0}" rx="12" />`).join('')
    }
    const t = window.setTimeout(build, 600)
    const ro = new ResizeObserver(() => build())
    ro.observe(host)
    let last = -1
    const off = onFrame(() => {
      const top = host.getBoundingClientRect().top + scrollY
      const p = clamp((scrollY + innerHeight * 0.7 - top) / host.scrollHeight)
      if (Math.abs(p - last) < 0.0004 || !len) return
      last = p
      path.current!.style.strokeDashoffset = String(len * (1 - p))
      const pt = path.current!.getPointAtLength(len * p)
      dot.current!.setAttribute('cx', String(pt.x))
      dot.current!.setAttribute('cy', String(pt.y))
      const hidden = rects.some((q) => pt.x > q.x0 && pt.x < q.x1 && pt.y > q.y0 && pt.y < q.y1)
      dot.current!.style.opacity = hidden ? '0' : '1'
    })
    return () => { off(); ro.disconnect(); clearTimeout(t) }
  }, [targetSelector])

  return (
    <svg ref={svg} className="yellow-line" aria-hidden="true">
      <defs>
        <mask id="yl-mask" maskUnits="userSpaceOnUse" x="-100" y="-100" width="100000" height="1000000">
          <rect x="-100" y="-100" width="100000" height="1000000" fill="#fff" />
          <g ref={holes} fill="#000" />
        </mask>
      </defs>
      <g mask="url(#yl-mask)">
        <path ref={path} />
        <circle ref={dot} r="7" />
      </g>
    </svg>
  )
}
