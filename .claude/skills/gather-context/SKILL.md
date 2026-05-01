---
description: Gathers context before implementing a task by identifying relevant files, rules, and edge cases. Use for any non-trivial change.
user-invocable: false
---

# Context Gathering

Used when retrieval is needed before implementation.

## Steps

1. Identify real task

2. Build retrieval plan:

   * rules
   * prerequisites
   * code paths
   * edge cases

3. Retrieve minimal info

4. Identify gaps

## Output

```
retrieval_plan:
retrieved_context:
gaps:
ready_to_proceed:
```

## Rule

Do not proceed with missing critical context

## Failure Behavior

- If a file cannot be found → note as gap, check for renames/moves
- If pattern is ambiguous → list multiple interpretations, ask for clarification
- If prerequisites are missing → stop and list what's needed
- If gaps remain after retrieval → explicitly state "NOT READY" with blockers
