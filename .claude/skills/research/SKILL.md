---
description: Deep codebase research before implementation. Writes compressed findings to research.md. Use for brownfield changes, unfamiliar areas, or complex features.
user-invocable: true
---

# Research

Research is compression. Find everything relevant, return only what's needed.

## When to Use

- Before any non-trivial implementation
- When touching unfamiliar code
- When the change spans multiple files/modules
- When existing patterns are unclear

## Process

1. **Identify the real task** — What are we actually trying to accomplish?

2. **Find relevant code**:
   - Entry points (routes, handlers, components)
   - Data flow (how data moves through the system)
   - Related patterns (how similar things are done)
   - Tests (existing coverage, test patterns)

3. **Understand constraints**:
   - Project rules that apply
   - Existing abstractions to use
   - Anti-patterns to avoid

4. **Document edge cases**:
   - Error states
   - Empty states
   - Concurrent access
   - Permission boundaries

## Output

Write findings to `research.md` in the current working directory:

```markdown
# Research: [task name]

## Goal
[One sentence describing what we're trying to accomplish]

## Relevant Files
- `path/to/file.ts:123` — [why it matters]
- `path/to/other.ts:45-67` — [why it matters]

## Existing Patterns
[How similar things are done in this codebase]

## Constraints
- [Rules that apply]
- [Abstractions to use]
- [Things to avoid]

## Edge Cases
- [Edge case 1]
- [Edge case 2]

## Recommended Approach
[Brief recommendation based on findings]

## Open Questions
- [Anything that needs clarification]
```

## Rules

- Research is READ-ONLY — do not modify code
- Compress findings — return essence, not everything
- Be objective — do not hunt for bugs during research
- Note uncertainty — mark assumptions as such

## Failure Behavior

- If code cannot be found → note as gap, check for renames
- If pattern is inconsistent across codebase → document both approaches
- If critical context is missing → list blockers in "Open Questions"
- If research exceeds 15 files → summarize by module, link to details
