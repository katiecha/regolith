---
paths:
  - "src/server/**/*.ts"
  - "app/api/**/*.ts"
---

# API Rules

## tRPC (Internal)
- End-to-end type safety
- No manual typing of request/response

## REST (External)
- Validate all input with Zod
- Always check `response.ok`
- Return shape: `{ data: T }` or `{ error: string }`

## Reliability
- All critical operations must be idempotent and retry-safe
- Multi-step operations use queues, not inline handlers
- All mutations must be traceable (logs or events)

## Security
- Enforce auth at API layer
- Never trust client input
- No raw SQL unless necessary
