import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { Opening } from './opening/Opening'
import { Choice } from './choice/Choice'
import { Wipe } from './choice/Wipe'
import { ErrorBoundary } from './lib/ErrorBoundary'
import type { CharacterId } from './content/characters'

const World = lazy(() => import('./world/World'))
const DevCharacters = lazy(() => import('./character/DevCharacters'))
type Stage = 'opening' | 'choice' | 'world'
const KEY = 'pankos.character'

function stored(): CharacterId | null {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'roman' || v === 'reenu' ? v : v === 'ash' ? 'roman' : v === 'rhea' ? 'reenu' : null
  } catch {
    return null
  }
}

export function App() {
  // only a direct link to a project/post skips the intro; plain section hashes never do
  const [stage, setStage] = useState<Stage>(() => {
    if (typeof location === 'undefined') return 'opening'
    const direct = /^#(lab|post)\/.+/.test(location.hash)
    if (!direct && location.hash.length > 1) history.replaceState(null, '', location.pathname + location.search)
    try { history.scrollRestoration = 'manual' } catch { /* ignore */ }
    if (!direct) window.scrollTo(0, 0)
    return direct ? 'world' : 'opening'
  })
  const [character, setCharacter] = useState<CharacterId>(stored() ?? 'roman')
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

  if (typeof location !== 'undefined' && location.search.includes('dev=characters')) return <Suspense fallback={null}><DevCharacters /></Suspense>

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
