---
description: Creates a new Next.js App Router page with metadata, loading/error states, and proper layout structure
argument-hint: <route-path>
user-invocable: true
tags: [scaffold]
---

# Create Page

Scaffold a new Next.js App Router page following project conventions.

## Structure

```
app/<route>/
├── page.tsx          # Server Component, required default export (Next.js exception)
├── loading.tsx       # Suspense fallback
├── error.tsx         # Error boundary (requires "use client")
└── layout.tsx        # Only if this route needs its own layout
```

## Rules

- Server Component by default — no `"use client"` unless the page itself needs browser APIs
- Every page exports `metadata` or `generateMetadata`
- Semantic HTML: `<main>`, `<section>`, `<h1>` hierarchy
- Mobile-first layout — `md` breakpoint only
- Next.js requires default exports on `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx` — this is the only exception to the named exports rule

## Patterns

### Page

```tsx
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Page Title",
  description: "Page description.",
}

export default function PageName() {
  return (
    <main>
      <section>
        <h1>Heading</h1>
      </section>
    </main>
  )
}
```

### Dynamic Metadata

```tsx
import type { Metadata } from "next"

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  return { title: `Item ${id}` }
}
```

### Loading State

```tsx
export default function Loading() {
  return <div aria-busy="true">Loading...</div>
}
```

### Error State

```tsx
"use client"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </main>
  )
}
```

## Anti-Patterns

- Business logic inside page components — push to server actions or services
- Missing `metadata` export
- `"use client"` at the page level without browser API need
- Skipping `loading.tsx` for pages with async data
