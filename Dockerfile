# syntax=docker/dockerfile:1
# Production image: Next.js standalone server + Prisma CLI for `migrate deploy` on start.
# Runtime state (SQLite db + uploads) lives on the /data volume.

ARG NODE_IMAGE=node:24-bookworm-slim

FROM ${NODE_IMAGE} AS base
ENV NEXT_TELEMETRY_DISABLED=1
# openssl lets Prisma detect the platform and pick the right schema-engine binary.
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# ---- deps: full install (dev deps are needed to build); postinstall runs `prisma generate` ----
FROM base AS deps
COPY package.json package-lock.json prisma.config.ts ./
COPY prisma ./prisma
RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund

# ---- build: standalone output ----
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate && npm run build

# ---- migrator: standalone Prisma CLI pinned to the lockfile version ----
FROM base AS migrator
WORKDIR /opt/prisma
COPY package-lock.json /tmp/package-lock.json
RUN --mount=type=cache,target=/root/.npm \
  v() { node -p "require('/tmp/package-lock.json').packages['node_modules/$1'].version"; } \
  && echo '{"private":true}' > package.json \
  && npm install --no-audit --no-fund --omit=dev --no-package-lock \
     "prisma@$(v prisma)" "dotenv@$(v dotenv)" \
  && rm /tmp/package-lock.json
COPY prisma.config.ts ./
COPY prisma ./prisma
# Applying the migrations to a scratch db checks them and makes sure the schema engine is present
# in the image (no download at container start).
RUN DATABASE_URL=file:/tmp/check.db node node_modules/prisma/build/index.js migrate deploy \
  && rm -f /tmp/check.db

# ---- runner ----
FROM base AS runner
RUN apt-get update \
  && apt-get install -y --no-install-recommends tini \
  && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    DATABASE_URL=file:/data/app.db \
    UPLOAD_DIR=/data/uploads

COPY --from=migrator /opt/prisma /opt/prisma
COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --chmod=755 docker/entrypoint.sh /usr/local/bin/app-entrypoint

# App files stay root-owned (read-only for the app user); only /data and the Next cache are writable.
RUN mkdir -p /data/uploads .next/cache \
  && chown -R node:node /data .next/cache
USER node
VOLUME /data
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/health').then(r=>process.exit(r.ok?0:1),()=>process.exit(1))"]

ENTRYPOINT ["tini", "--", "app-entrypoint"]
CMD ["node", "server.js"]
