import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react'
import { onFrame, clamp } from './ticker'
import { useFx } from '../lib/fx'

/** Progress bus so children can react to the scene's horizontal travel without re-rendering. */
export interface SceneBus { p: number; subs: Set<(p: number) => void> }
const Ctx = createContext<SceneBus | null>(null)
export const useScene = () => useContext(Ctx)
export function useSceneProgress(fn: (p: number) => void) {
  const bus = useScene()
  useEffect(() => {
    if (!bus) return
    bus.subs.add(fn)
    fn(bus.p)
    return () => { bus.subs.delete(fn) }
  }, [bus, fn])
}

interface Props { id?: string; label: string; children: ReactNode; className?: string; tail?: number; overlay?: ReactNode }

/**
 * Pinned horizontal story: vertical scrolling moves the track sideways (sticky, no wheel hijacking —
 * the page scroll position is the only input, so keyboard, trackpad, touch and scrollbars all work).
 * With minimum effects it becomes a native horizontal strip.
 */
export function HorizontalScene({ id, label, children, className = '', tail = 0.15, overlay }: Props) {
  const outer = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const bus = useRef<SceneBus>({ p: 0, subs: new Set() }).current
  const { level } = useFx()
  const pinned = level !== 'min'

  useEffect(() => {
    if (!pinned) { bus.p = 1; bus.subs.forEach((f) => f(1)); return }
    const o = outer.current!, t = track.current!
    let travel = 0
    const size = () => {
      travel = Math.max(0, t.scrollWidth - o.clientWidth)
      o.style.height = `${travel + window.innerHeight * (1 + tail)}px`
    }
    size()
    const ro = new ResizeObserver(size)
    ro.observe(t)
    window.addEventListener('resize', size)
    let last = -1
    const off = onFrame(() => {
      const r = o.getBoundingClientRect()
      const span = r.height - window.innerHeight
      const p = span > 0 ? clamp(-r.top / span) : 0
      if (Math.abs(p - last) < 0.0002) return
      last = p
      bus.p = p
      t.style.transform = `translate3d(${(-p * travel).toFixed(1)}px,0,0)`
      t.querySelectorAll<HTMLElement>('[data-speed]').forEach((el) => {
        const s = parseFloat(el.dataset.speed || '0')
        el.style.transform = `translate3d(${(-p * travel * s).toFixed(1)}px,0,0)`
      })
      bus.subs.forEach((f) => f(p))
    })
    return () => { off(); ro.disconnect(); window.removeEventListener('resize', size) }
  }, [pinned, bus, tail])

  return (
    <Ctx.Provider value={bus}>
      <section id={id} ref={outer} className={`hscene ${pinned ? 'is-pinned' : 'is-native'} ${className}`} aria-label={label}>
        <div className="hscene-sticky">
          <div className="hscene-track" ref={track}>{children}</div>
          {overlay}
        </div>
      </section>
    </Ctx.Provider>
  )
}
