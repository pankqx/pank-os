import { useEffect, useRef, useState } from 'react'
import { characters, type CharacterId } from '../content/characters'
import { AsciiAvatar } from '../companion/AsciiAvatar'

export function Choice({ onChoose, previous }: { onChoose: (id: CharacterId) => void; previous: CharacterId | null }) {
  const [hover, setHover] = useState<CharacterId | null>(null)
  const [picked, setPicked] = useState<CharacterId | null>(null)
  const [vh, setVh] = useState(() => Math.min(520, Math.round(window.innerHeight * 0.52)))
  const first = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const on = () => setVh(Math.min(520, Math.round(window.innerHeight * (window.innerWidth < 760 ? 0.3 : 0.52))))
    on()
    window.addEventListener('resize', on)
    first.current?.focus()
    return () => window.removeEventListener('resize', on)
  }, [])

  const pick = (id: CharacterId) => {
    if (picked) return
    setPicked(id)
    window.setTimeout(() => onChoose(id), 650)
  }

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') pick2('ash')
    if (e.key === 'ArrowRight') pick2('rhea')
  }
  const pick2 = (id: CharacterId) => document.getElementById(`choice-${id}`)?.focus()

  return (
    <main className="choice" onKeyDown={onKey} data-picked={picked ?? ''}>
      <header className="choice-head">
        <p className="mono dim">CHAPTER 0 — AN INTERRUPTION</p>
        <h1 className="display">There is another presence here.</h1>
        <p className="serif big">Who would you like to meet?</p>
      </header>

      <div className="choice-grid" role="group" aria-label="Choose an AI character">
        {(['ash', 'rhea'] as CharacterId[]).map((id, i) => {
          const c = characters[id]
          return (
            <button
              key={id}
              id={`choice-${id}`}
              ref={i === 0 ? first : undefined}
              className="choice-card"
              style={{ ['--accent' as string]: c.accent }}
              data-state={picked ? (picked === id ? 'chosen' : 'gone') : hover === id ? 'hot' : ''}
              onClick={() => pick(id)}
              onPointerEnter={() => setHover(id)}
              onPointerLeave={() => setHover(null)}
              onFocus={() => setHover(id)}
              onBlur={() => setHover(null)}
              aria-label={`${c.choiceLabel}: meet ${c.name}, an AI character. ${c.tagline}`}
            >
              <span className="choice-word display">{c.choiceLabel}</span>
              <AsciiAvatar config={c} state={picked === id ? 'GREETING' : hover === id ? 'REACTING' : 'IDLE'} size={vh} look={hover === id ? (id === 'ash' ? 0.8 : -0.8) : 0} />
              <span className="choice-meta mono">
                <b>{c.name}</b> — {c.tagline}
                {previous === id && <em> · you met last time</em>}
              </span>
            </button>
          )
        })}
      </div>

      <footer className="choice-foot mono dim">
        Both are AI characters with placeholder ASCII faces — not people. You can switch any time. Your pick is remembered on this device only.
      </footer>
    </main>
  )
}
