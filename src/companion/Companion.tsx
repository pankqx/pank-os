import { useEffect } from 'react'
import { characters, type CharacterId } from '../content/characters'
import { InkCharacter } from '../character/InkCharacter'
import { CharacterStage } from './CharacterStage'
import type { Conversation } from './useConversation'

interface Props { conv: Conversation; open: boolean; setOpen: (v: boolean) => void; onSwitchCharacter: (c: CharacterId) => void; hidden?: boolean }

/** Floating button + full-screen stage where the character is as big as the screen. */
export default function Companion({ conv, open, setOpen, onSwitchCharacter, hidden }: Props) {
  const cfg = conv.cfg
  const other: CharacterId = cfg.id === 'roman' ? 'reenu' : 'roman'
  useEffect(() => {
    if (!open) return
    conv.greet()
    document.body.style.overflow = 'hidden'
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', k)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', k) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, cfg.id])

  return (
    <>
      {!open && (
        <button className="comp-fab mono" data-hidden={hidden} tabIndex={hidden ? -1 : 0} onClick={() => setOpen(true)} aria-label={`Talk to ${cfg.name}, an AI character`} style={{ ['--accent' as string]: cfg.accent }}>
          <span className="fab-face"><InkCharacter config={cfg} state="IDLE" height={150} track={false} /></span>
          <span>talk to {cfg.name}<small>AI character</small></span>
        </button>
      )}
      {open && (
        <div className="comp-overlay" style={{ ['--accent' as string]: cfg.accent }} role="dialog" aria-modal="true" aria-label={`Conversation with ${cfg.name}, an AI character`}>
          <CharacterStage conv={conv} mode="overlay" onClose={() => setOpen(false)} onSwitch={() => onSwitchCharacter(other)} />
        </div>
      )}
    </>
  )
}
export { characters }
