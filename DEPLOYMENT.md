# Moveli — Deployment Guide

Host-agnostic deployment. The app is two containers (API + frontend) plus PostgreSQL and Redis.
TLS is terminated by your proxy/load balancer; the containers serve plain HTTP internally.

## Build

```bash
# API (build from repo root)
docker build -f src/Moveli.API/Dockerfile -t moveli-api .

# Frontend (NEXT_PUBLIC_* are inlined at build time → pass as build args)
docker build -t moveli-web \
  --build-arg NEXT_PUBLIC_API_URL=https://api.moveli.ge/api \
  --build-arg NEXT_PUBLIC_SITE_URL=https://moveli.ge \
  frontend
```

Or run the whole stack: `docker compose -f docker-compose.prod.yml up -d` (provide the env vars below).

## Database & migrations

Migrations run automatically on API startup (`Database.MigrateAsync()`). No manual step needed.
Seeding: roles + the settings row are always created. **Demo catalog and the default admin are
only seeded in Development.** In Production, an admin is created only if `Seed:AdminEmail` and
`Seed:AdminPassword` are set (otherwise create the admin out of band). No known-password account
is ever provisioned in production.

## Required API environment variables

| Variable (env / `__` form) | Required | Notes |
|---|---|---|
| `ASPNETCORE_ENVIRONMENT=Production` | yes | Enables prod logging + HSTS, disables demo seeding/Swagger |
| `ConnectionStrings__DefaultConnection` | yes | Npgsql connection string |
| `ConnectionStrings__Redis` | recommended | Enables distributed cache; omit to use in-process cache |
| `Jwt__Secret` | yes | High-entropy secret (≥32 chars). **Rotate from any value ever committed.** |
| `Jwt__Issuer`, `Jwt__Audience` | default `moveli.ge` | |
| `Cors__AllowedOrigins__0` | yes | The frontend origin, e.g. `https://moveli.ge` |
| `Frontend__BaseUrl` | yes | Used to build password-reset links in emails |
| `DataProtection__KeysPath` | recommended | Shared volume so auth/antiforgery keys survive restarts & multi-instance |
| `Storage__UploadsPath` | local storage | Shared volume if using local file storage |
| `ForwardedHeaders__KnownProxies__0` / `ForwardedHeaders__TrustAllProxies=true` | yes behind a proxy | So client IP / scheme are correct (rate limiting, HTTPS) |
| `Seed__AdminEmail`, `Seed__AdminPassword` | optional | Provision the first admin on a fresh DB |

### Object storage (optional, recommended for multi-instance)

Local disk is the default and is fine for a single instance with a persistent volume. For durable
/ multi-instance uploads use an S3-compatible store (Cloudflare R2, AWS S3, MinIO):

| Variable | Notes |
|---|---|
| `Storage__Provider=S3` | switch from local disk to object storage |
| `Storage__S3__ServiceUrl` | e.g. `https://<account>.r2.cloudflarestorage.com` (omit for AWS S3) |
| `Storage__S3__Region` | for AWS S3 |
| `Storage__S3__Bucket` | bucket name |
| `Storage__S3__AccessKey`, `Storage__S3__SecretKey` | credentials |
| `Storage__S3__PublicBaseUrl` | public CDN/base URL files are served from |

Add the public storage host to `frontend/next.config.ts` `images.remotePatterns`.

### Email (optional — password reset & order emails)

If `Email__Host` is unset, the app **logs** emails instead of sending (fine for first launch, but
password reset links then only appear in logs). To send real mail:

| Variable | Notes |
|---|---|
| `Email__Host`, `Email__Port` | SMTP server (port default 587) |
| `Email__User`, `Email__Password` | SMTP credentials |
| `Email__FromAddress`, `Email__FromName` | sender identity |

## Required frontend environment variables (build-time)

| Variable | Notes |
|---|---|
| `NEXT_PUBLIC_API_URL` | API base incl. `/api`, e.g. `https://api.moveli.ge/api` |
| `NEXT_PUBLIC_SITE_URL` | site origin for robots/sitemap, e.g. `https://moveli.ge` |

## Health checks

`GET /health` verifies database connectivity and the distributed cache. Point your
orchestrator's readiness probe at it.

## Pre-launch checklist (operator)

- [ ] Set a fresh `Jwt__Secret`; purge any previously committed secret from git history.
- [ ] Rotate the dev DB password if that database is reachable.
- [ ] Set `Seed__AdminEmail` / `Seed__AdminPassword` (or create the admin manually) — verify no
      `Admin123!` account exists.
- [ ] Configure `ForwardedHeaders` for your proxy.
- [ ] Point `moveli.ge` DNS + TLS at the frontend; `api.moveli.ge` at the API.
- [ ] (Optional) configure object storage and SMTP.
- [ ] Fill the real contact details on the Contact page.

## Deferred for v1 (not yet implemented)

Online card payments (checkout is cash-on-delivery only), SMS, returns workflow, invoices/VAT,
abandoned-cart recovery, web analytics. See `docs/superpowers/plans` / the readiness plan.
