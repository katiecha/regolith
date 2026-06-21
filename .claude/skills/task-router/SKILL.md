---
description: Classifies incoming tasks and routes them to the appropriate skill before execution
user-invocable: false
tags: [process]
---

# Task Router

Classifies incoming tasks before execution and routes to the appropriate skill.

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

## Task Types → Skills

| Task Type | Primary Skill | Supporting Skills |
|---|---|---|
| `ui-component` | `create-component` | `gather-context`, `verify` |
| `ui-page` | `create-page` | `gather-context`, `verify` |
| `api-design` | `create-api` | `security-review`, `verify` |
| `data-table` | `create-data-table` | `gather-context` |
| `code-review` | `code-reviewer` | `security-review` |
| `security` | `security-review` | `verify` |
| `debugging` | `research` | `gather-context`, `verify` |
| `system-design` | `planner` | `decompose`, `research` |
| `complex-task` | `decompose` | `planner`, `agent-workflow` |
| `state` | `manage-state` | `verify` |
| `backend` | `backend-reliability` | `security-review`, `verify` |
| `conversational` | — | — |
| `unknown` | `gather-context` | `decompose` |

## Available Skills

- `agent-workflow` — enforces the research → plan → implement → verify loop
- `backend-reliability` — rules for idempotency, retries, logging, queues
- `code-reviewer` — pre-PR bug and correctness review
- `create-api` — tRPC procedure or REST endpoint scaffold
- `create-component` — reusable React component scaffold
- `create-data-table` — server-driven data table scaffold
- `create-page` — Next.js App Router page scaffold with metadata and states
- `decompose` — breaks complex tasks into independently testable steps
- `evaluate` — defines success criteria, edge cases, and failure modes
- `fallback-handler` — handles execution failures with alternative approaches
- `gather-context` — reads relevant files and rules before implementation
- `manage-state` — explicit state patterns, no hidden shared state
- `planner` — produces goal, file list, ordered steps, risks, and test approach
- `research` — deep read-only codebase exploration, writes to research.md
- `security-review` — auth, input, DB query, and external API security audit
- `task-router` — this skill; classifies and routes tasks
- `verify` — labels claims as verified / inference / unknown before proceeding

## Rules

- Always produce routing card BEFORE doing anything else
- If unclear → ask clarification instead of guessing
- High-risk tasks require `verification_required: true`:
  - DB writes
  - Auth logic
  - External APIs
  - Shared/core code changes
- Set `retrieval_needed: true` if existing code, schema, or architecture is referenced

## Risk Levels

- `low` — read-only, explanation, conversational
- `medium` — code changes scoped to one file or component
- `high` — data mutation, auth, infra, changes to shared patterns

## When to Stop

If required inputs are missing → ask instead of proceeding.
