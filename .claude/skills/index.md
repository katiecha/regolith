# Skills Index

Skills are callable workflows that give Claude specialized behavior for specific task types.
Invoke user-invocable skills with `/skill-name`; others are triggered automatically.

## Scaffold `tags: [scaffold]`
| Skill | Invocable | Purpose |
|---|---|---|
| [create-component](create-component/SKILL.md) | yes | Reusable React component |
| [create-page](create-page/SKILL.md) | yes | Next.js App Router page with metadata and states |
| [create-api](create-api/SKILL.md) | yes | tRPC procedure or REST endpoint |
| [create-data-table](create-data-table/SKILL.md) | yes | Server-driven data table with filtering and pagination |

## Process `tags: [process]`
| Skill | Invocable | Purpose |
|---|---|---|
| [agent-workflow](agent-workflow/SKILL.md) | no | Enforces research → plan → implement → verify on all tasks |
| [task-router](task-router/SKILL.md) | no | Classifies incoming tasks and routes to the right skill |
| [decompose](decompose/SKILL.md) | no | Breaks complex tasks into independently testable steps |
| [gather-context](gather-context/SKILL.md) | no | Reads relevant files and rules before implementing |
| [planner](planner/SKILL.md) | yes | Produces goal, file list, ordered steps, and risks |
| [research](research/SKILL.md) | yes | Deep read-only codebase exploration, writes to research.md |

## Review `tags: [review]`
| Skill | Invocable | Purpose |
|---|---|---|
| [code-reviewer](code-reviewer/SKILL.md) | yes | Pre-PR bug and correctness check |
| [security-review](security-review/SKILL.md) | yes | Auth, input, DB query, and external API security audit |
| [evaluate](evaluate/SKILL.md) | no | Defines success criteria and failure modes |
| [verify](verify/SKILL.md) | no | Labels claims as verified / inference / unknown |

## Reliability `tags: [reliability]`
| Skill | Invocable | Purpose |
|---|---|---|
| [backend-reliability](backend-reliability/SKILL.md) | no | Idempotency, retry safety, logging, and queue rules |
| [manage-state](manage-state/SKILL.md) | no | Explicit state, no hidden shared state |
| [fallback-handler](fallback-handler/SKILL.md) | no | Handles execution failures with alternative approaches |
