import { useEffect, useRef } from 'react'
import { onFrame } from './ticker'
import { useFx } from '../lib/fx'

/** Lagging ring cursor that grows over interactive things. Off on touch and with minimum effects. */
export function Cursor() {
  const ring = useRef<HTMLDivElement>(null)
  const { level } = useFx()
  useEffect(() => {
    if (level === 'min' || !matchMedia('(pointer: fine)').matches) return
    document.documentElement.classList.add('has-cursor')
    let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y, hot = false, shown = false
    const move = (e: PointerEvent) => {
      x = e.clientX; y = e.clientY; shown = true
      hot = !!(e.target as HTMLElement).closest?.('a, button, input, textarea, [role="region"], label')
    }
    window.addEventListener('pointermove', move)
    const off = onFrame(() => {
      rx += (x - rx) * 0.18; ry += (y - ry) * 0.18
      const el = ring.current
      if (!el) return
      el.style.transform = `translate3d(${rx}px, ${ry}px, 0) scale(${hot ? 2.2 : 1})`
      el.style.opacity = shown ? '1' : '0'
    })
    return () => { off(); window.removeEventListener('pointermove', move); document.documentElement.classList.remove('has-cursor') }
  }, [level])
  return <div ref={ring} className="cursor-ring" aria-hidden="true" />
}
