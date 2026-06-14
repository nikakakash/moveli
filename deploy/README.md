# Moveli — Deployment Runbook

Production runs as a Docker Compose stack: **Caddy** (auto-HTTPS) in front of the **Next.js frontend**
and the **.NET API**, with **Postgres** and **Redis**. The API applies EF Core migrations and seeds
the first admin automatically on startup, so deploys are just "pull new images and restart".

```
Internet ──▶ Caddy :80/:443 ──┬─▶ frontend:3000   (moveli.ge)
                              └─▶ api:8080        (api.moveli.ge)
                                     │
                              postgres:5432   redis:6379
```

Only Caddy is published to the host; the API/frontend/DB are reachable only on the internal Docker
network. That is why `ForwardedHeaders__TrustAllProxies=true` is safe.

---

## 1. Prerequisites

- A small Linux VPS (1–2 vCPU, 2 GB RAM recommended so the frontend image build / app have headroom).
- A domain with two **A records** pointing at the server's public IP:
  - `moveli.ge` → server IP
  - `api.moveli.ge` → server IP
- Ports **80** and **443** open in the firewall. Do **not** open 8080/3000 — they aren't published.
- **GHCR pull access on the server.** Images are pushed to GHCR by CD. Either:
  - make the two packages **public** (GitHub → repo → Packages → each package → Package settings → Change visibility), or
  - `docker login ghcr.io -u <github-user> -p <PAT-with-read:packages>` on the server once.
- The server keeps a checkout of this repo (the deploy pulls compose/Caddyfile updates via `git pull`).
  If the repo is private, add a read-only **deploy key** to the server, or keep the repo public.

## 2. First deploy

```bash
# On the server
git clone https://github.com/nikakakash/moveli.git
cd moveli
bash deploy/bootstrap.sh        # installs Docker, creates .env.prod from the template, then exits
nano .env.prod                  # fill in the REQUIRED values (below)
bash deploy/bootstrap.sh        # run again: pulls images and starts everything
```

Required values in `.env.prod` (see [env.prod.example](env.prod.example) for the full list):

| Variable | Notes |
|---|---|
| `POSTGRES_PASSWORD` | strong random password |
| `JWT_SECRET` | `openssl rand -base64 48` — **changing this later logs everyone out** |
| `ACME_EMAIL` | Let's Encrypt notices |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | creates the first admin on first boot only |
| `SMTP_*` | needed for password-reset + order emails (omit `SMTP_HOST` to log instead) |
| `NEXT_PUBLIC_API_URL` | must be `https://api.moveli.ge/api` (baked into the frontend image) |

Verify: once DNS resolves, `curl https://api.moveli.ge/health` returns `Healthy`, and `https://moveli.ge`
loads. Log in with the seeded admin and confirm `/ka/admin` works.

## 3. Continuous deployment (GitHub Actions)

- **CI** (`.github/workflows/ci.yml`) runs on every PR/push: build + test, a Postgres-backed
  migration + `/health` smoke test, a dependency-vulnerability scan, and the frontend build.
- **CD** (`.github/workflows/cd.yml`) runs on push to `master` (and `v*` tags): builds both images
  and pushes them to **GHCR** (`ghcr.io/nikakakash/moveli-api`, `…/moveli-frontend`), then deploys.

The `deploy` job **only runs if these repository secrets exist** (Settings → Secrets and variables →
Actions). Until then, images still build/push and you can deploy by hand with `bootstrap.sh`.

| Secret | Value |
|---|---|
| `DEPLOY_HOST` | server IP / hostname |
| `DEPLOY_USER` | SSH user (must be in the `docker` group) |
| `DEPLOY_SSH_KEY` | private key whose public half is in the user's `~/.ssh/authorized_keys` |

Optional repository **variable** `NEXT_PUBLIC_API_URL` (defaults to `https://api.moveli.ge/api`) controls
the API URL baked into the frontend image.

The deploy job SSHes in and runs, in the repo checkout on the server:
```bash
IMAGE_TAG=<sha> docker compose -f docker-compose.prod.yml --env-file .env.prod pull
IMAGE_TAG=<sha> docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --remove-orphans
```

## 4. Operations

**Logs:** `docker compose -f docker-compose.prod.yml logs -f api`
**Restart one service:** `docker compose -f docker-compose.prod.yml restart api`
**Roll back:** set `IMAGE_TAG` to a previous commit SHA in `.env.prod` and re-run the compose `up`.

**Database backups (do this before launch):** Postgres data lives in the `postgres_data` volume.
Schedule an off-box dump, e.g. a daily cron:
```bash
docker compose -f docker-compose.prod.yml exec -T postgres \
  pg_dump -U moveli moveli | gzip > "/backups/moveli-$(date +%F).sql.gz"
```
Then copy `/backups` off the server (object storage / another host). Restore with `psql`.

**Persistent volumes that must not be lost:** `postgres_data` (orders/users), `dp_keys`
(DataProtection — losing it invalidates all sessions/antiforgery), `uploads` (product images,
unless using S3), `caddy_data` (TLS certs).

**Rotating `JWT_SECRET`:** update `.env.prod`, `up -d` the api. All existing access/refresh tokens
become invalid; users simply log in again.

## 5. Alternative hosting

- **Behind Cloudflare / a managed load balancer that terminates TLS:** you can drop the `caddy`
  service and instead publish the `frontend`/`api` ports, or use a Cloudflare Tunnel. Keep
  `TRUST_ALL_PROXIES=true` only while the API is not directly reachable from the internet.
- **Managed Postgres/Redis (PaaS):** remove those services and point `ConnectionStrings__*` at the
  managed endpoints via `.env.prod`.
