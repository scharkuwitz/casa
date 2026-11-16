# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Status

M1 (scaffold), M2 (Prisma + Better Auth foundation), M3 (auth gating), M4 (todo/category CRUD) and M5 (list/Gantt views, attachments) are done as of 2026-11-16; later milestones are still **planned design**, not existing files. Verify against the actual tree before relying on any path, and update this file as milestones land.

**Progress tracking is mandatory.** The live milestone checklist and full design doc are in project memory (`~/.claude/projects/-home-dispel-Projects-case/memory/`): `todo-app-milestones.md` (current milestone, next step, deviations, session log) and `todo-app-design.md`. Read the checklist first in every session or after context compaction, tick tasks as they are verified, and log deviations from the design there.

**Next.js here is v16** and differs from older versions: read the relevant guide in `node_modules/next/dist/docs/` before writing Next code (see `AGENTS.md`). Cache Components is deliberately disabled. Frontend look-and-feel: `docs/DESIGN.md` (tokens in `src/app/globals.css`).

## What this is

Single-admin Todo app. Todos have title, description, status (`TODO | IN_PROGRESS | DONE | CANCELLED`), start/end dates, optional category, optional file attachments. Two views of the same data: a filterable list and a Gantt chart. Deployed as one Docker image behind Caddy on a remote Ubuntu host.

## Stack

Next.js App Router (`output: "standalone"`) + React 19 + TypeScript strict · Tailwind v4 + shadcn/ui · Prisma + SQLite · Better Auth (email/password) · zod · `frappe-gantt` · Vitest + Playwright · **npm** (pnpm is not installed).

## Commands

- `npm run dev` / `build` / `start` — Next dev server, production build, serve build
- `npm run lint` — eslint · `npm run typecheck` — `next typegen && tsc --noEmit` · `npm run format` — prettier
- `npm run db:migrate` (prisma migrate dev) / `db:deploy` / `db:studio`; `postinstall` runs `prisma generate` (client is generated into gitignored `src/generated/prisma`). Prisma 7: URL lives in `prisma.config.ts`, driver adapter in `src/lib/db.ts`
- Not yet added: `test` (Vitest), `test:e2e` (Playwright), docker commands (M6, M7)

## Architecture (auth, CRUD, views and attachments implemented; tests/Docker/CI planned)

- **Auth is enforced in two layers.** `src/proxy.ts` (or `middleware.ts` on Next 15) only checks for the session cookie and redirects pages to `/login`; it is not a security boundary. Its matcher excludes `/api/*` (handlers answer 401 themselves, and proxy would silently truncate request bodies over 10 MB). The real check is `requireSession()` (`src/lib/session.ts`; `getSession()` returns null for route handlers to answer 401), which must be called in `src/app/(app)/layout.tsx`, **every** server action in `src/server/`, and **every** API route handler. Sign-up is disabled in Better Auth.
- **Admin account bootstrap** happens in `src/instrumentation.ts` on server start: creates the user from `ADMIN_EMAIL`/`ADMIN_PASSWORD` if missing (idempotent, never overwrites an existing password).
- **Mutations** go through zod-validated server actions (`src/server/todos.ts`, `categories.ts`), with schemas shared with forms in `src/lib/validation.ts`. Form actions return `ActionState` (`src/lib/action-state.ts`) for `useActionState` and echo submitted `values`; forms are `key`ed on them so React 19's post-action reset keeps `<select>` choices. Dates are date-only, stored as UTC midnight; `endDate >= startDate`.
- **Attachments are the exception to server actions**: uploads use a route handler (`api/todos/[id]/attachments`) to avoid the server-action body-size limit; route handlers must call `getSession()` and `isSameOrigin()` (`src/lib/http.ts`) for writes. Paths built in `src/lib/storage.ts` carry `/*turbopackIgnore: true*/` so the standalone tracer does not pull the whole project (`.env`, db) into the build; keep that on any new dynamic `fs` path. Files live under `UPLOAD_DIR/<todoId>/<uuid><ext>` (client filenames are never used on disk) and are only served through the auth-checked `api/attachments/[id]` route. Deleting a todo must also delete its upload directory.
- **List/Gantt** share one query (`?view=&status=&category=&sort=&dir=`, parsed by `parseListQuery` in `src/lib/validation.ts`). **Gantt** is client-only (`gantt-view-loader.tsx` → `next/dynamic`, `ssr: false`); dragging a bar calls the `updateTodoDates` action once on release. frappe-gantt sets bar labels via `innerHTML`, so task names must stay HTML-escaped (see `gantt-view.tsx`). Status maps to bar progress (DONE 100, IN_PROGRESS 50, else 0).
- **`DATABASE_URL` must be absolute in production** (`file:/data/app.db`): standalone `server.js` does `process.chdir`, so relative SQLite paths break.
- **Runtime state is all under `/data`** in the container (`/data/app.db`, `/data/uploads`) on one named volume. The container entrypoint runs `prisma migrate deploy` before `node server.js`, so schema changes ship as committed migrations.

## Deployment

`.github/workflows/deploy.yml` on push to `main`: runs CI (`ci.yml` via `workflow_call`), builds and pushes the image to GHCR tagged `sha-<short>` + `latest`, then SCPs `deploy/compose.prod.yml` + `deploy/Caddyfile` to the server and over SSH writes `.env` from GitHub secrets and runs `docker compose pull && up -d`. Rollback = `workflow_dispatch` with `image_tag` set to an older `sha-…`. Server setup and required secrets: `docs/DEPLOY.md`.
