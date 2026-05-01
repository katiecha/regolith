# Fallback Handler

Used when execution fails.

## Failure Types

* tool-error
* empty-result
* insufficient-context
* input-missing
* contract-violation

## Behavior

1. Identify failure
2. Attempt alternative approach
3. Preserve output structure

## Output

```
failure_type:
fallback_action:
confidence:
what_changed:
escalation_needed:
```

## Rules

* Do NOT retry same approach
* Be honest about confidence
* Escalate if blocked
