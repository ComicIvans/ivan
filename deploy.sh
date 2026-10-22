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

# Two tokens: the push token (write:packages) stays on this machine; only the
# pull token (read:packages) reaches the VPS, where `docker login` stores it.
# A compromised server then cannot replace the image. Without a token, each
# side relies on an earlier `docker login`. GHCR_TOKEN is the former name of
# the push token and is never sent to the VPS.
push_token="${GHCR_PUSH_TOKEN:-${GHCR_TOKEN:-}}"
if [ -z "${GHCR_PUSH_TOKEN:-}" ] && [ -n "${GHCR_TOKEN:-}" ]; then
  printf 'AVISO: GHCR_TOKEN está obsoleto; renómbralo a GHCR_PUSH_TOKEN en .env.deploy.\n' >&2
  if [ -z "${GHCR_PULL_TOKEN:-}" ]; then
    printf 'AVISO: el VPS ya no recibe GHCR_TOKEN; define GHCR_PULL_TOKEN (solo read:packages) o haz allí un docker login.\n' >&2
  fi
fi

if [ -n "${GHCR_USERNAME:-}" ] && [ -n "$push_token" ]; then
  log "GHCR login (local)"
  docker login ghcr.io -u "$GHCR_USERNAME" --password-stdin <<<"$push_token"
fi

# The pull token travels inside the remote script on stdin, never on a
# command line.
remote_login=""
if [ -n "${GHCR_USERNAME:-}" ] && [ -n "${GHCR_PULL_TOKEN:-}" ]; then
  remote_login="echo '== GHCR login (VPS) =='
docker login ghcr.io -u $(printf '%q' "$GHCR_USERNAME") --password-stdin <<<$(printf '%q' "$GHCR_PULL_TOKEN")"
fi

log "Build and push: $IMAGE"
build_and_push_image

# Upload under a temporary name; the remote step moves it into place, so an
# interrupted copy never replaces the running configuration. The file goes
# through ssh so that REMOTE_DIR is quoted for the remote shell exactly as in
# the deploy step (scp would read the same quoting literally in its default
# SFTP mode).
log "Copia de docker-compose.yml al VPS"
ssh "$VPS_HOST" "cat > $(printf '%q' "$REMOTE_DIR")/docker-compose.yml.new" <docker-compose.yml

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
