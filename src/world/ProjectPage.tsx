import { useEffect, useRef } from 'react'
import type { Project } from '../content/types'
import { Art } from './Art'

const STATUS: Record<string, string> = { shipped: 'COMPLETED', 'in-progress': 'IN PROGRESS', experimental: 'EXPERIMENTAL', concept: 'CONCEPT', archived: 'ARCHIVED' }

function List({ title, items, empty }: { title: string; items: string[]; empty?: string }) {
  return (
    <section className="dos-block">
      <h3 className="mono">{title}</h3>
      {items.length ? <ul>{items.map((i) => <li key={i}>{i}</li>)}</ul> : <p className="dim">{empty ?? '—'}</p>}
    </section>
  )
}

export function ProjectPage({ project: p }: { project: Project }) {
  const close = useRef<HTMLButtonElement>(null)
  const prev = useRef<Element | null>(null)

  useEffect(() => {
    prev.current = document.activeElement
    close.current?.focus()
    document.body.style.overflow = 'hidden'
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') location.hash = 'lab' }
    window.addEventListener('keydown', key)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', key)
      ;(prev.current as HTMLElement | null)?.focus?.()
    }
  }, [p.slug])

  return (
    <div className="dossier" role="dialog" aria-modal="true" aria-labelledby="dos-h">
      <div className="dossier-inner">
        <header className="dos-head">
          <a ref={close as never} href="#lab" className="mono dos-close" onClick={(e) => { e.preventDefault(); location.hash = 'lab' }}>✕ close · esc</a>
          <p className="mono tag" data-status={p.status}>{STATUS[p.status]}</p>
          <h2 id="dos-h" className="display">{p.name}</h2>
          <p className="serif lead">{p.kicker}</p>
          <p className="mono dim">{p.statusNote}</p>
        </header>

        {p.art !== 'none' && <div className="dos-art"><Art kind={p.art} /></div>}

        <div className="dos-cols">
          <section className="dos-block wide">
            <h3 className="mono">THE IDEA</h3>
            <p className="serif">{p.idea}</p>
            <h3 className="mono">WHY IT EXISTS</h3>
            <p className="serif">{p.why}</p>
          </section>
          <List title="BUILT — described by the repo as implemented" items={p.built} empty="Nothing implemented yet." />
          <List title="PLANNED — the repo’s own roadmap" items={p.planned} />
          <List title="DESIGN DECISIONS" items={p.decisions} empty="Not documented yet." />
          <List title="TRADE-OFFS & HONEST LIMITS" items={p.tradeoffs} />
          <section className="dos-block">
            <h3 className="mono">STACK</h3>
            <ul className="chips mono">{p.stack.map((s) => <li key={s}>{s}</li>)}</ul>
          </section>
        </div>

        <footer className="dos-foot mono">
          <a href={p.repo} target="_blank" rel="noreferrer">GitHub repository ↗</a>
          {p.live && <a href={p.live} target="_blank" rel="noreferrer">Live deployment ↗</a>}
          <span className="dim">evidence: {p.evidence}</span>
        </footer>
      </div>
    </div>
  )
}
