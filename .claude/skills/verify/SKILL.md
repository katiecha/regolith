---
description: Verifies claims and outputs for accuracy, distinguishing verified facts from inferences. Use after research, before implementation.
user-invocable: false
---

# Verification

## Types

### 1. Evidence Check

Label claims:

* verified — confirmed by reading source
* inference — logical conclusion from evidence
* unknown — cannot determine

### 2. Format Check

Ensure:

* required sections exist
* correct structure
* no missing parts

## When Required

* high-risk tasks
* long outputs
* system design
* data logic

## Rule

Never present assumptions as facts

## Failure Behavior

- If a claim cannot be verified → mark as "unknown", do not proceed as if true
- If evidence contradicts a claim → flag contradiction explicitly
- If verification requires external access → note as "unverifiable" with reason
- If >20% of claims are unknown → stop, request more context before continuing
