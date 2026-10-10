import { useEffect, useRef } from 'react'
import { onFrame, clamp } from './ticker'
import { useFx } from '../lib/fx'

const TARGETS = '.chapter h2, .chapter h3, .chapter .lead, .chapter .mono.dim, .artifact, .post-card, .ledger li, .makes li, .contact-links > *, .hobby-board, .algo-term, .rejected, .cheer'

/** Calm scroll life: content rises into place as it enters, and a hairline yellow progress bar fills along the top. */
export function ScrollLife() {
  const bar = useRef<HTMLDivElement>(null)
  const { level } = useFx()

  useEffect(() => {
    if (level === 'min') return
    const off = onFrame(() => {
      const p = clamp(scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight))
      if (bar.current) bar.current.style.transform = `scaleX(${p.toFixed(4)})`
    })
    const seen = new WeakSet<Element>()
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' })
    const scan = () => {
      document.querySelectorAll<HTMLElement>(TARGETS).forEach((el) => {
        if (seen.has(el) || el.closest('.hscene, .oneline, .strip')) return
        seen.add(el)
        const r = el.getBoundingClientRect()
        el.classList.add('rv')
        if (r.top < innerHeight && r.bottom > 0) requestAnimationFrame(() => el.classList.add('in'))
        else io.observe(el)
      })
    }
    scan()
    const mo = new MutationObserver(scan)
    mo.observe(document.querySelector('.world') ?? document.body, { childList: true, subtree: true })
    return () => { off(); io.disconnect(); mo.disconnect() }
  }, [level])

  if (level === 'min') return null
  return <div ref={bar} className="scroll-bar" aria-hidden="true" />
}
