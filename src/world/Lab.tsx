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
          <div className="strip-progress" aria-hidden="true"><i style={{ transform: `scaleX(${0.08 + progress * 0.92})` }} /></div>
          <button onClick={() => by(1)} aria-label="Next artifact">→</button>
          <span className="dim strip-hint">drag · shift+wheel · arrow keys · vertical scroll leaves the strip</span>
        </div>
        <div className="strip" ref={strip} tabIndex={0} role="region" aria-label="Project artifacts, scrolls horizontally" onScroll={onScroll}>
          {featured.map((p, i) => (
            <article key={p.slug} className="artifact" data-art={p.art} style={{ ['--n' as string]: i }}>
              <div className="artifact-art"><Art kind={p.art} /></div>
              <div className="artifact-text">
                <p className="mono tag" data-status={p.status}>{String(i + 1).padStart(2, '0')} · {STATUS[p.status]}</p>
                <h3 className="display">{p.name}</h3>
                <p className="serif kicker">{p.kicker}</p>
                <p className="mono status-note dim">{p.statusNote}</p>
                <a className="open mono" href={`#lab/${p.slug}`}>open the dossier →</a>
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
      </div>
    </section>
  )
}
