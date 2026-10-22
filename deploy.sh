#!/usr/bin/env bash
# Builds the production image, pushes it to the registry and recreates the
# container on the VPS with the docker-compose.yml of this checkout.
# Settings come from .env.deploy (see .env.deploy.example).
set -euo pipefail

cd "$(dirname -- "${BASH_SOURCE[0]}")"

log() {
  printf '== %s ==\n' "$1"
}

fail() {
  printf 'ERROR: %s\n' "$1" >&2
  exit 1
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || fail "$1 no está disponible en local"
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

build_and_push_image() {
  local build_args=(
    --build-arg "SITE_URL=$SITE_URL"
  )

  if [ -n "${NUXT_UMAMI_HOST:-}" ]; then
    build_args+=(--build-arg "NUXT_UMAMI_HOST=$NUXT_UMAMI_HOST")
  fi

  if [ -n "${NUXT_UMAMI_ID:-}" ]; then
    build_args+=(--build-arg "NUXT_UMAMI_ID=$NUXT_UMAMI_ID")
  fi

  if docker buildx version >/dev/null 2>&1; then
    docker buildx build \
      --platform "$DOCKER_PLATFORM" \
      "${build_args[@]}" \
      -t "$IMAGE" \
      --push \
      .
    return
  fi

  docker build \
    --platform "$DOCKER_PLATFORM" \
    "${build_args[@]}" \
    -t "$IMAGE" \
    .
  docker push "$IMAGE"
}

load_deploy_env

IMAGE="${IMAGE:-ghcr.io/comicivans/ivan:latest}"
DOCKER_PLATFORM="${DOCKER_PLATFORM:-linux/amd64}"

: "${SITE_URL:?ERROR: SITE_URL no definido}"
: "${VPS_HOST:?ERROR: VPS_HOST no definido}"
: "${REMOTE_DIR:?ERROR: REMOTE_DIR no definido}"

require_command docker
require_command ssh
require_command scp

# The VPS logs in to GHCR only when credentials are configured; otherwise it
# relies on an earlier `docker login` there. The token travels inside the
# remote script on stdin, never on a command line.
remote_login=""
if [ -n "${GHCR_USERNAME:-}" ] && [ -n "${GHCR_TOKEN:-}" ]; then
  log "GHCR login (local)"
  docker login ghcr.io -u "$GHCR_USERNAME" --password-stdin <<<"$GHCR_TOKEN"
  remote_login="echo '== GHCR login (VPS) =='
docker login ghcr.io -u $(printf '%q' "$GHCR_USERNAME") --password-stdin <<<$(printf '%q' "$GHCR_TOKEN")"
fi

log "Build and push: $IMAGE"
build_and_push_image

# Upload under a temporary name; the remote step moves it into place, so an
# interrupted copy never replaces the running configuration.
log "Copia de docker-compose.yml al VPS"
scp -q docker-compose.yml "$VPS_HOST:$REMOTE_DIR/docker-compose.yml.new"

log "Deploy en VPS con docker compose"
ssh "$VPS_HOST" bash -s <<EOF
set -euo pipefail

cd $(printf '%q' "$REMOTE_DIR")

if [ ! -f .env ]; then
  echo 'ERROR: falta .env (variables de runtime) en el VPS; créalo a partir de .env.example' >&2
  exit 1
fi

mv docker-compose.yml.new docker-compose.yml
export IMAGE=$(printf '%q' "$IMAGE")

$remote_login

echo "== Descarga de la imagen =="
docker compose pull

echo "== Recreate de contenedores =="
docker compose up -d --remove-orphans

echo "== Estado actual =="
docker compose ps
EOF

printf 'Deploy terminado correctamente\n'
