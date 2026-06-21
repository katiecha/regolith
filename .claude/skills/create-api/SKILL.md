---
description: Creates a new tRPC procedure or REST API endpoint with auth, Zod validation, and proper error handling
argument-hint: <resource-name>
user-invocable: true
tags: [scaffold]
---

# Create API

Scaffold a new API endpoint following project conventions.

## Choosing the Right Pattern

- **tRPC** — internal app usage (client ↔ server within this app)
- **REST** — external consumers or webhooks

## tRPC Procedure

### Structure

```
server/routers/
└── <resource>.ts
```

### Pattern

```ts
import { z } from "zod"
import { protectedProcedure, publicProcedure, router } from "../trpc"

export const resourceRouter = router({
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.resource.findUnique({ where: { id: input.id } })
    }),

  create: protectedProcedure
    .input(z.object({ name: z.string().min(1).max(255) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.resource.create({ data: input })
    }),
})
```

### Wiring Up

Add to the root router in `server/routers/_app.ts`:

```ts
export const appRouter = router({
  resource: resourceRouter,
})
```

## REST Endpoint

### Structure

```
app/api/<resource>/
└── route.ts
```

### Pattern

```ts
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const schema = z.object({
  name: z.string().min(1).max(255),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const result = schema.safeParse(body)

  if (!result.success) {
    return NextResponse.json({ error: result.error.message }, { status: 400 })
  }

  return NextResponse.json({ data: result.data })
}
```

## Rules

- All inputs validated with Zod — no exceptions
- Enforce auth before any DB access
- Never trust client input
- Return shape: `{ data: T }` on success, `{ error: string }` on failure
- All mutations must be idempotent and retry-safe
- No DB calls outside `/server/services` — API layer calls service layer only
- No raw SQL unless unavoidable and documented

## Anti-Patterns

- Missing Zod validation
- DB queries directly in route handlers
- Skipping auth checks
- Silent error catching (`catch(() => {})`)
- Returning different shapes for success vs. error
