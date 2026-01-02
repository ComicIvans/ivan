#!/usr/bin/env bash
set -euo pipefail

IMAGE="ghcr.io/comicivans/ivan:latest"

# Cargar variables desde .env si existe
if [ -f ".env" ]; then
  set -a
  source .env
  set +a
fi

: "${VPS_HOST:?ERROR: VPS_HOST no definido}"
: "${REMOTE_DIR:?ERROR: REMOTE_DIR no definido}"

command -v docker >/dev/null 2>&1 || { echo "ERROR: docker no está instalado en local"; exit 1; }
command -v ssh >/dev/null 2>&1 || { echo "ERROR: ssh no está disponible en local"; exit 1; }

echo "== Build + push: $IMAGE =="
# Si no tienes buildx configurado: docker buildx create --use
docker buildx build \
  --platform linux/amd64 \
  -t "$IMAGE" \
  --push \
  .

echo "== Deploy en VPS con docker compose (pull + up) =="
ssh "$VPS_HOST" bash -s <<EOF
set -euo pipefail

cd "$REMOTE_DIR"

echo "== Pull de la nueva imagen =="
docker compose pull

echo "== Recreate de contenedores =="
docker compose up -d

echo "== Limpieza de imágenes y recursos no usados =="
docker system prune -f

echo "== Estado actual =="
docker compose ps
EOF

echo "✅ Deploy terminado correctamente"
