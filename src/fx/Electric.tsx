import { useEffect, useRef } from 'react'
import { useFx } from '../lib/fx'

/** Yellow electricity crawling over whatever it is placed on (fills its positioned parent). */
export function Electric({ bolts = 4, rate = 85, color = '#ffd60a' }: { bolts?: number; rate?: number; color?: string }) {
  const svg = useRef<SVGSVGElement>(null)
  const { level } = useFx()
  useEffect(() => {
    if (level === 'min') return
    const s = svg.current!
    const paths = Array.from(s.querySelectorAll('path'))
    let raf = 0, last = 0, visible = true
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting }); io.observe(s)
    const bolt = () => {
      // random jagged walk between two points on the box edge, biased through the middle
      const side = () => { const t = Math.random(); const e = Math.floor(Math.random() * 4); return e === 0 ? [t * 100, 6] : e === 1 ? [94, t * 100] : e === 2 ? [t * 100, 96] : [6, t * 100] }
      const [x0, y0] = side(), [x1, y1] = side()
      const mx = 30 + Math.random() * 40, my = 25 + Math.random() * 50
      let d = `M${x0} ${y0}`
      const seg = 9
      for (let i = 1; i <= seg; i++) {
        const t = i / seg
        const bx = t < 0.5 ? x0 + (mx - x0) * t * 2 : mx + (x1 - mx) * (t - 0.5) * 2
        const by = t < 0.5 ? y0 + (my - y0) * t * 2 : my + (y1 - my) * (t - 0.5) * 2
        d += ` L${(bx + (Math.random() - 0.5) * 9).toFixed(1)} ${(by + (Math.random() - 0.5) * 9).toFixed(1)}`
      }
      return d
    }
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      if (!visible || now - last < rate) return
      last = now
      paths.forEach((p) => {
        if (Math.random() < 0.45) { p.setAttribute('d', bolt()); p.style.opacity = String(0.5 + Math.random() * 0.5) }
        else p.style.opacity = String(Math.max(0, parseFloat(p.style.opacity || '0') - 0.45))
      })
    }
    raf = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(raf); io.disconnect() }
  }, [level, rate])
  if (level === 'min') return null
  return (
    <svg ref={svg} className="electric" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      {Array.from({ length: bolts }, (_, i) => <path key={i} stroke={color} />)}
    </svg>
  )
}
