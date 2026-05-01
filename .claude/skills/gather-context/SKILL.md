---
description: Gathers context before implementing a task by identifying relevant files, rules, and edge cases
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
