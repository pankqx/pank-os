import { profile } from '../content/profile'
import { projects } from '../content/projects'
import { Hobbies } from './Hobbies'

export function Prologue() {
  const real = projects.filter((p) => p.status !== 'concept').length
  return (
    <section id="person-notes" className="chapter person" aria-labelledby="person-h">
      <div className="chapter-no display" aria-hidden="true">I</div>
      <div className="person-grid">
        <header className="person-head">
          <p className="mono dim">CHAPTER I — IN MY OWN WORDS</p>
          <h2 id="person-h" className="display person-title hl">
            <span>I build things,</span> <span>then write down</span> <span>what’s wrong</span> <span>with them.</span>
          </h2>
        </header>

        <div className="person-body">
          <p className="serif lead">
            Hi, I’m Pankaj. Half developer, half storyteller, full-time collector of unfinished ideas. I write short-film scripts at midnight, code until the bug blinks first, and lose chess games with tremendous confidence.
          </p>
          <p className="serif">
            I make <em>websites that feel like places</em> and <em>digital products people open twice</em>. Right now I’m doing an MCA in Mangaluru, building <a href="#prontopy">ProntoPy</a>, and turning my mistakes into documentation — which is why the Trophy Room is empty and the blog is honest.
          </p>
          <p className="serif">
            I like working in a team more than I like working alone. The best things I’ve made started as somebody else’s question. If you have one, <a href="#contact">ask me</a>.
          </p>
          <aside className="margin mono" aria-label="Note">
            <span>↳ the python in the intro is mine too. It eats names. I’m working on it.</span>
          </aside>
        </div>

        <dl className="specimen mono" aria-label="Field data">
          <div><dt>SPECIMEN</dt><dd>{profile.name}</dd></div>
          <div><dt>NOW</dt><dd>{profile.study}</dd></div>
          {profile.roles.map((r) => (
            <div key={r.org + r.when}><dt>{r.when.toUpperCase()}</dt><dd>{r.title}, {r.org}</dd></div>
          ))}
          <div><dt>ON RECORD</dt><dd>{real} projects in the lab, 1 concept, 0 trophies (yet)</dd></div>
          <div><dt>MODE</dt><dd>team player · open to collaborations</dd></div>
        </dl>

        <div className="makes">
          <p className="mono dim">THINGS I MAKE</p>
          <ul>
            {profile.makes.map((m, i) => (
              <li key={m.what}><span className="mono num">0{i + 1}</span><b className="display">{m.what}</b><span className="serif">{m.note}</span></li>
            ))}
          </ul>
        </div>

        <ul className="skills mono" aria-label="Tools">
          {profile.skills.map((s) => <li key={s}>{s}</li>)}
        </ul>
      </div>
      <Hobbies />
    </section>
  )
}
