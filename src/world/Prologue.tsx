import { profile } from '../content/profile'
import { projects } from '../content/projects'

export function Prologue() {
  const real = projects.filter((p) => p.status !== 'concept').length
  return (
    <section id="person" className="chapter person" aria-labelledby="person-h">
      <div className="chapter-no display" aria-hidden="true">I</div>
      <div className="person-grid">
        <header className="person-head">
          <p className="mono dim">CHAPTER I — THE PERSON</p>
          <h2 id="person-h" className="display person-title">
            A human who builds things, then writes down what’s wrong with them.
          </h2>
        </header>

        <div className="person-body">
          <p className="serif lead">
            K&nbsp;S&nbsp;Pankaj is a developer studying for an MCA in Mangaluru. So far that has produced an Android ticketing app, a desktop journal that keeps every day as a plain file, a card lounge that proves its shuffles, and a digital twin that is not allowed to learn anything without asking first.
          </p>
          <p className="serif">
            This site is the first thing he has made that introduces <em>him</em> rather than his work. Most of it is documentation of experiments, a little is a joke, none of it is padded. When something doesn’t exist yet, it says so — see the Trophy Room, or the project called Flow&nbsp;&amp;&nbsp;Magic, which today is a licence file with ambitions.
          </p>
          <aside className="margin mono" aria-label="Note">
            <span className="dim">↳ the python in the intro is a character, not a mascot: curiosity, code, chaos. It escaped.</span>
          </aside>
        </div>

        <dl className="specimen mono" aria-label="Specimen sheet">
          <div><dt>SPECIMEN</dt><dd>{profile.name}</dd></div>
          <div><dt>ROLE</dt><dd>{profile.role}</dd></div>
          <div><dt>STUDYING</dt><dd>{profile.study}</dd></div>
          <div><dt>BEFORE</dt><dd>{profile.priorStudy}</dd></div>
          {profile.roles.map((r) => (
            <div key={r.org}><dt>{r.when.toUpperCase()}</dt><dd>{r.title}, {r.org}</dd></div>
          ))}
          <div><dt>ON RECORD</dt><dd>{real} projects in the lab, {projects.filter((p) => p.status === 'concept').length} concept</dd></div>
        </dl>

        <ul className="skills mono" aria-label="Tools">
          {profile.skills.map((s) => <li key={s}>{s}</li>)}
        </ul>

        <ul className="community serif">
          {profile.community.map((c) => <li key={c}>{c}</li>)}
        </ul>
      </div>
    </section>
  )
}
