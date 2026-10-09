// One shared rAF loop for scroll-linked effects. Subscribers are called every frame while any exist.
type Fn = (now: number) => void
const subs = new Set<Fn>()
let raf = 0
const loop = (now: number) => {
  subs.forEach((f) => f(now))
  raf = subs.size ? requestAnimationFrame(loop) : 0
}
export function onFrame(fn: Fn) {
  subs.add(fn)
  if (!raf) raf = requestAnimationFrame(loop)
  return () => { subs.delete(fn) }
}
export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
export const smooth = (v: number) => { const x = clamp(v); return x * x * (3 - 2 * x) }
