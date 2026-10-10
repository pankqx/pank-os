import { useEffect, useRef, useState } from 'react'
import { characters, type CharacterId } from '../content/characters'
import { InkCharacter } from '../character/InkCharacter'

/** A quiet story beat between chapters: lots of space, one AI character, one line. */
export function Beat({ character, lines, side = 'right', mood = 'IDLE' }: { character: CharacterId; lines: Record<CharacterId, string>; side?: 'left' | 'right'; mood?: 'IDLE' | 'GREETING' | 'REACTING' }) {
  const ref = useRef<HTMLElement>(null)
  const [near, setNear] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setNear(e.isIntersecting), { rootMargin: '60% 0px 60% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  const cfg = characters[character]
  return (
    <section ref={ref} className={`beat beat-${side}`} aria-label={`${cfg.name} says`}>
      <div className="beat-fig">{near && <InkCharacter config={cfg} state={mood} height="58vh" label={`${cfg.name}, an AI character`} />}</div>
      <div className="beat-say">
        <p className="mono beat-who">{cfg.name.toUpperCase()} · AI GUIDE</p>
        <p className="serif beat-line">{lines[character]}</p>
      </div>
    </section>
  )
}
