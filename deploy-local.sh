#!/usr/bin/env bash
set -euo pipefail

IMAGE="ghcr.io/comicivans/ivan:latest"
DOCKER_PLATFORM="${DOCKER_PLATFORM:-linux/amd64}"

if [ ! -f ".env" ]; then
  printf 'ERROR: .env no encontrado\n' >&2
  exit 1
fi

set -a
# shellcheck disable=SC1091
. ./.env
set +a

: "${SITE_URL:?ERROR: SITE_URL no definido}"

build_args=(
  --build-arg "SITE_URL=$SITE_URL"
)

if [ -n "${NUXT_UMAMI_HOST:-}" ]; then
  build_args+=(--build-arg "NUXT_UMAMI_HOST=$NUXT_UMAMI_HOST")
fi

if [ -n "${NUXT_UMAMI_ID:-}" ]; then
  build_args+=(--build-arg "NUXT_UMAMI_ID=$NUXT_UMAMI_ID")
fi

docker buildx build \
  --platform "$DOCKER_PLATFORM" \
  "${build_args[@]}" \
  -t "$IMAGE" \
  --load \
  .

docker compose --env-file .env up -d --pull never --force-recreate
