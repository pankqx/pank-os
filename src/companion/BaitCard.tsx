import { useState } from 'react'
import { whatsapp, instagram } from '../content/profile'

/** "Wanna know his GF?" — the visitor messages Pankaj themselves on WhatsApp. Nothing is stored by this site. */
export function BaitCard({ onDone }: { onDone?: () => void }) {
  const [handle, setHandle] = useState('')
  const text = `Hey Pankaj 👀 I saw your website. Tell me your GF's name!${handle.trim() ? ` My Insta: ${handle.trim()}` : ''}`
  const wa = `https://wa.me/${whatsapp}?text=${encodeURIComponent(text)}`
  return (
    <div className="bait">
      <p className="serif">He’ll tell you personally. Leave your Insta ID (optional) and hit WhatsApp — he texts back the name 😏</p>
      <div className="bait-row">
        <input className="mono" value={handle} maxLength={40} onChange={(e) => setHandle(e.target.value)} placeholder="@your.insta (optional)" aria-label="Your Instagram ID (optional)" />
        <a className="mono btn-y" href={wa} target="_blank" rel="noreferrer" onClick={onDone}>WhatsApp him →</a>
        {instagram && <a className="mono btn-o" href={`https://instagram.com/${instagram}`} target="_blank" rel="noreferrer" onClick={onDone}>DM on Insta</a>}
      </div>
      <p className="mono dim sm">Opens WhatsApp with a message to Pankaj — you press send, so he’ll see your number. This site stores nothing.</p>
    </div>
  )
}
