# Casa

A calendar with a filterable list and a Gantt chart over the same data.

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

## Docker

```bash
docker compose up --build   # http://localhost:3000 (APP_PORT to change)
docker compose down         # data survives; `down -v` deletes it
```

`compose.yml` builds the production image and takes `BETTER_AUTH_SECRET`, `ADMIN_EMAIL` and `ADMIN_PASSWORD` from your `.env`. The container runs as the non-root `node` user, keeps the database and uploads on the `casa-data` volume (`/data/app.db`, `/data/uploads`), applies pending migrations with `prisma migrate deploy` on every start and reports health from `/api/health`. If you bind-mount a host directory instead of the named volume, make it writable by uid 1000.

## Status

Under development: the app, tests and Docker image are done; CI/CD deployment is still to come. Design notes are in [`docs/DESIGN.md`](docs/DESIGN.md).

## License

[GPL-3.0](LICENSE)
