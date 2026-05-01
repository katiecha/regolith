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
- Server components by default, `"use client"` only when needed
- Co-locate code where it's used
- One component/hook per file
- All inputs validated with Zod

## Conventions
- Files: kebab-case
- Components: PascalCase
- Functions: camelCase
- Constants: UPPER_SNAKE_CASE
- Hooks: useX

See `.claude/rules/` for detailed guidelines.
