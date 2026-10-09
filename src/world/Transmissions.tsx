import { useState, type FormEvent } from 'react'
import { posts, unfinished, rejectedTitles } from '../content/posts'

const ENDPOINT = import.meta.env.VITE_NEWSLETTER_ENDPOINT as string | undefined

export function Transmissions() {
  const cats = ['All', ...Array.from(new Set(posts.map((p) => p.category)))]
  const [cat, setCat] = useState('All')
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState('')
  const list = posts.filter((p) => p.status !== 'draft' && (cat === 'All' || p.category === cat))

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return setMsg('That doesn’t look like an email address.')
    if (!ENDPOINT) return setMsg('The newsletter isn’t connected yet. Nothing was sent or stored.')
    try {
      const r = await fetch(ENDPOINT, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email }) })
      setMsg(r.ok ? 'Subscribed.' : `The provider answered ${r.status}. Not subscribed.`)
    } catch {
      setMsg('Network error — not subscribed. Try again later.')
    }
  }

  return (
    <section id="transmissions" className="chapter trans" aria-labelledby="trans-h">
      <header>
        <p className="mono dim">CHAPTER III — TRANSMISSIONS</p>
        <h2 id="trans-h" className="display">Signals from inside the experiment.</h2>
        <p className="serif lead">Stories, lessons and things I got wrong in public. Click one — each opens as its own photo essay.</p>
      </header>

      <div className="trans-grid">
        <div>
          <div className="filters mono" role="group" aria-label="Filter by category">
            {cats.map((c) => <button key={c} aria-pressed={cat === c} onClick={() => setCat(c)}>{c}</button>)}
          </div>
          <ol className="posts">
            {list.map((p, i) => (
              <li key={p.slug}>
                <a className="post-card" href={`#post/${p.slug}`} style={{ ['--i' as string]: i }}>
                  {p.cover && <span className="post-cover" aria-hidden="true"><img src={p.cover} alt="" loading="lazy" /></span>}
                  <span className="post-meta mono"><time dateTime={p.date}>{p.date}</time> · {p.category}</span>
                  <span className="serif post-title">{p.title}</span>
                  <span className="serif post-excerpt">{p.excerpt}</span>
                  {p.readingJoke && <span className="mono joke">{p.readingJoke}</span>}
                  <span className="mono read">read the essay →</span>
                </a>
              </li>
            ))}
          </ol>
        </div>

        <aside className="unfinished" aria-labelledby="unf-h">
          <div className="rejected">
            <h3 className="mono">REJECTED TITLES <span className="dim">(humour)</span></h3>
            <ul>{rejectedTitles.map((t) => <li key={t} className="serif"><s>{t}</s></li>)}</ul>
            <p className="mono blockstatus">status: writer’s block detected — retrying in <span className="count" aria-hidden="true" /></p>
          </div>
          <h3 id="unf-h" className="mono">THINGS NOT FINISHED</h3>
          <ul>
            {unfinished.map((u) => <li key={u.title}><span className="serif">{u.title}</span><span className="mono dim"> — {u.note}</span></li>)}
          </ul>
          <form className="news" onSubmit={submit} noValidate>
            <label htmlFor="nl" className="mono">NEWSLETTER</label>
            <div>
              <input id="nl" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              <button className="mono" type="submit">{ENDPOINT ? 'subscribe' : 'try it'}</button>
            </div>
            <p className="mono dim sm" role="status">{msg || (ENDPOINT ? 'Your address goes to the configured provider and nowhere else.' : 'No provider is configured, so this form stores nothing.')}</p>
          </form>
        </aside>
      </div>
    </section>
  )
}
