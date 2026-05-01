---
description: Creates a new React component following project conventions and structure
argument-hint: <component-name>
---

# Create Component

Build reusable UI components following project rules.

## Structure

```
component-name/
├── component-name.tsx
├── __tests__/
├── __hooks__/
├── __utils__/
├── __types__/
```

## Rules

* One component per file
* Named exports only
* No barrel files
* Props must be typed
* No business logic inside UI

## Patterns

### Component

```tsx
function ComponentName({ className, ...props }: Props) {
  return <div className={className} {...props} />;
}
```

### Hooks

* One hook per file
* Pure logic only

### Styling

* Use Tailwind
* No inline styles
* No hardcoded colors

## Anti-Patterns

* useEffect for fetching
* large components (>80 lines)
* shared components modified for one use case
