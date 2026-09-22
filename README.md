# madres-ui

Monorepo (npm workspaces) for Madres Taco Shop's web apps.

## Apps

- [`apps/madres-web`](apps/madres-web/) — public-facing site (`madrestacoshop.com` / `dev.madrestacoshop.com`).

An admin app (`admin.madrestacoshop.com` / `admin-dev.madrestacoshop.com`) will land under `apps/` later.

## Developing

```sh
npm install
npm run dev
```

Root scripts (`dev`, `build`, `preview`, `check`, `lint`, `format`, `test`, `test:unit`, `test:e2e`) delegate to `apps/madres-web`. See that app's own README/AGENTS.md for app-specific details.
