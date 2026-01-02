# syntax=docker/dockerfile:1.7

############################
# Builder
############################
FROM node:24-slim AS builder
WORKDIR /app

RUN corepack enable

# Toolchain para compilar addons nativos (better-sqlite3, etc.)
RUN apt-get update && apt-get install -y --no-install-recommends \
  python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package.json pnpm-lock.yaml ./

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
  pnpm config set store-dir /pnpm/store \
  && pnpm install --frozen-lockfile

COPY . .

ENV npm_config_build_from_source=true
RUN pnpm rebuild better-sqlite3

RUN pnpm run build


############################
# Runner (mínimo)
############################
FROM node:24-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NITRO_PORT=3000
ENV HOST=0.0.0.0

RUN corepack enable

# Solo lo necesario para instalar prod deps (sin toolchain)
COPY package.json pnpm-lock.yaml ./

# Importante: --ignore-scripts para que NO ejecute "postinstall: nuxt prepare"
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
  pnpm config set store-dir /pnpm/store \
  && pnpm install --prod --frozen-lockfile --ignore-scripts

# Copiamos el build ya hecho
COPY --from=builder /app/.output ./.output

# Usuario no-root
RUN useradd -m -u 1001 nodeuser

# Crear carpeta para base de datos y dar permisos
RUN mkdir -p /data && chown -R nodeuser:nodeuser /data

USER nodeuser

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
