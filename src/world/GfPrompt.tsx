import { useEffect, useState } from 'react'
import { BaitCard } from '../companion/BaitCard'

const KEY = 'pankos.gf'
/** A tiny nosy question that pops up once, halfway down the page. */
export function GfPrompt() {
  const [show, setShow] = useState(false)
  const [step, setStep] = useState<'ask' | 'yes' | 'no'>('ask')
  useEffect(() => {
    try { if (sessionStorage.getItem(KEY)) return } catch { /* fine */ }
    const on = () => {
      const p = scrollY / Math.max(1, document.body.scrollHeight - innerHeight)
      if (p > 0.42) { setShow(true); removeEventListener('scroll', on) }
    }
    addEventListener('scroll', on, { passive: true })
    return () => removeEventListener('scroll', on)
  }, [])
  const close = () => { setShow(false); try { sessionStorage.setItem(KEY, '1') } catch { /* fine */ } }
  if (!show) return null
  return (
    <aside className="gf-pop" role="dialog" aria-label="A small question">
      <button className="gf-x mono" onClick={close} aria-label="Close">✕</button>
      {step === 'ask' && (
        <>
          <p className="mono gf-k">psst…</p>
          <p className="display gf-q">Wanna know Pankaj’s GF?</p>
          <div className="gf-btns mono"><button className="btn-y" onClick={() => setStep('yes')}>YES 👀</button><button className="btn-o" onClick={() => { setStep('no'); setTimeout(close, 1800) }}>nah</button></div>
        </>
      )}
      {step === 'yes' && <BaitCard onDone={close} />}
      {step === 'no' && <p className="serif gf-q2">Respect. Your loss though 🤷</p>}
    </aside>
  )
}
