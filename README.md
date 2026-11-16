# Casa

A single-admin todo app with a filterable list and a Gantt chart over the same data.

Todos have a title, description, status (`TODO`, `IN_PROGRESS`, `DONE`, `CANCELLED`), start and end dates, an optional category and optional file attachments. Drag a bar on the Gantt chart to reschedule.

**Stack:** Next.js (App Router) · React 19 · TypeScript · Tailwind v4 + shadcn/ui · Prisma + SQLite · Better Auth · zod · frappe-gantt

## Getting started

Requires Node.js 24 and npm.

```bash
npm install
cp .env.example .env      # set BETTER_AUTH_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm run db:migrate
npm run dev               # http://localhost:3000
```

The admin account is created from `ADMIN_EMAIL` / `ADMIN_PASSWORD` on first start. Sign-up is disabled.

## Scripts

| Command                            | Purpose                        |
| ---------------------------------- | ------------------------------ |
| `npm run dev` / `build` / `start`  | Dev server, build, serve build |
| `npm run lint` / `typecheck`       | ESLint, `tsc`                  |
| `npm run db:migrate` / `db:deploy` | Create / apply migrations      |

## Configuration

See [`.env.example`](.env.example). In production `DATABASE_URL` must be an absolute path (e.g. `file:/data/app.db`). Uploads go to `UPLOAD_DIR` (per-file limit `MAX_UPLOAD_MB`, default 10, max 10 files per todo).

## Status

Under development: the app is feature-complete for local use; tests, Docker and CI/CD deployment are still to come. Design notes are in [`docs/DESIGN.md`](docs/DESIGN.md).

## License

[GPL-3.0](LICENSE)
