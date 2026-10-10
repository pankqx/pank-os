import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Finale } from './Finale'
import { useConversation } from '../companion/useConversation'
import type { CharacterId } from '../content/characters'
import { useHash } from '../lib/useHash'
import { ErrorBoundary } from '../lib/ErrorBoundary'
import { Nav } from './Nav'
import { sections, type SectionId } from './sections'
import { Prologue } from './Prologue'
import { OneLine } from './OneLine'
import { ProntoPy } from './ProntoPy'
import { PostPage } from './PostPage'
import { posts } from '../content/posts'
import { ScrollLife } from '../fx/ScrollLife'
import { PowerPipe } from '../fx/PowerPipe'
import { Marquee } from '../fx/Marquee'
import { Cursor } from '../fx/Cursor'
import { useReveal } from '../fx/useReveal'
import { Lab } from './Lab'
import { Transmissions } from './Transmissions'
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
  const conv = useConversation(character)
  const [chatOpen, setChatOpen] = useState(false)
  const [finaleOn, setFinaleOn] = useState(false)
  useEffect(() => {
    const el = document.getElementById('meet')
    if (!el) return
    const io = new IntersectionObserver(([e]) => setFinaleOn(e.isIntersecting), { threshold: 0 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  const other = character === 'roman' ? 'reenu' : 'roman'

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

  useReveal(character)

  const project = hash.section === 'lab' && hash.sub ? projectBySlug(hash.sub) : undefined
  const post = hash.section === 'post' ? posts.find((p) => p.slug === hash.sub) : undefined

  return (
    <>
      <a className="skip-link" href="#person">Skip to content</a>
      <Cursor />
      <Nav active={active} character={character} onSwitchCharacter={onSwitchCharacter} onReplayIntro={onReplayIntro} />
      <main className="world" aria-hidden={project || post ? true : undefined}>
        <ScrollLife />
        <PowerPipe />
        <OneLine />
        <Prologue />
        <ProntoPy />
        <Lab />
        <Marquee text="rizz ✦ sense of humour ✦ idgaf ✦ midnight dramas ✦" />
        <Transmissions />
        <Finale conv={conv} onSwitch={() => onSwitchCharacter(other)} />
        <Contact />
      </main>
      {project && <ProjectPage project={project} />}
      {post && <PostPage post={post} />}
      <ErrorBoundary label="the companion" fallback={null}>
        <Suspense fallback={null}>
          <Companion hidden={finaleOn} conv={conv} open={chatOpen} setOpen={setChatOpen} onSwitchCharacter={onSwitchCharacter} />
        </Suspense>
      </ErrorBoundary>
    </>
  )
}
