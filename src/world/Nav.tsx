import { sections, type SectionId } from './sections'
import { useFx } from '../lib/fx'
import { characters, type CharacterId } from '../content/characters'

interface Props {
  active: SectionId
  character: CharacterId
  onSwitchCharacter: (c: CharacterId) => void
  onReplayIntro: () => void
}

export function Nav({ active, character, onSwitchCharacter, onReplayIntro }: Props) {
  const { level, setLevel } = useFx()
  const other: CharacterId = character === 'roman' ? 'reenu' : 'roman'
  const next = level === 'full' ? 'lite' : level === 'lite' ? 'min' : 'full'
  const names = { full: 'FULL', lite: 'LITE', min: 'STILL' }
  return (
    <nav className="rail" aria-label="Chapters">
      <a className="rail-mark display" href="#person" aria-label="K S Pankaj — start">KSP</a>
      <ol>
        {sections.map((s) => (
          <li key={s.id}>
            <a href={`#${s.id}`} aria-current={active === s.id ? 'true' : undefined} data-key={s.key}>
              <span className="rail-num mono">{s.num}</span>
              <span className="rail-label">{s.label}</span>
            </a>
          </li>
        ))}
      </ol>
      <div className="rail-tools mono">
        <button onClick={() => setLevel(next)} title="Reduce or restore visual effects" aria-label={`Visual effects: ${names[level]}. Activate to change.`}>
          FX·{names[level]}
        </button>
        <button onClick={() => onSwitchCharacter(other)} title={`Switch to ${characters[other].name}`}>
          ⇄ {characters[other].name}
        </button>
        <button onClick={onReplayIntro}>↺ intro</button>
        <span className="rail-hint dim">keys 1–5 · ← → in the lab</span>
      </div>
    </nav>
  )
}
