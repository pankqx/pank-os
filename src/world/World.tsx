import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import type { CharacterId } from '../content/characters'
import { useHash } from '../lib/useHash'
import { ErrorBoundary } from '../lib/ErrorBoundary'
import { Nav } from './Nav'
import { sections, type SectionId } from './sections'
import { Prologue } from './Prologue'
import { FieldGuide } from './FieldGuide'
import { Lab } from './Lab'
import { Transmissions } from './Transmissions'
import { Trophy } from './Trophy'
import { Contact } from './Contact'
import { ProjectPage } from './ProjectPage'
import { projectBySlug } from '../content/projects'

const Companion = lazy(() => import('../companion/Companion'))

interface Props {
  character: CharacterId
  onSwitchCharacter: (c: CharacterId) => void
  onReplayIntro: () => void
}

export default function World({ character, onSwitchCharacter, onReplayIntro }: Props) {
  const hash = useHash()
  const [active, setActive] = useState<SectionId>('person')
  const first = useRef(true)

  // scroll to section on hash change (deep links)
  useEffect(() => {
    const id = hash.section
    if (!sections.some((s) => s.id === id)) return
    const el = document.getElementById(id)
    if (!el) return
    const smooth = !first.current && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (hash.sub && id === 'lab' && first.current) el.scrollIntoView({ behavior: 'auto' })
    else if (!hash.sub) el.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' })
    first.current = false
  }, [hash.section, hash.sub])

  // active section tracking
  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[]
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (vis) setActive(vis.target.id as SectionId)
      },
      { rootMargin: '-40% 0px -40% 0px', threshold: [0, 0.2, 0.5] },
    )
    els.forEach((e) => io.observe(e))
    return () => io.disconnect()
  }, [])

  // keyboard: 1–5 jump to chapters
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (t.closest('input, textarea, [contenteditable], [role="dialog"]') || e.metaKey || e.ctrlKey || e.altKey) return
      const s = sections.find((x) => x.key === e.key)
      if (s) { e.preventDefault(); location.hash = s.id }
    }
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [])

  const project = hash.section === 'lab' && hash.sub ? projectBySlug(hash.sub) : undefined

  return (
    <>
      <a className="skip-link" href="#person">Skip to content</a>
      <Nav active={active} character={character} onSwitchCharacter={onSwitchCharacter} onReplayIntro={onReplayIntro} />
      <main className="world" aria-hidden={project ? true : undefined}>
        <FieldGuide />
        <Prologue />
        <Lab />
        <Transmissions />
        <Trophy />
        <Contact />
      </main>
      {project && <ProjectPage project={project} />}
      <ErrorBoundary label="the companion" fallback={null}>
        <Suspense fallback={null}>
          <Companion character={character} onSwitchCharacter={onSwitchCharacter} />
        </Suspense>
      </ErrorBoundary>
    </>
  )
}
