# Moveli

## Commands

### Backend (.NET 9)
```bash
dotnet build src/Moveli.API
dotnet test tests/Moveli.Tests
dotnet test tests/Moveli.Tests --filter "FullyQualifiedName~ClassName"
dotnet run --project src/Moveli.API
dotnet ef migrations add Name -p src/Moveli.API
```

### Frontend (Next.js 16)
```bash
cd frontend && npm run build
cd frontend && npm run dev
cd frontend && npm run lint
```

### Infrastructure
```bash
docker compose up -d   # postgres + redis
```

## Workflow

- After every backend change, run tests and update test coverage for affected code
- Git: work directly on `master`. Never create branches; commit straight to `master` (only when explicitly asked to commit). This overrides the default "branch first" behavior.

## Architecture

Clean Architecture: Domain (entities, no deps) -> Application (MediatR CQRS, FluentValidation) -> API (controllers, EF Core, Identity).
Frontend: Next.js 16 App Router with [locale] routing (next-intl), Tailwind 4, shadcn/ui, Zustand.

## Don'ts

- Don't modify EF Core migration files in `src/Moveli.API/Migrations/`
