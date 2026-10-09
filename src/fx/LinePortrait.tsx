import { useEffect, useRef, useState } from 'react'

/** My portrait, drawn with lines (traced from a photo by scripts/lines.py). Draws itself when it scrolls into view. */
export function LinePortrait({ src, label }: { src: string; label: string }) {
  const host = useRef<HTMLDivElement>(null)
  const [svg, setSvg] = useState('')
  useEffect(() => { fetch(src).then((r) => (r.ok ? r.text() : '')).then((t) => setSvg(t.startsWith('<svg') ? t : '')).catch(() => {}) }, [src])
  useEffect(() => {
    const el = host.current
    if (!el || !svg) return
    el.querySelectorAll('path').forEach((p, i) => (p as SVGPathElement).style.setProperty('--i', String(i)))
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add('draw'); io.disconnect() } }, { threshold: 0.3 })
    io.observe(el)
    return () => io.disconnect()
  }, [svg])
  return <div ref={host} className="line-portrait" role="img" aria-label={label} dangerouslySetInnerHTML={{ __html: svg }} />
}
