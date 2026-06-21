# Rules Index

Rules are constraints applied automatically during code generation.
Always-active rules apply to every file; glob-targeted rules fire only on matching paths.

## Always Active
| Rule | Covers |
|---|---|
| [general.mdc](general.mdc) | Core philosophy, naming conventions, anti-patterns, definition of done |
| [solid.mdc](solid.mdc) | SOLID principles applied to TypeScript and React |
| [testing.mdc](testing.mdc) | Unit and integration test conventions |

## Frontend
*Applies to `app/**/*.tsx`, `components/**/*.tsx`, `**/*.css`*

| Rule | Covers |
|---|---|
| [frontend/components.mdc](frontend/components.mdc) | Server/client split, hooks, Tailwind patterns |
| [frontend/style-guide.mdc](frontend/style-guide.mdc) | Brand aesthetic and typography system |

## Backend
*Applies to `server/**/*.ts`, `app/api/**/*.ts`, `prisma/**`*

| Rule | Covers |
|---|---|
| [backend/api.mdc](backend/api.mdc) | tRPC, REST, auth, and reliability patterns |
| [backend/database.mdc](backend/database.mdc) | Prisma access patterns and query rules |
