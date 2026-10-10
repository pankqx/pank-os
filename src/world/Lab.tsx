import { useCallback, useEffect, useRef, useState } from 'react'
import { projects } from '../content/projects'
import { Art } from './Art'

const STATUS: Record<string, string> = { shipped: 'COMPLETED', 'in-progress': 'IN PROGRESS', experimental: 'EXPERIMENTAL', concept: 'CONCEPT', archived: 'ARCHIVED' }
const pad = (n: number) => String(n).padStart(2, '0')

/** Every project, one at a time. A yellow shutter sweeps across, the art slides through a film gate, the counter rolls. */
export function Lab() {
  const list = [...projects.filter((p) => p.featured), ...projects.filter((p) => !p.featured)]
  const n = list.length
  const [i, setI] = useState(0)
  const [dir, setDir] = useState<1 | -1>(1)
  const [tick, setTick] = useState(0) // restarts animations even if same slide
  const stage = useRef<HTMLDivElement>(null)

  const go = useCallback((to: number, d?: 1 | -1) => {
    setI((cur) => {
      const next = ((to % n) + n) % n
      if (next === cur) return cur
      setDir(d ?? (next > cur ? 1 : -1))
      setTick((t) => t + 1)
      return next
    })
  }, [n])
  const step = useCallback((d: 1 | -1) => go(i + d, d), [go, i])

  // swipe on touch + arrow keys while the stage is focused/hovered
  useEffect(() => {
    const el = stage.current
    if (!el) return
    let x0 = 0, y0 = 0
    const down = (e: PointerEvent) => { x0 = e.clientX; y0 = e.clientY }
    const up = (e: PointerEvent) => {
      const dx = e.clientX - x0, dy = e.clientY - y0
      if (e.pointerType !== 'mouse' && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) step(dx < 0 ? 1 : -1)
    }
    el.addEventListener('pointerdown', down); el.addEventListener('pointerup', up)
    return () => { el.removeEventListener('pointerdown', down); el.removeEventListener('pointerup', up) }
  }, [step])
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1) }
    if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1) }
  }
  // art tilts toward the pointer
  const tilt = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--tx', String(((e.clientX - r.left) / r.width - 0.5).toFixed(3)))
    e.currentTarget.style.setProperty('--ty', String(((e.clientY - r.top) / r.height - 0.5).toFixed(3)))
  }

  const p = list[i]
  const prev = list[(i - 1 + n) % n], next = list[(i + 1) % n]
  const open = () => { location.hash = `lab/${p.slug}` }

  return (
    <section id="lab" className="chapter lab" aria-labelledby="lab-h">
      <header className="lab-head">
        <p className="mono dim">CHAPTER II — THE LABORATORY</p>
        <h2 id="lab-h" className="display">Artifacts from an ongoing experiment.</h2>
        <p className="serif lead">Every claim here was checked against the repository it came from. {n} projects, one at a time.</p>
      </header>

      <div className="reel" ref={stage} tabIndex={0} onKeyDown={onKey} role="group" aria-roledescription="carousel" aria-label="Projects">
        <div className="reel-top mono">
          <span className="odo" aria-live="polite" aria-label={`Project ${i + 1} of ${n}`}>
            <span className="odo-cur"><b key={`${tick}-${i}`} data-dir={dir}>{pad(i + 1)}</b></span>
            <span className="odo-sep">/ {pad(n)}</span>
          </span>
          <span className="reel-hint dim">← → keys · swipe · or the buttons</span>
        </div>

        <div className="reel-stage" key={tick} data-dir={dir}>
          <span className="shutter" aria-hidden="true" />
          <div className="reel-art" onPointerMove={tilt} onClick={open}>
            <span className="perfs" aria-hidden="true" />
            <div className="reel-art-in"><Art kind={p.art} /></div>
            <span className="reel-no display" aria-hidden="true">{pad(i + 1)}</span>
          </div>
          <div className="reel-text">
            <p className="mono tag" data-status={p.status}>{STATUS[p.status]}</p>
            <h3 className="display reel-name">{p.name}</h3>
            <p className="serif reel-kicker">{p.kicker}</p>
            <p className="mono dim reel-note">{p.statusNote}</p>
            <ul className="reel-stack mono">{p.stack.slice(0, 5).map((s) => <li key={s}>{s}</li>)}</ul>
            <div className="reel-cta">
              <a className="btn-open mono" href={`#lab/${p.slug}`}>open the full story →</a>
              {p.repo && <a className="mono reel-gh" href={p.repo} target="_blank" rel="noreferrer">GitHub ↗</a>}
            </div>
          </div>
        </div>

        <div className="reel-nav">
          <button className="reel-btn prev" onClick={() => step(-1)} aria-label={`Previous project: ${prev.name}`}>
            <span className="arrow" aria-hidden="true">←</span>
            <span className="mono reel-btn-l"><i>previous</i>{prev.name}</span>
          </button>
          <ol className="reel-rail mono" aria-label="All projects">
            {list.map((q, k) => (
              <li key={q.slug}>
                <button onClick={() => go(k)} aria-current={k === i} aria-label={`${pad(k + 1)} ${q.name}`}><span>{pad(k + 1)}</span><em>{q.name}</em></button>
              </li>
            ))}
            <span className="reel-snake" style={{ left: `${(i / Math.max(1, n - 1)) * 100}%` }} aria-hidden="true" />
          </ol>
          <button className="reel-btn next" onClick={() => step(1)} aria-label={`Next project: ${next.name}`}>
            <span className="mono reel-btn-l"><i>next</i>{next.name}</span>
            <span className="arrow" aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </section>
  )
}
