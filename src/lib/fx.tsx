import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type FxLevel = 'full' | 'lite' | 'min'
const KEY = 'pankos.fx'

interface FxState {
  level: FxLevel
  setLevel: (l: FxLevel) => void
  webgl: boolean
  reducedMotion: boolean
  /** Called by render loops when they measure sustained slow frames. Only ever lowers quality. */
  downgrade: () => void
}

function safeGet(): FxLevel | null {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'full' || v === 'lite' || v === 'min' ? v : null
  } catch {
    return null
  }
}
function safeSet(l: FxLevel) {
  try {
    localStorage.setItem(KEY, l)
  } catch {
    /* storage may be unavailable; the setting simply won't persist */
  }
}

export function detectWebGL(): boolean {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

function initialLevel(reduced: boolean): FxLevel {
  const saved = safeGet()
  if (saved) return saved
  if (reduced) return 'min'
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } }
  const weak = (nav.deviceMemory ?? 8) <= 2 || (nav.hardwareConcurrency ?? 8) <= 2 || nav.connection?.saveData
  const coarse = window.matchMedia('(pointer: coarse)').matches && Math.min(window.innerWidth, window.innerHeight) < 500
  return weak || coarse ? 'lite' : 'full'
}

const Ctx = createContext<FxState | null>(null)

export function FxProvider({ children }: { children: ReactNode }) {
  const [reducedMotion, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [level, setLevelState] = useState<FxLevel>(() => initialLevel(reducedMotion))
  const webgl = useMemo(detectWebGL, [])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const on = () => {
      setReduced(mq.matches)
      if (mq.matches) setLevelState('min')
    }
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])

  useEffect(() => {
    document.documentElement.dataset.fx = level
  }, [level])

  const setLevel = useCallback((l: FxLevel) => {
    setLevelState(l)
    safeSet(l)
  }, [])
  const downgrade = useCallback(() => setLevelState((l) => (l === 'full' ? 'lite' : l)), [])

  const value = useMemo(() => ({ level, setLevel, webgl, reducedMotion, downgrade }), [level, setLevel, webgl, reducedMotion, downgrade])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useFx() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useFx outside FxProvider')
  return v
}
