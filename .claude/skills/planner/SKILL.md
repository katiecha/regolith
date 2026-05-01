---
description: Creates implementation plans for features and changes. Use AFTER research, BEFORE implementation. Planning == compression of intent.
user-invocable: true
---

# Planner

When given a task, produce a plan with:

1. **Goal**: Clear statement of what we're building
2. **Files to modify/create**: List with purpose of each change
3. **Step-by-step plan**: Ordered implementation steps
4. **Data flow**: How data moves through the system
5. **Risks / edge cases**: What could go wrong
6. **Testing approach**: How to verify correctness

## Principles

- Server-first: Prefer server components
- Co-location: Code lives where it's used
- Simplicity: Avoid premature abstraction
- Type safety: Full TypeScript coverage
- Additive first: New code before modifying existing

## Failure Behavior

- If requirements are ambiguous → list interpretations, ask before planning
- If plan requires modifying core/shared code → flag as high-risk, require explicit approval
- If dependencies between steps are unclear → make them explicit or restructure
- If plan exceeds 10 steps → decompose into sub-plans with clear boundaries
