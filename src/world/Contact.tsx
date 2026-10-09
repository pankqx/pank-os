import { useState } from 'react'
import { links } from '../content/profile'
import { LinePortrait } from '../fx/LinePortrait'
import { Electric } from '../fx/Electric'

export function Contact() {
  const [photo, setPhoto] = useState(true)
  return (
    <section id="contact" className="chapter contact" aria-labelledby="contact-h">
      <div className="contact-inner">
        <figure className="portrait">
          {photo ? (
            <img src={`${import.meta.env.BASE_URL}portrait.jpg`} alt="Portrait of K S Pankaj" onError={() => setPhoto(false)} />
          ) : (
            <div className="portrait-lines"><LinePortrait src={`${import.meta.env.BASE_URL}art/portrait-lines.svg`} label="Line drawing of me" /><Electric bolts={2} rate={140} /></div>
          )}
          <figcaption className="mono dim">me, drawn in lines, waiting for your message</figcaption>
        </figure>
        <div>
          <p className="mono dim">CHAPTER VI — THE BOUNDARY</p>
          <h2 id="contact-h" className="serif contact-title">That’s me. Say hi.</h2>
          <p className="serif lead">I’m open to internships, collaborations and strange ideas. Tell me what you’re building, what’s broken, or what the python wanted.</p>
          <ul className="contact-links">
            {links.map((l) => (
              <li key={l.label}>
                <a href={l.href} target={l.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
                  <span className="mono dim">{l.label}</span>
                  <span className="serif">{l.handle}</span>
                </a>
              </li>
            ))}
          </ul>
          <p className="mono dim sm">The AI characters are AI. This page was built with AI assistance and reviewed by its author. Source: <a href="https://github.com/pankqx/pank-os">pankqx/pank-os</a>.</p>
        </div>
      </div>
    </section>
  )
}
