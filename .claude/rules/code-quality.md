---
alwaysApply: true
---

# Code Quality

## Anti-defaults (counter common Claude tendencies)

- No premature abstractions. Three similar lines beats a helper used once.
- Don't add features or improvements beyond what was asked.
- Don't refactor adjacent code while fixing a bug.
- No dead code or commented-out blocks. Git has history.
- WHY comments, never WHAT. If code needs a "what" comment, rename instead.
- API docs at module boundaries only, not every internal function.

## Naming

- C# backend: PascalCase for classes, methods, properties, and public fields. camelCase for local variables and parameters. `I` prefix for interfaces (`IProductService`). `_camelCase` for private fields.
- Frontend: PascalCase for components and types (`UserProfile.tsx`), camelCase for functions/variables, kebab-case for directories and utility files (`date-utils.ts`).
- Booleans: `is` / `has` / `should` / `can` prefix. Functions: verb-first (`getUser`). Handlers: `handle*` internal, `on*` as props.
- Constants: `SCREAMING_SNAKE` (frontend) or PascalCase (C#).
- Abbreviations only when universally known (`id`, `url`, `api`, `db`, `auth`). Acronyms as words: `userId`, not `userID`.

## Code Markers

`TODO(author): desc (#issue)` for planned work. `FIXME(author): desc (#issue)` for known bugs. `HACK(author): desc (#issue)` for ugly workarounds (explain the proper fix). `NOTE: desc` for non-obvious context. Owner and issue link required. Never `XXX`, `TEMP`, `REMOVEME`.

## File Organization

- Imports: builtins, external, internal, relative, types. Blank line between groups.
- Exports: named over default. One component or class per file.
- Function order: public API first, then helpers in call order.
