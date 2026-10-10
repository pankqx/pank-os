import { useEffect } from 'react'
import { useFx } from '../lib/fx'

const TARGETS = '.chapter h2, .chapter h3, .chapter .lead, .chapter .mono.dim, .artifact, .post-card, .ledger li, .makes li, .contact-links > *, .hobby-board, .algo-term, .rejected, .cheer'

/** Calm scroll life: content rises into place as it enters, . */
export function ScrollLife() {
  const { level } = useFx()

  useEffect(() => {
    if (level === 'min') return
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
    return () => { io.disconnect(); mo.disconnect() }
  }, [level])

  return null
}
