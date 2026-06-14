#!/usr/bin/env bash
# One-time (and re-runnable) VPS setup for the Moveli production stack.
# Run from the repository root on an Ubuntu/Debian server:
#   ./deploy/bootstrap.sh
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

echo "==> Installing Docker (if missing)"
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
  systemctl enable --now docker
else
  echo "    Docker already installed: $(docker --version)"
fi

# The compose plugin ships with modern Docker; verify it.
if ! docker compose version >/dev/null 2>&1; then
  echo "ERROR: 'docker compose' plugin not available. Install docker-compose-plugin and re-run." >&2
  exit 1
fi

echo "==> Checking environment file"
if [ ! -f .env.prod ]; then
  cp deploy/env.prod.example .env.prod
  echo "    Created .env.prod from the template."
  echo "    >>> EDIT .env.prod now and set POSTGRES_PASSWORD, JWT_SECRET, ACME_EMAIL,"
  echo "        SEED_ADMIN_*, and SMTP_* before continuing. Then re-run this script."
  exit 1
fi

echo "==> Pulling images and starting the stack"
docker compose -f docker-compose.prod.yml --env-file .env.prod pull
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --remove-orphans

echo "==> Pruning dangling images"
docker image prune -f >/dev/null || true

echo "==> Done. Current status:"
docker compose -f docker-compose.prod.yml --env-file .env.prod ps
echo
echo "Health: once DNS for SITE_DOMAIN/API_DOMAIN points here, check https://<API_DOMAIN>/health"
