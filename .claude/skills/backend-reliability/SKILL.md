# Backend Reliability

## Rules

* All operations must be:

  * idempotent
  * retry-safe

## Multi-step flows

MUST NOT run inline.

Use:

* queues
* background workers

## Logging

* all mutations must be traceable

## Anti-Patterns

* long operations in request handlers
* no retry handling
* silent failures

