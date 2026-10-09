import { useCallback, useRef } from 'react'
import { HorizontalScene, useSceneProgress } from '../fx/HorizontalScene'
import { AsciiDevelop } from '../fx/AsciiDevelop'
import { specimens } from '../content/photos'

function TrackLine() {
  const path = useRef<SVGPathElement>(null)
  const dot = useRef<SVGCircleElement>(null)
  const on = useCallback((p: number) => {
    const el = path.current
    if (!el) return
    el.style.strokeDashoffset = String(1 - p)
    const len = el.getTotalLength()
    const pt = el.getPointAtLength(len * p)
    dot.current?.setAttribute('cx', String(pt.x))
    dot.current?.setAttribute('cy', String(pt.y))
  }, [])
  useSceneProgress(on)
  return (
    <svg className="track-line" viewBox="0 0 1000 100" preserveAspectRatio="none" aria-hidden="true">
      <path ref={path} pathLength={1} d="M0 70 C60 70 80 20 140 22 S220 90 300 80 S380 15 450 30 S540 92 620 76 S700 18 780 34 S880 88 1000 60" />
      <circle ref={dot} r="0.9" cx="0" cy="70" />
    </svg>
  )
}

function Counter() {
  const ref = useRef<HTMLSpanElement>(null)
  const bar = useRef<HTMLElement>(null)
  useSceneProgress(useCallback((p: number) => {
    const n = Math.min(specimens.length, Math.max(1, Math.round(p * (specimens.length + 1))))
    if (ref.current) ref.current.textContent = String(n).padStart(2, '0')
    if (bar.current) bar.current.style.transform = `scaleX(${p})`
  }, []))
  return (
    <div className="fg-counter mono" aria-hidden="true">
      SPECIMEN <span ref={ref}>01</span> / {String(specimens.length).padStart(2, '0')}
      <i><b ref={bar} /></i>
    </div>
  )
}

export function FieldGuide() {
  return (
    <HorizontalScene id="person" label="Chapter I, field notes on a human: six photographs" className="fieldguide" overlay={<Counter />}>
      <TrackLine />
      <div className="fg-frame fg-title">
        <p className="mono dim">CHAPTER I — THE PERSON</p>
        <h2 className="display"><span data-split>Field notes</span><br /><span data-split>on a human.</span></h2>
        <p className="serif lead">Six specimens, photographed in the wild and converted to ink, so he looks more serious than he is.</p>
        <p className="mono hint">keep scrolling ↓ — it goes sideways. trust it.</p>
      </div>
      {specimens.map((s, i) => (
        <figure key={s.n} className={`fg-frame fg-spec fg-${s.shape} ${i % 2 ? 'alt' : ''}`}>
          <div className="fg-print" style={{ ['--tilt' as string]: `${(i % 2 ? 1 : -1) * (1.2 + (i % 3) * 0.6)}deg` }}>
            <AsciiDevelop src={s.src} alt={s.alt} cell={s.shape === 'landscape' ? 8 : 9} />
            <span className="tape" aria-hidden="true" />
          </div>
          <img className="fg-ghost" data-speed={i % 2 ? '-0.06' : '0.08'} src={s.cut} alt="" aria-hidden="true" loading="lazy" />
          <figcaption>
            <span className="mono num">SPECIMEN {s.n}</span>
            <span className="display fg-name">{s.title}</span>
            <span className="serif fg-cap">{s.caption}</span>
            {s.note && <span className="hand fg-note">↖ {s.note}</span>}
          </figcaption>
        </figure>
      ))}
      <div className="fg-frame fg-exit">
        <p className="display">That’s the outside.</p>
        <p className="serif lead">The inside is written down below ↓</p>
      </div>
    </HorizontalScene>
  )
}
