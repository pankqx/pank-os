import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { Opening } from './opening/Opening'
import { Choice } from './choice/Choice'
import { Wipe } from './choice/Wipe'
import { ErrorBoundary } from './lib/ErrorBoundary'
import type { CharacterId } from './content/characters'

const World = lazy(() => import('./world/World'))
type Stage = 'opening' | 'choice' | 'world'
const KEY = 'pankos.character'

function stored(): CharacterId | null {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'ash' || v === 'rhea' ? v : null
  } catch {
    return null
  }
}

export function App() {
  const deepLink = typeof location !== 'undefined' && location.hash.length > 1
  const [stage, setStage] = useState<Stage>(deepLink ? 'world' : 'opening')
  const [character, setCharacter] = useState<CharacterId>(stored() ?? 'ash')
  const [wipe, setWipe] = useState(false)

  const go = useCallback((next: Stage) => {
    setWipe(true)
    window.setTimeout(() => setStage(next), 380)
    window.setTimeout(() => setWipe(false), 900)
  }, [])

  const choose = (id: CharacterId) => {
    setCharacter(id)
    try { localStorage.setItem(KEY, id) } catch { /* not persisted */ }
    go('world')
  }

  useEffect(() => {
    document.body.dataset.stage = stage
  }, [stage])

  return (
    <ErrorBoundary label="the experience">
      {stage === 'opening' && <Opening onDone={() => go('choice')} />}
      {stage === 'choice' && <Choice previous={stored()} onChoose={choose} />}
      {stage === 'world' && (
        <Suspense fallback={<div className="boot mono">LOADING THE WORLD…</div>}>
          <World character={character} onSwitchCharacter={setCharacter} onReplayIntro={() => go('opening')} />
        </Suspense>
      )}
      {wipe && <Wipe />}
    </ErrorBoundary>
  )
}
