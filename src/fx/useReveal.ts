import { useEffect } from 'react'
import { useFx } from '../lib/fx'

const SEL = '.chapter h2, .chapter .lead, .artifact, .ledger li, .posts > li, .contact-links li, .specimen, .skills li, .plinths li, .unfinished li, .person-body p, .community li'

/** Scroll-in reveals for the editorial chapters. Skipped entirely with minimum effects. */
export function useReveal(dep: unknown) {
  const { level } = useFx()
  useEffect(() => {
    if (level === 'min') return
    const els = Array.from(document.querySelectorAll<HTMLElement>(SEL)).filter((e) => !e.closest('.hscene'))
    els.forEach((e, i) => { e.classList.add('rv'); e.style.setProperty('--d', `${(i % 6) * 60}ms`) })
    const io = new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target) } }), { rootMargin: '0px 0px -12% 0px' })
    els.forEach((e) => io.observe(e))
    return () => io.disconnect()
  }, [level, dep])
}
