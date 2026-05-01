# Agent Rules — Full Stack App (2026 Stack) v2

This document defines how agents MUST build, modify, and reason about this codebase.

The goal:

* Deterministic systems
* High signal, low abstraction
* Production-ready defaults
* No “vibe coding”
* Repeatable, debuggable agent behavior

---

# 0. Canonical Stack

* Framework: Next.js (App Router)
* Language: TypeScript (strict mode ON)
* Styling: Tailwind CSS
* Data Layer: Prisma + PostgreSQL
* API Layer: tRPC (internal) OR REST (external)
* Hosting: Vercel

---

# 1. Core Philosophy

## 1.1 No Magic

* No hidden behavior
* No implicit coupling
* No side-effect-driven logic

## 1.2 Co-location > Abstraction

* Code lives where it is used
* Do NOT prematurely generalize

## 1.3 One Responsibility Per Unit

* One component per file
* One hook per file
* One clear responsibility per function

## 1.4 Server-First

* Prefer server components
* Push logic to the server whenever possible

## 1.5 Prefer Simplicity

When unsure:

1. Choose the simplest working solution
2. Avoid new abstractions
3. Duplicate before abstracting (max ~2–3 times)

---

# 2. Agent Workflow (MANDATORY)

All agents MUST follow this loop:

## 2.1 Research

* Identify relevant files
* Understand existing patterns
* Do NOT modify code
* Stay objective (no premature solutions)

## 2.2 Plan

* Define goal
* List files to modify/create
* Outline step-by-step changes
* Identify risks and edge cases

## 2.3 Implement

* Execute strictly according to plan
* Do NOT introduce unrelated changes
* Keep changes minimal and localized

## 2.4 Verify

* Type correctness
* Edge cases handled
* Integration points validated
* No regressions introduced

---

# 3. Planning Output Format (REQUIRED)

When planning, agents MUST output:

1. Goal
2. Files to modify/create
3. Step-by-step plan
4. Data flow
5. Risks / edge cases

---

# 4. Project Structure

/app
/(routes)
/dashboard
page.tsx
layout.tsx
_components/
_hooks/
_utils/

/components (shared UI)

/lib
/db
/auth
/utils

/server
/routers
/services
/db

/prisma
schema.prisma

---

# 5. Naming Conventions

| Type       | Convention       |
| ---------- | ---------------- |
| Files      | kebab-case       |
| Components | PascalCase       |
| Functions  | camelCase        |
| Hooks      | useX             |
| Constants  | UPPER_SNAKE_CASE |

---

# 6. React Rules

## 6.1 Components

* Use function declarations
* No default exports
* Props must be typed

## 6.2 Server vs Client

Default: **Server Component**

Use `"use client"` ONLY when:

* state is required
* event handlers are used
* browser APIs are needed

## 6.3 Hooks

* One hook per file
* No business logic in components
* No data fetching in components

---

# 7. Styling (Tailwind)

## NEVER

* Inline styles
* Arbitrary values (`bg-[#fff]`)
* Random spacing

## ALWAYS

* Use design tokens
* Use `cn()` for merging

---

# 8. Component Architecture

component-name/
├── component-name.tsx
├── **tests**/
├── hooks/
├── utils/
├── types/

## Rules

* No barrel files by default
* Allowed ONLY at module boundaries
* One export per file
* File name = export name
* Components must be composable

---

# 9. State & Determinism

## Rules

* All state must be explicit
* No hidden shared state
* No implicit mutation across modules

## Function Behavior

Every function must be:

* deterministic OR
* explicitly side-effecting

## Side Effects Allowed ONLY In

* `/server/services`
* API handlers
* background jobs

---

# 10. Data Layer (Prisma)

## Rules

* No DB access in UI
* All DB logic lives in `/server/services`

## Patterns

* Avoid N+1 queries
* Prefer joins/includes
* No looped DB calls

---

# 11. API Layer

## tRPC (Internal)

* End-to-end type safety
* No manual typing

## REST (External)

Use when:

* exposing public endpoints
* integrating external services

Rules:

* Validate all input
* Always check `response.ok`

---

# 12. Data Fetching

## Server Components

* Direct async calls

## Client Components

* Use React Query
* NEVER `useEffect + fetch`

---

# 13. Forms

* Use Server Actions or tRPC mutations
* Validate with Zod
* Avoid uncontrolled forms for complex flows

---

# 14. Error Handling

* No silent failures
* No empty catch blocks
* Always return or throw typed errors

---

# 15. Performance

## Parallelism

Use `Promise.all` for independent operations

## Database

* No redundant queries
* Batch operations when possible

---

# 16. Backend Reliability (CRITICAL)

* All critical operations must be:

  * idempotent
  * retry-safe

* Multi-step operations MUST NOT:

  * run inline in request handlers

Instead:

* use queues or background workers

* All mutations must be:

  * traceable (logs or events)

---

# 17. Security

* Validate ALL inputs with Zod
* Enforce auth at API layer
* Never trust client input
* No raw SQL unless necessary

---

# 18. Logging

* Structured logging only
* No console.log in production paths

---

# 19. Testing

* Unit tests for utilities
* Integration tests for APIs
* No untested business logic

---

# 20. Evaluation & Quality

All non-trivial features MUST define:

* success criteria
* edge cases
* failure modes

Agent-generated code MUST:

* include validation logic
* be testable

Optional:

* add eval cases in `/evals`

---

# 21. Background Jobs

Next.js is NOT a full backend.

For:

* queues
* cron jobs
* long-running tasks

You MUST introduce:

* worker system
* or separate backend

---

# 22. ORM Constraints

Use alternatives when:

* complex joins
* analytics queries
* performance-critical paths

---

# 23. Decomposition Rules

Agents MUST:

* break large tasks into smaller steps
* avoid solving multiple concerns at once
* prefer multiple small functions

If a function exceeds ~80 lines → split it

---

# 24. API Strategy

* tRPC = internal only
* REST = external boundary

DO NOT expose tRPC publicly

---

# 25. Anti-Patterns (Hard Bans)

❌ Default exports
❌ Barrel files (except module boundaries)
❌ `useEffect` for fetching
❌ DB calls in components
❌ Inline styles
❌ Over-abstracted hooks
❌ Global mutable state

---

# 26. Definition of Done

* Fully type-safe
* No lint errors
* No unused code
* Tested where appropriate
* Follows ALL rules above

---

# 27. Agent Decision Rules

When building features, agents MUST:

1. Start simple
2. Avoid abstraction unless reused 2–3 times
3. Prefer server over client
4. Prefer co-location
5. Prefer explicit over clever

If ambiguity affects architecture → ASK

---

# 28. Guiding Principle

Build like this will scale —
but don’t optimize like it already has.
