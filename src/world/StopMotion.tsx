import { useEffect, useRef, useState } from 'react'
import { beats } from '../content/story'
import { FireBackdrop } from '../fx/FireBackdrop'
import { Electric } from '../fx/Electric'
import { onFrame, clamp } from '../fx/ticker'
import { useFx } from '../lib/fx'

const STEPS = 7 // stop-motion: each beat moves in 7 held poses
const hash = (n: number) => { const s = Math.sin(n * 127.1) * 43758.5453; return s - Math.floor(s) }

/** Chapter I opener: me, as red-ink stop-motion, telling you a short (true-ish) story. Scroll drives the frames. */
export function StopMotion() {
  const outer = useRef<HTMLElement>(null)
  const fig = useRef<HTMLDivElement>(null)
  const flash = useRef<HTMLDivElement>(null)
  const [beat, setBeat] = useState(0)
  const { level } = useFx()
  const still = level === 'min'

  useEffect(() => {
    if (still) return
    const o = outer.current!
    o.style.height = `${beats.length * 85 + 100}vh`
    let lastB = -1, lastStep = -1
    return onFrame(() => {
      const r = o.getBoundingClientRect()
      const span = r.height - innerHeight
      const p = span > 0 ? clamp(-r.top / span) : 0
      const fpos = p * beats.length
      const b = Math.min(beats.length - 1, Math.floor(fpos))
      const lp = clamp(fpos - b)
      const step = Math.floor(lp * STEPS)
      if (b !== lastB) {
        setBeat(b); lastB = b
        flash.current?.classList.remove('go'); void flash.current?.offsetWidth; flash.current?.classList.add('go')
      }
      if (step === lastStep && b === lastB) return
      lastStep = step
      const k = step / (STEPS - 1)
      const be = beats[b]
      const lerp = (i: number) => be.from[i] + (be.to[i] - be.from[i]) * k
      const j = (n: number) => (hash(b * 31 + step * 7 + n) - 0.5)
      const x = lerp(0) + j(1) * 2.2, y = lerp(1) + j(2) * 2, rot = lerp(2) + j(3) * 3, sc = lerp(3) * (1 + j(4) * 0.03)
      if (fig.current) fig.current.style.transform = `translate(${x}vw, ${y}vh) rotate(${rot}deg) scale(${sc})`
    })
  }, [still])

  const be = beats[beat]
  if (still) {
    return (
      <section id="person" className="stopmo is-still" aria-label="Chapter I: a short story about me">
        {beats.map((b) => (
          <figure key={b.line} className="stopmo-still"><img src={b.img} alt={b.alt} loading="lazy" /><figcaption><b className="display">{b.line}</b> <span className="serif">{b.sub}</span></figcaption></figure>
        ))}
      </section>
    )
  }
  return (
    <section id="person" ref={outer} className="stopmo" aria-label="Chapter I: a short story about me, told in stop-motion as you scroll">
      <div className="stopmo-stage">
        <FireBackdrop focus={be.focus ?? [0.5, 0.5]} seed={beat + 1} />
        <p className="mono stopmo-kicker">CHAPTER I — A SHORT STORY ABOUT ME · {String(beat + 1).padStart(2, '0')}/{String(beats.length).padStart(2, '0')}</p>
        <div className="stopmo-fig" ref={fig}>
          {beats.map((b, i) => <img key={i} src={b.img} alt={i === beat ? b.alt : ''} aria-hidden={i !== beat} style={{ opacity: i === beat ? 1 : 0 }} />)}
          {be.zap && <Electric bolts={5} />}
        </div>
        {be.sfx && <div key={'s' + beat} className="sfx display" aria-hidden="true">{be.sfx}</div>}
        <div key={'c' + beat} className="stopmo-cap" aria-live="polite">
          <p className="display">{be.line}</p>
          <p className="serif">{be.sub}</p>
        </div>
        <div className="stopmo-flash" ref={flash} aria-hidden="true" />
        <div className="stopmo-dots" aria-hidden="true">{beats.map((_, i) => <i key={i} data-on={i <= beat} />)}</div>
      </div>
    </section>
  )
}
