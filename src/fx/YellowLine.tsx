import { useEffect, useRef } from 'react'
import { onFrame, clamp } from './ticker'

/** One yellow thread that draws itself down the whole site as you scroll. */
export function YellowLine({ targetSelector = '.world' }: { targetSelector?: string }) {
  const svg = useRef<SVGSVGElement>(null)
  const path = useRef<SVGPathElement>(null)
  const dot = useRef<SVGCircleElement>(null)

  useEffect(() => {
    const host = document.querySelector<HTMLElement>(targetSelector)
    if (!host) return
    let len = 0
    const build = () => {
      const W = host.clientWidth, H = host.scrollHeight
      svg.current!.setAttribute('viewBox', `0 0 ${W} ${H}`)
      svg.current!.style.height = H + 'px'
      const secs = Array.from(host.querySelectorAll<HTMLElement>(':scope > section, :scope > .marquee'))
      const pts: [number, number][] = [[W * 0.9, 0]]
      secs.forEach((s, i) => {
        const y = s.offsetTop + Math.min(s.offsetHeight * 0.5, 700)
        pts.push([i % 2 ? W * 0.06 + 70 : W * 0.94, y])
      })
      pts.push([W * 0.5, H])
      let d = `M${pts[0][0]} ${pts[0][1]}`
      for (let i = 1; i < pts.length; i++) {
        const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]
        const my = (y0 + y1) / 2
        d += ` C${x0} ${my} ${x1} ${my} ${x1} ${y1}`
      }
      path.current!.setAttribute('d', d)
      len = path.current!.getTotalLength()
      path.current!.style.strokeDasharray = `${len}`
    }
    build()
    const ro = new ResizeObserver(build)
    ro.observe(host)
    let last = -1
    const off = onFrame(() => {
      const top = host.getBoundingClientRect().top + scrollY
      const p = clamp((scrollY + innerHeight * 0.75 - top) / host.scrollHeight)
      if (Math.abs(p - last) < 0.0005 || !len) return
      last = p
      path.current!.style.strokeDashoffset = String(len * (1 - p))
      const pt = path.current!.getPointAtLength(len * p)
      dot.current!.setAttribute('cx', String(pt.x))
      dot.current!.setAttribute('cy', String(pt.y))
    })
    return () => { off(); ro.disconnect() }
  }, [targetSelector])

  return (
    <svg ref={svg} className="yellow-line" aria-hidden="true">
      <path ref={path} />
      <circle ref={dot} r="6" />
    </svg>
  )
}
