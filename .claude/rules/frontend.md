---
paths:
  - "frontend/src/**/*.tsx"
  - "frontend/src/**/*.css"
  - "frontend/src/**/components/**"
---

# Frontend

## Design Tokens

Before writing frontend code, find the project's existing tokens file (`tokens.css`, `variables.css`, `theme.ts`, `tailwind.config.*`, `_variables.scss`). If none exists, create one. Never hardcode raw values in components.

Required token categories: colors (semantic names with dark mode variants), spacing scale, border radius, shadows (elevation system), typography (display + body + mono fonts, type scale, weights), breakpoints, transitions (durations + easing), z-index scale.

## Component Framework

This project uses:
- **CSS**: Tailwind CSS 4
- **Primitives**: shadcn/ui (Base UI React primitives)
- **Icons**: Lucide + Phosphor
- **State**: Zustand (client), react-hook-form + zod (forms)
- **i18n**: next-intl

Don't mix in competing libraries.

## Layout

- CSS Grid for 2D, Flexbox for 1D. Use `gap`, not margin hacks.
- Semantic HTML: `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`.
- Mobile-first. Touch targets: minimum 44x44px.

## Accessibility (non-negotiable)

- All interactive elements keyboard-accessible.
- Images: meaningful `alt` text. Decorative: `alt=""`.
- Form inputs: associated `<label>` or `aria-label`.
- Contrast: 4.5:1 normal text, 3:1 large text.
- Visible focus indicators. Never `outline: none` without replacement.
- Color never the sole indicator.
- `aria-live` for dynamic content. Respect `prefers-reduced-motion` and `prefers-color-scheme`.

## Performance

- Images: `loading="lazy"` below fold, explicit `width`/`height`.
- Fonts: `font-display: swap`.
- Animations: `transform` and `opacity` only.
- Large lists: virtualize at 100+ items.
- Bundle size: never import a whole library for one function.
