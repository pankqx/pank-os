import { useEffect, useRef } from 'react'
import { onFrame } from './ticker'

/** Kinetic type band; skews with scroll velocity. `tape` makes it yellow caution tape. */
export function Marquee({ text, tape = false, reverse = false }: { text: string; tape?: boolean; reverse?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    let lastY = scrollY, skew = 0
    return onFrame(() => {
      const v = scrollY - lastY
      lastY = scrollY
      skew += (Math.max(-12, Math.min(12, v * 0.25)) - skew) * 0.12
      if (ref.current) ref.current.style.setProperty('--skew', `${skew.toFixed(2)}deg`)
    })
  }, [])
  const items = Array.from({ length: 6 }, (_, i) => <span key={i}>{text}</span>)
  return (
    <div ref={ref} className={`marquee ${tape ? 'tape-band' : ''}`} aria-hidden="true">
      <div className={`marquee-track ${reverse ? 'rev' : ''}`}>{items}{items}</div>
    </div>
  )
}
