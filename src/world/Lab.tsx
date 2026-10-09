import { useCallback, useEffect, useRef, useState } from 'react'
import { projects } from '../content/projects'
import { Art } from './Art'

const STATUS: Record<string, string> = { shipped: 'COMPLETED', 'in-progress': 'IN PROGRESS', experimental: 'EXPERIMENTAL', concept: 'CONCEPT', archived: 'ARCHIVED' }

export function Lab() {
  const strip = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)
  const featured = projects.filter((p) => p.featured)
  const archive = projects.filter((p) => !p.featured)

  const onScroll = useCallback(() => {
    const el = strip.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    setProgress(max > 0 ? el.scrollLeft / max : 0)
  }, [])

  const by = useCallback((dir: 1 | -1) => {
    const el = strip.current
    if (!el) return
    const panel = el.querySelector('article')
    const step = (panel?.getBoundingClientRect().width ?? el.clientWidth * 0.8) + 24
    el.scrollBy({ left: dir * step, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  }, [])

  useEffect(() => {
    const el = strip.current
    if (!el) return
    const key = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); by(1) }
      if (e.key === 'ArrowLeft') { e.preventDefault(); by(-1) }
    }
    el.addEventListener('keydown', key)
    return () => el.removeEventListener('keydown', key)
  }, [by])

  return (
    <section id="lab" className="chapter lab" aria-labelledby="lab-h">
      <header className="lab-head">
        <p className="mono dim">CHAPTER II — THE LABORATORY</p>
        <h2 id="lab-h" className="display">Artifacts from an ongoing experiment.</h2>
        <p className="serif lead">Every claim here was checked against the repository it came from. What works is separated from what is only planned.</p>
      </header>

      <div className="strip-wrap">
        <div className="strip-bar mono">
          <button onClick={() => by(-1)} aria-label="Previous artifact">←</button>
          <button onClick={() => by(1)} aria-label="Next artifact">→</button>
          <span className="dim strip-hint">click any card to open it · drag the python below · ← → keys</span>
        </div>
        <div className="strip" ref={strip} tabIndex={0} role="region" aria-label="Project artifacts, scrolls horizontally" onScroll={onScroll}>
          {featured.map((p, i) => (
            <article key={p.slug} className="artifact" data-art={p.art} style={{ ['--n' as string]: i }} role="link" tabIndex={0} aria-label={`${p.name} — open the full story`}
              onClick={(e) => { if (!(e.target as HTMLElement).closest('button, a, input')) location.hash = `lab/${p.slug}` }}
              onKeyDown={(e) => { if (e.key === 'Enter' && e.target === e.currentTarget) location.hash = `lab/${p.slug}` }}
              onPointerMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty('--ry', `${((e.clientX - r.left) / r.width - 0.5) * 6}deg`); e.currentTarget.style.setProperty('--rx', `${-((e.clientY - r.top) / r.height - 0.5) * 6}deg`) }}
              onPointerLeave={(e) => { e.currentTarget.style.setProperty('--ry', '0deg'); e.currentTarget.style.setProperty('--rx', '0deg') }}>
              <div className="artifact-art"><Art kind={p.art} /></div>
              <div className="artifact-text">
                <p className="mono tag" data-status={p.status}>{String(i + 1).padStart(2, '0')} · {STATUS[p.status]}</p>
                <h3 className="display">{p.name}</h3>
                <p className="serif kicker">{p.kicker}</p>
                <p className="mono status-note dim">{p.statusNote}</p>
                <a className="open mono" href={`#lab/${p.slug}`}>open the full story →</a>
                <span className="stamp display" aria-hidden="true">OPEN ↗</span>
              </div>
            </article>
          ))}
          <article className="artifact archive" aria-label="The rest of the archive">
            <div className="artifact-text">
              <p className="mono tag">+ · ARCHIVE</p>
              <h3 className="display">The rest of the shelf.</h3>
              <ul className="archive-list">
                {archive.map((p) => (
                  <li key={p.slug}>
                    <a href={`#lab/${p.slug}`}>
                      <span className="serif">{p.name}</span>
                      <span className="mono dim">{STATUS[p.status]}</span>
                    </a>
                  </li>
                ))}
              </ul>
              <a className="open mono" href="https://github.com/pankqx" target="_blank" rel="noreferrer">everything on GitHub ↗</a>
            </div>
          </article>
        </div>
        <SnakeScroller strip={strip} progress={progress} count={featured.length + 1} labels={[...featured.map((p) => p.name), 'Archive']} />
      </div>
    </section>
  )
}

/** The lab's scrollbar, drawn as a python: drag the head, or click a numbered stop. */
function SnakeScroller({ strip, progress, count, labels }: { strip: React.RefObject<HTMLDivElement | null>; progress: number; count: number; labels: string[] }) {
  const track = useRef<HTMLDivElement>(null)
  const set = (clientX: number) => {
    const t = track.current, el = strip.current
    if (!t || !el) return
    const r = t.getBoundingClientRect()
    const k = Math.min(1, Math.max(0, (clientX - r.left) / r.width))
    el.scrollLeft = k * (el.scrollWidth - el.clientWidth)
  }
  const down = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    set(e.clientX)
    const mv = (ev: PointerEvent) => set(ev.clientX)
    const up = () => { removeEventListener('pointermove', mv); removeEventListener('pointerup', up) }
    addEventListener('pointermove', mv); addEventListener('pointerup', up)
  }
  const go = (i: number) => {
    const el = strip.current
    if (!el) return
    const cards = el.querySelectorAll('article')
    const c = cards[i] as HTMLElement | undefined
    if (c) el.scrollTo({ left: c.offsetLeft - 40, behavior: 'smooth' })
  }
  return (
    <div className="snake-scroll">
      <div className="snake-track" ref={track} onPointerDown={down} role="slider" aria-label="Scroll the laboratory" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)} tabIndex={0}
        onKeyDown={(e) => { const el = strip.current; if (!el) return; if (e.key === 'ArrowRight') el.scrollBy({ left: 400, behavior: 'smooth' }); if (e.key === 'ArrowLeft') el.scrollBy({ left: -400, behavior: 'smooth' }) }}>
        <svg className="snake-body" viewBox="0 0 1000 40" preserveAspectRatio="none" aria-hidden="true">
          <path d={`M0 20 ${Array.from({ length: 40 }, (_, i) => { const x = (i + 1) * 25; return x <= progress * 1000 ? `Q${x - 12.5} ${i % 2 ? 6 : 34} ${x} 20` : '' }).join(' ')}`} />
        </svg>
        <div className="snake-head" style={{ left: `${progress * 100}%` }} aria-hidden="true">
          <svg viewBox="0 0 60 40"><path d="M2 20 C10 4 34 2 50 12 C58 16 58 24 50 28 C34 38 10 36 2 20 Z" /><circle cx="40" cy="14" r="3.4" /><circle cx="40" cy="26" r="3.4" /><path className="tongue" d="M56 20 L68 20 M68 20 L74 15 M68 20 L74 25" /></svg>
        </div>
      </div>
      <ol className="snake-stops mono">
        {Array.from({ length: count }, (_, i) => (
          <li key={i} style={{ left: `${(i / (count - 1)) * 100}%` }}>
            <button onClick={() => go(i)} data-on={progress * (count - 1) >= i - 0.4} title={labels[i]}>{String(i + 1).padStart(2, '0')}<span>{labels[i]}</span></button>
          </li>
        ))}
      </ol>
    </div>
  )
}
