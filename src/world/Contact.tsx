import { useState } from 'react'
import { links } from '../content/profile'

export function Contact() {
  const [photo, setPhoto] = useState(true)
  return (
    <section id="contact" className="chapter contact" aria-labelledby="contact-h">
      <div className="contact-inner">
        <figure className="portrait">
          {photo ? (
            <img src={`${import.meta.env.BASE_URL}portrait.jpg`} alt="Portrait of K S Pankaj" onError={() => setPhoto(false)} />
          ) : (
            <div className="portrait-ph mono" role="img" aria-label="Placeholder: portrait to be added">
              <pre aria-hidden="true">{`+----------------+
|                |
|    (  ?  )     |
|     \\___/      |
|   /|     |\\    |
|                |
+----------------+`}</pre>
              <figcaption>PORTRAIT — awaiting photograph<br /><span className="dim">drop public/portrait.jpg</span></figcaption>
            </div>
          )}
        </figure>
        <div>
          <p className="mono dim">CHAPTER V — THE BOUNDARY</p>
          <h2 id="contact-h" className="serif contact-title">That’s the edge of the experiment.</h2>
          <p className="serif lead">Everything beyond this point is just a person with an inbox. Say hello, tell him what’s broken, or ask what the python wanted.</p>
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
