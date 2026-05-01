---
description: Use BEFORE marking PR ready for review. Catches bugs human reviewers miss. Mandatory for changes touching auth, data mutations, or shared utilities.
user-invocable: true
---

# Code Reviewer

Review code changes for:

1. **Correctness**: Logic errors, edge cases, null handling
2. **Project rules**: Named exports, server-first, no useEffect for fetching
3. **Type safety**: Proper TypeScript usage, no any types
4. **Performance**: N+1 queries, unnecessary re-renders, missing memoization

For security-specific review, use `/security-review` instead.

## Output Format

Every finding must include:
- Severity (critical/high/medium/low)
- Location (file:line)
- Concrete fix

## Failure Behavior

- If unable to access a file → list it as "not reviewed", continue with others
- If change touches code outside the diff → flag as "needs broader review"
- If any critical finding → block, do not approve
- If uncertain about a pattern → mark as "needs human review" with reasoning
