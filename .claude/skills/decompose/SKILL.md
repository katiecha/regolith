---
description: Breaks down complex tasks into smaller, manageable steps. Use when task spans >3 files or has multiple concerns.
user-invocable: false
---

# Decomposition

## When to Decompose

- Task spans more than 3 files
- Multiple unrelated concerns in one change
- Function exceeds 80 lines
- Component has too many responsibilities
- PR would be hard to review as a single unit

## Rules

- One concern per step
- Each step should be independently testable
- Dependencies between steps must be explicit
- Prefer additive steps before modification steps

## Limits

- Function >80 lines → split
- Component >200 lines → split
- PR >400 lines → split into stack

## Output

```
## Decomposition: [task]

### Step 1: [name]
- Files: [list]
- Concern: [what this step accomplishes]
- Dependencies: [what must exist first]

### Step 2: [name]
...
```

## Goal

- Clarity: each step is understandable alone
- Testability: each step can be verified
- Composability: steps can be reordered if independent

## Failure Behavior

- If steps have circular dependencies → restructure until DAG
- If a step cannot be isolated → note coupling, consider refactor first
- If decomposition exceeds 10 steps → group into phases
- If unclear how to split → flag as "needs design discussion"
