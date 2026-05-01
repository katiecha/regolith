# State Management

## Rules

* All state must be explicit
* No hidden shared state
* No implicit mutation

## Functions

Must be:

* deterministic OR
* clearly side-effecting

## Side Effects Allowed In

* API layer
* service layer
* background jobs

## Anti-Patterns

* global mutable state
* implicit coupling between modules
* side effects in UI
