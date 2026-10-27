#!/usr/bin/env bash
# Builds the image locally and (re)starts the container with docker compose.
# Build settings come from .env.deploy (see .env.deploy.example); the
# container reads its runtime settings from .env.
set -euo pipefail

cd "$(dirname -- "${BASH_SOURCE[0]}")"

fail() {
  printf 'ERROR: %s\n' "$1" >&2
  exit 1
}

# Exports the deploy settings from .env.deploy. Older checkouts kept them in
# the runtime .env, which is still read (with a warning) when .env.deploy is
# missing.
load_deploy_env() {
  local env_file=".env.deploy"

  if [ ! -f "$env_file" ]; then
    [ -f ".env" ] || fail "no existe .env.deploy; créalo a partir de .env.deploy.example"
    printf 'AVISO: no existe .env.deploy; se leen las variables de despliegue de .env.\n' >&2
    printf 'AVISO: muévelas a .env.deploy (ver .env.deploy.example) para que no lleguen al contenedor.\n' >&2
    env_file=".env"
  fi

  set -a
  # Plain KEY=VALUE entries, sourced as shell.
  # shellcheck source=/dev/null
  . "./$env_file"
  set +a
}

load_deploy_env

[ -f ".env" ] || fail "no existe .env (variables de runtime del contenedor); créalo a partir de .env.example"

# Exported so docker compose runs the image built here.
export IMAGE="${IMAGE:-ghcr.io/comicivans/ivan:latest}"
DOCKER_PLATFORM="${DOCKER_PLATFORM:-linux/amd64}"

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
