import { useState } from 'react'
import { characters } from '../content/characters'
import type { CharState } from '../companion/machine'
import { InkCharacter } from './InkCharacter'

const STATES: CharState[] = ['IDLE', 'GREETING', 'LISTENING', 'THINKING', 'SPEAKING', 'REACTING', 'ERROR']
/** QA page: /?dev=characters */
export default function DevCharacters() {
  const [s, setS] = useState<CharState>('IDLE')
  return (
    <main style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, padding: 20, minHeight: '100vh', background: '#08090a' }}>
      <div style={{ gridColumn: '1/-1', display: 'flex', gap: 8 }} className="mono">
        {STATES.map((x) => <button key={x} onClick={() => setS(x)} style={{ border: '1px solid #444', padding: '4px 8px', color: s === x ? '#c8ff2e' : '#ece7da' }}>{x}</button>)}
      </div>
      <InkCharacter config={characters.roman} state={s} height="86vh" />
      <InkCharacter config={characters.reenu} state={s} height="86vh" />
    </main>
  )
}
