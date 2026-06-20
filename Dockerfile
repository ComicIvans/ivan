# syntax=docker/dockerfile:1.7

FROM node:24 AS base
WORKDIR /app

RUN npm install --global pnpm@10.33.0 \
  && npm cache clean --force

############################
# Builder
############################
FROM base AS builder

ARG SITE_URL
ARG NUXT_UMAMI_HOST
ARG NUXT_UMAMI_ID

ENV SITE_URL=$SITE_URL \
  NUXT_UMAMI_HOST=$NUXT_UMAMI_HOST \
  NUXT_UMAMI_ID=$NUXT_UMAMI_ID \
  npm_config_nodedir=/usr/local

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
  pnpm config set store-dir /pnpm/store \
  && pnpm install --frozen-lockfile

COPY . .

# NODE_ENV=production is set only for the build (not the install above, where it
# would skip devDependencies like nuxt/vite) so the prod branches of nuxt.config
# (CSP, content DB path, indexability, umami) are taken explicitly instead of
# relying on nuxi's implicit default.
RUN NODE_ENV=production pnpm run build
RUN mkdir -p /runtime-data


############################
# Minimal runtime image
############################
FROM gcr.io/distroless/nodejs24-debian12:nonroot AS runner

WORKDIR /app

ENV NODE_ENV=production \
  NITRO_PORT=3000 \
  HOST=0.0.0.0

# Keep the previous runtime UID so existing Docker volumes remain writable.
USER 1001:1001

# Copy the prebuilt server output.
COPY --from=builder --chown=1001:1001 /runtime-data /data
COPY --from=builder --chown=1001:1001 /app/.output ./.output

EXPOSE 3000
CMD ["/app/.output/server/index.mjs"]
