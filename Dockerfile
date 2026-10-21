# syntax=docker/dockerfile:1.7

# Debian 13 (trixie) builder to match the distroless runtime below; Node 24
# here is always >= 24.15, the floor required by Nuxt 4.6 and Nuxt SEO 6.
FROM node:24-trixie AS base
WORKDIR /app

# Same pnpm release as package.json "packageManager".
RUN npm install --global pnpm@12.11.2 \
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
  NUXT_UMAMI_ID=$NUXT_UMAMI_ID

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
  pnpm install --frozen-lockfile --store-dir /pnpm/store

COPY . .

# NODE_ENV=production is set only for the build (not the install above, where it
# would skip devDependencies like nuxt/vite) so the prod branches of nuxt.config
# (CSP, content DB path, indexability, umami) are taken explicitly instead of
# relying on nuxi's implicit default. The build runs out of memory with Node's
# default heap limit, so NODE_OPTIONS raises it to 6 GB.
RUN NODE_ENV=production NODE_OPTIONS=--max-old-space-size=6144 pnpm run build

# better-sqlite3 13 ships prebuilt binaries for eight platforms and the server
# bundle traces all of them (about 17 MB). It loads prebuilds/<platform>-<arch>
# at runtime, and this stage runs on the same platform and glibc as the runtime
# image, so keep only that binary and fail the build if it is missing.
RUN target="$(node -p 'process.platform + "-" + process.arch')" \
  && find .output/server/node_modules -path '*/better-sqlite3*/prebuilds/*.node' ! -name "${target}.node" -delete \
  && find .output/server/node_modules -path "*/better-sqlite3*/prebuilds/${target}.node" | grep -q .

RUN mkdir -p /runtime-data


############################
# Minimal runtime image
############################
FROM gcr.io/distroless/nodejs24-debian13:nonroot AS runner

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
