import { useEffect, useRef } from 'react'
import type { Post } from '../content/types'
import { posts } from '../content/posts'
import { FireBackdrop } from '../fx/FireBackdrop'

function Block({ text }: { text: string }) {
  if (text.startsWith('## ')) return <h3 className="display essay-h">{text.slice(3)}</h3>
  if (text.startsWith('> ')) return <blockquote className="serif essay-quote">{text.slice(2)}</blockquote>
  const img = /^!\[(.*)\]\((.*)\)$/.exec(text)
  if (img) return <figure className="essay-fig"><img src={img[2]} alt={img[1]} loading="lazy" /><figcaption className="mono dim">{img[1]}</figcaption></figure>
  return <p className="serif">{text}</p>
}

/** A blog post as its own photo-essay page (hash route #post/slug). */
export function PostPage({ post }: { post: Post }) {
  const close = useRef<HTMLAnchorElement>(null)
  const box = useRef<HTMLDivElement>(null)
  const i = posts.findIndex((p) => p.slug === post.slug)
  const next = posts[(i + 1) % posts.length]
  useEffect(() => {
    close.current?.focus()
    box.current?.scrollTo({ top: 0 })
    document.body.style.overflow = 'hidden'
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') location.hash = 'transmissions' }
    window.addEventListener('keydown', key)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', key) }
  }, [post.slug])

  return (
    <div className="dossier essay" role="dialog" aria-modal="true" aria-labelledby="essay-h" ref={box}>
      <div className="essay-hero">
        <FireBackdrop />
        {post.cover && <img className="essay-cover" src={post.cover} alt="" />}
        <div className="essay-title">
          <a ref={close} href="#transmissions" className="mono dos-close">✕ close · esc</a>
          <p className="mono">{post.date} · {post.category}{post.readingJoke ? ` · ${post.readingJoke}` : ''}</p>
          <h2 id="essay-h" className="display">{post.title}</h2>
          <p className="serif lead">{post.excerpt}</p>
        </div>
      </div>
      <article className="essay-body">
        {post.body.map((b, k) => <Block key={k} text={b} />)}
        <footer className="essay-foot mono">
          <a href="#transmissions">← all transmissions</a>
          <a href={`#post/${next.slug}`}>next: {next.title} →</a>
        </footer>
      </article>
    </div>
  )
}
