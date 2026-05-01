# Task Router

Classifies incoming tasks before execution.

## Output Format

```
task_type:
skill:
tools_required:
retrieval_needed:
structured_output:
risk_level:
verification_required:
```

## Task Types

* code-generation
* code-review
* debugging
* data-operation
* api-design
* ui-component
* system-design
* conversational
* unknown

## Rules

* Always produce routing card BEFORE doing anything else
* If unclear → ask clarification instead of guessing
* High-risk tasks:
  * DB writes
  * auth logic
  * external APIs
* Retrieval needed if:

  * existing code is referenced
  * schema or architecture matters

## Risk Levels

* low → read-only, explanation
* medium → code changes
* high → data mutation, infra, auth

## When to stop

If required inputs are missing:
→ ask instead of proceeding