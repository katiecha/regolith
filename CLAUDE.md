# Regolith

## Commands
- Build: `npm run build`
- Dev: `npm run dev`
- Test: `npm test`
- Lint: `npm run lint`

## Stack
- Next.js (App Router)
- TypeScript (strict mode)
- Tailwind CSS
- Prisma + PostgreSQL
- tRPC (internal) / REST (external)

## Rules
- Named exports only, no default exports
- Server components by default, `"use client"` only on leaf components that need browser APIs
- Co-locate code where it's used
- One component/hook per file
- All inputs validated with Zod
- Function declarations for components, not arrow functions
- Semantic `key` props in `.map()` — never index-based

## Accessibility
- Semantic HTML throughout (`<section>`, `<nav>`, `<ul>`, `<li>`, etc.)
- `lang="en"` on `<html>`
- All `target="_blank"` links must have `rel="noopener noreferrer"`

## Performance
- `next/image` with explicit `width` and `height` always provided

## Responsive
- Mobile-first; use a single breakpoint (`md` / 768px) — avoid `sm`, `lg`, `xl`
- Separate mobile and desktop nav layouts, not just resized versions

## Conventions
- Files: kebab-case
- Components: PascalCase
- Functions: camelCase
- Constants: UPPER_SNAKE_CASE
- Hooks: useX

## Scope
- Default to localized changes; don't refactor unrelated code
- Ask before making systemic changes that affect shared patterns

See `.claude/rules/` for detailed guidelines.
