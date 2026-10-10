import { useCallback, useEffect, useRef, useState } from 'react'
import { projects } from '../content/projects'
import { Art } from './Art'

const STATUS: Record<string, string> = { shipped: 'COMPLETED', 'in-progress': 'IN PROGRESS', experimental: 'EXPERIMENTAL', concept: 'CONCEPT', archived: 'ARCHIVED' }

/** Smooth horizontal scrolling: one rAF loop eases scrollLeft toward a target (buttons, keys, python, drag + inertia). */
function useSmoothStrip() {
  const strip = useRef<HTMLDivElement>(null)
  const ctl = useRef({ target: 0, raf: 0, v: 0, dragging: false })
  const run = useCallback(() => {
    const el = strip.current, c = ctl.current
    if (!el || c.raf) return
    const step = () => {
      const max = el.scrollWidth - el.clientWidth
      if (!c.dragging && Math.abs(c.v) > 0.3) { c.target += c.v; c.v *= 0.92 }
      c.target = Math.max(0, Math.min(max, c.target))
      const d = c.target - el.scrollLeft
      if (Math.abs(d) < 0.5 && Math.abs(c.v) <= 0.3) { el.scrollLeft = c.target; c.raf = 0; return }
      el.scrollLeft += d * (c.dragging ? 0.35 : 0.12)
      c.raf = requestAnimationFrame(step)
    }
    c.raf = requestAnimationFrame(step)
  }, [])
  const to = useCallback((x: number) => { ctl.current.target = x; ctl.current.v = 0; if (matchMedia('(prefers-reduced-motion: reduce)').matches && strip.current) { strip.current.scrollLeft = x; return } run() }, [run])
  const by = useCallback((dir: 1 | -1) => {
    const el = strip.current
    if (!el) return
    const panel = el.querySelector('article')
    const w = (panel?.getBoundingClientRect().width ?? el.clientWidth * 0.8) + 24
    const base = ctl.current.raf ? ctl.current.target : el.scrollLeft
    to(Math.round((base + dir * w) / w) * w)
  }, [to])
  useEffect(() => {
    const el = strip.current
    if (!el) return
    const c = ctl.current
    // native scrolling (trackpad, touch) keeps the target in sync
    const sync = () => { if (!c.raf) c.target = el.scrollLeft }
    el.addEventListener('scroll', sync, { passive: true })
    // mouse drag with inertia
    let lastX = 0, moved = 0
    const down = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return
      c.dragging = true; lastX = e.clientX; moved = 0; c.v = 0; c.target = el.scrollLeft
      run()
    }
    const move = (e: PointerEvent) => {
      if (!c.dragging) return
      const dx = e.clientX - lastX; lastX = e.clientX; moved += Math.abs(dx)
      c.target -= dx * 1.4; c.v = -dx * 1.4
    }
    const up = () => { if (!c.dragging) return; c.dragging = false; run() }
    const click = (e: MouseEvent) => { if (moved > 8) { e.preventDefault(); e.stopPropagation(); moved = 0 } }
    const key = (e: KeyboardEvent) => {
      if (e.target !== el) return
      if (e.key === 'ArrowRight') { e.preventDefault(); by(1) }
      if (e.key === 'ArrowLeft') { e.preventDefault(); by(-1) }
    }
    el.addEventListener('pointerdown', down)
    addEventListener('pointermove', move)
    addEventListener('pointerup', up)
    el.addEventListener('click', click, true)
    el.addEventListener('keydown', key)
    return () => { cancelAnimationFrame(c.raf); c.raf = 0; el.removeEventListener('scroll', sync); el.removeEventListener('pointerdown', down); removeEventListener('pointermove', move); removeEventListener('pointerup', up); el.removeEventListener('click', click, true); el.removeEventListener('keydown', key) }
  }, [by, run])
  return { strip, to, by }
}

export function Lab() {
  const { strip, to, by } = useSmoothStrip()
  const featured = projects.filter((p) => p.featured)
  const archive = projects.filter((p) => !p.featured)

  return (
    <section id="lab" className="chapter lab" aria-labelledby="lab-h">
      <header className="lab-head">
        <p className="mono dim">CHAPTER II — THE LABORATORY</p>
        <h2 id="lab-h" className="display">Artifacts from an ongoing experiment.</h2>
        <p className="serif lead">Every claim here was checked against the repository it came from. What works is separated from what is only planned.</p>
      </header>

      <div className="strip-wrap">
        <div className="strip-bar mono">
          <button className="orb-prev" onClick={() => by(-1)} aria-label="Previous artifact">←</button>
          <span className="dim strip-hint">click any card to open it · drag the python below · ← → keys</span>
          <button className="orb" onClick={() => by(1)} aria-label="Next artifact">
            <span className="rock" aria-hidden="true"><i /><i /><i /></span>
            <span className="orb-text">next</span>
          </button>
        </div>
        <div className="strip" ref={strip} tabIndex={0} role="region" aria-label="Project artifacts, scrolls horizontally">
          {featured.map((p, i) => (
            <article key={p.slug} className="artifact" data-art={p.art} style={{ ['--n' as string]: i }} role="link" tabIndex={0} aria-label={`${p.name} — open the full story`}
              onClick={(e) => { if (!(e.target as HTMLElement).closest('button, a, input')) location.hash = `lab/${p.slug}` }}
              onKeyDown={(e) => { if (e.key === 'Enter' && e.target === e.currentTarget) location.hash = `lab/${p.slug}` }}
>
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
        <SnakeScroller strip={strip} to={to} count={featured.length + 1} labels={[...featured.map((p) => p.name), 'Archive']} />
      </div>
    </section>
  )
}

/** The lab's scrollbar, drawn as a python: drag the head, or click a numbered stop. */
function SnakeScroller({ strip, to, count, labels }: { strip: React.RefObject<HTMLDivElement | null>; to: (x: number) => void; count: number; labels: string[] }) {
  const track = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const el = strip.current
    if (!el) return
    let raf = 0
    const on = () => { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; const max = el.scrollWidth - el.clientWidth; setProgress(max > 0 ? el.scrollLeft / max : 0) }) }
    el.addEventListener('scroll', on, { passive: true })
    return () => { el.removeEventListener('scroll', on); cancelAnimationFrame(raf) }
  }, [strip])
  const set = (clientX: number) => {
    const t = track.current, el = strip.current
    if (!t || !el) return
    const r = t.getBoundingClientRect()
    const k = Math.min(1, Math.max(0, (clientX - r.left) / r.width))
    to(k * (el.scrollWidth - el.clientWidth))
  }
  const down = (e: React.PointerEvent) => {
    set(e.clientX)
    const mv = (ev: PointerEvent) => set(ev.clientX)
    const up = () => { removeEventListener('pointermove', mv); removeEventListener('pointerup', up) }
    addEventListener('pointermove', mv); addEventListener('pointerup', up)
  }
  const go = (i: number) => {
    const el = strip.current
    if (!el) return
    const c = el.querySelectorAll('article')[i] as HTMLElement | undefined
    if (c) to(c.offsetLeft - 40)
  }
  return (
    <div className="snake-scroll">
      <div className="snake-track" ref={track} onPointerDown={down} role="slider" aria-label="Scroll the laboratory" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)} tabIndex={0}
        onKeyDown={(e) => { const el = strip.current; if (!el) return; if (e.key === 'ArrowRight') to(el.scrollLeft + 420); if (e.key === 'ArrowLeft') to(el.scrollLeft - 420) }}>
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
