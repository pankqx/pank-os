import { useEffect, useRef, useState } from 'react'
import { projectBySlug } from '../content/projects'
import { Electric } from '../fx/Electric'

const STATS = [
  { n: 52, s: '', label: 'modules' },
  { n: 400, s: '+', label: 'lessons' },
  { n: 900, s: '+', label: 'problems' },
  { n: 1150, s: '+', label: 'quiz questions' },
  { n: 60, s: '', label: 'patterns' },
  { n: 0, s: '', label: 'servers — Python runs in your browser' },
]
const CODE = ['def two_sum(nums, target):', '    seen = {}', '    for i, x in enumerate(nums):', '        if target - x in seen:', '            return [seen[target - x], i]', '        seen[x] = i']

/** The product I'm proudest of right now, given the stage it deserves. */
export function ProntoPy() {
  const p = projectBySlug('prontopy')!
  const box = useRef<HTMLDivElement>(null)
  const [on, setOn] = useState(false)
  const [typed, setTyped] = useState(0)
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect() } }, { threshold: 0.3 })
    if (box.current) io.observe(box.current)
    return () => io.disconnect()
  }, [])
  useEffect(() => {
    if (!on) return
    const total = CODE.join('\n').length
    const id = window.setInterval(() => setTyped((t) => (t >= total + 40 ? 0 : t + 2)), 40)
    return () => clearInterval(id)
  }, [on])
  const full = CODE.join('\n')
  const shown = full.slice(0, typed)
  const done = typed >= full.length

  return (
    <section id="prontopy" className="chapter algo" aria-labelledby="algo-h" ref={box}>
      <div className="algo-grid">
        <div>
          <p className="mono dim">NOW BUILDING — MY FAVOURITE PRODUCT</p>
          <h2 id="algo-h" className="display">ProntoPy</h2>
          <p className="serif lead">{p.kicker}</p>
          <p className="serif algo-why">{p.why}</p>
          <ul className="algo-stats">
            {STATS.map((s, i) => (
              <li key={s.label} style={{ ['--i' as string]: i }}>
                <b className="display">{on ? <Count to={s.n} /> : 0}{s.s}</b>
                <span className="mono">{s.label}</span>
              </li>
            ))}
          </ul>
          <div className="algo-cta">
            <a className="mono btn-y" href={p.cta!.href}>{p.cta!.label} →</a>
            <a className="mono btn-o" href="#lab/prontopy">how it works</a>
          </div>
          <p className="mono dim sm">{p.statusNote}</p>
        </div>
        <div className="algo-term" aria-label="Animated example: a solution being typed and accepted">
          <div className="term-bar mono"><i /><i /><i /> two_sum.py — ProntoPy judge · example run</div>
          <pre className="mono">{shown}<span className="caret-t" /></pre>
          <div className={`verdict-box mono ${done ? 'ok' : ''}`}>{done ? '✓ Accepted · 57/57 tests · 0.03s' : 'running tests…'}{done && <Electric bolts={3} />}</div>
        </div>
      </div>
    </section>
  )
}

function Count({ to }: { to: number }) {
  const [v, setV] = useState(0)
  useEffect(() => {
    const t0 = performance.now()
    let raf = 0
    const f = (now: number) => { const k = Math.min(1, (now - t0) / 1400); setV(Math.round(to * (1 - Math.pow(1 - k, 3)))); if (k < 1) raf = requestAnimationFrame(f) }
    raf = requestAnimationFrame(f)
    return () => cancelAnimationFrame(raf)
  }, [to])
  return <>{v.toLocaleString('en-IN')}</>
}
