# syntax=docker/dockerfile:1.7

############################
# Builder
############################
FROM node:24-slim AS builder
WORKDIR /app

RUN corepack enable

# Toolchain required for native addons such as better-sqlite3.
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
# Minimal runtime image
############################
FROM node:24-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NITRO_PORT=3000
ENV HOST=0.0.0.0

RUN corepack enable

# Only install production dependencies in the runtime image.
COPY package.json pnpm-lock.yaml ./

# Skip postinstall scripts in the runtime image.
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
  pnpm config set store-dir /pnpm/store \
  && pnpm install --prod --frozen-lockfile --ignore-scripts

# Copy the prebuilt server output.
COPY --from=builder /app/.output ./.output

# Use a non-root user at runtime.
RUN useradd -m -u 1001 nodeuser

# Create the content database directory with the right ownership.
RUN mkdir -p /data && chown -R nodeuser:nodeuser /data

USER nodeuser

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
