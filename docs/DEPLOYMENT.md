# Deployment

## Static hosting (recommended, free)
- **GitHub Pages:** `.github/workflows/pages.yml` builds with `VITE_BASE=/pank-os/` and publishes `dist/`. Enable once: Settings → Pages → Source: GitHub Actions. Site: `https://pankqx.github.io/pank-os/`.
- **Vercel/Netlify:** import the repo; build `npm run build`, output `dist`; leave `VITE_BASE` unset.

## Environment variables (all optional, public)
`VITE_COMPANION_ENDPOINT`, `VITE_NEWSLETTER_ENDPOINT`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` — see `.env.example`. Never put a service-role key or provider API key in any `VITE_*` variable.

## Backend (not built)
`supabase/schema.sql` is a **draft, never applied or tested**: conversations/messages tables with RLS `user_id = auth.uid()`. Before using, verify current Supabase free-tier limits and terms, enable email auth, apply the SQL, and test policies with two users. A serverless function should proxy any model API.

## Pre-launch checks
`npm run typecheck && npm test && npm run build`; open `dist` with `npm run preview`; run a Lighthouse pass; verify LinkedIn handle; add `public/portrait.jpg`; replace sample posts.
