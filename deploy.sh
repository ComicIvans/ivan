#!/usr/bin/env bash
set -euo pipefail

IMAGE="${IMAGE:-ghcr.io/comicivans/ivan:latest}"
DOCKER_PLATFORM="${DOCKER_PLATFORM:-linux/amd64}"

log() {
  printf '== %s ==\n' "$1"
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || {
    printf 'ERROR: %s no está disponible en local\n' "$1" >&2
    exit 1
  }
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

load_env_file() {
  local env_file="$1"

  if [ -f "$env_file" ]; then
    set -a
    # The deployment variables are simple KEY=VALUE entries.
    # shellcheck disable=SC1090
    . "$env_file"
    set +a
  fi
}

load_env_file ".env"

: "${SITE_URL:?ERROR: SITE_URL no definido}"
: "${VPS_HOST:?ERROR: VPS_HOST no definido}"
: "${REMOTE_DIR:?ERROR: REMOTE_DIR no definido}"

require_command docker
require_command ssh

log "Build and push: $IMAGE"
build_and_push_image

log "Deploy en VPS con docker compose"
ssh "$VPS_HOST" bash -s <<EOF
set -euo pipefail

cd "$REMOTE_DIR"

echo "== Recreate de contenedores =="
docker compose up -d --pull always --remove-orphans

echo "== Estado actual =="
docker compose ps
EOF

printf 'Deploy terminado correctamente\n'
