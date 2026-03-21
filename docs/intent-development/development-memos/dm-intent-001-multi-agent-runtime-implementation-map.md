# Development Memo

- intent_id: intent-001
- title: Multi-Agent Runtime Implementation Map
- owner: shared
- status: active
- created_at: 2026-03-20
- updated_at: 2026-03-21
- related_enablers:
  - intent-000
  - intent-007
- related_decisions:
  - docs/decisions/adr-20260321-local-first-runtime-and-multi-agent-scope.md
- related_feature_proposal: docs/intent-development/feature-proposals/fp-intent-001-platform-engineering-failure-simulation-core-loop.md
- related_implementation_specs:
  - docs/intent-development/implementation-specs/is-intent-001-mvp-multi-agent-runtime-design.md
  - docs/intent-development/implementation-specs/is-intent-001-runtime-module-structure.md
  - docs/intent-development/implementation-specs/is-intent-001-runtime-observability-and-validation.md
- related_development_memos:
  - docs/intent-development/development-memos/dm-intent-001-runtime-asset-boundary.md
- related_templates:
  - docs/templates/playtest/runtime-playtest-note-template.md

## Purpose
Give a high-level implementation map for the exploration-phase runtime work.

This memo is for orientation.
It is not the durable contract layer.
It is retained as a historical implementation map and should be read alongside the accepted local-first ADR.

Use it to answer:
- what the runtime is trying to implement
- which code modules correspond to which specs
- what already exists
- what is still missing

## Current Runtime Direction
Exploration-phase direction at the time this memo was written:
- modular monolith
- one canonical `room_state`
- one hidden orchestrator
- separate speaking agents for facilitator and stakeholders
- evaluator kept outside live turn generation
- local-first execution as the default live-runtime posture
- optional remote-backed actor generation only when explicitly enabled

This is intentionally not:
- distributed services
- free agent-to-agent autonomy
- per-agent independent memory ownership
- remote execution as the architectural center of the runtime

Current decision boundary:
- the live runtime is local-first by default
- remote response chains are optional transport details
- this memo describes the earlier exploration path, not the current architectural center

## Why Runtime Used API Calls During Exploration
This repository's runtime was explored as an application runtime, not as one long ChatGPT conversation.

The development chat was the design and implementation workspace.
The live simulation runtime was separate.

That means:
- this chat is where the system is built
- the runtime later creates bounded prompts for each role
- those role prompts were explored through a model API one turn at a time

The runtime did not need to resend the entire development chat.
It sent only the bounded prompt for the current role and current turn.

Historical note:
- the API-centric framing below reflects an exploration-phase implementation path
- it is not a statement that remote execution is the preferred architectural center after the local-first ADR

## High-Level Turn Sequence
For one live runtime turn, the intended sequence is:

1. read current `room_state`
2. decide next speaker with `selectNextTurn`
3. build the role-specific prompt input
4. render prompt text for that role
5. send the prompt to a model adapter
6. receive text output
7. normalize the output into `TurnOutcome`
8. update `room_state`
9. log the decision and state change

In the current implementation, steps `5-6` can be provided by:
- scripted fixture data
- mock adapter output
- a real model provider adapter

## Role-by-Role API Shape
The multi-agent runtime does not call one model once for the whole room.
It typically calls the model once per speaking turn.

Examples:
- stakeholder turn -> one actor prompt -> one API call
- facilitator intervention -> one facilitator prompt -> one API call
- post-game evaluation -> one evaluator prompt -> one API call

This is why API usage is the natural execution model for multi-agent runtime.
This was one possible execution model for the exploration phase.
The system needed role-separated calls, not one monolithic conversation stream.

## Cost Hotspots
For demo and event use, the main cost drivers are:
- number of turns per session
- prompt length per turn
- number of role-separated calls
- whether evaluator also runs every session

In practice, cost grows with:
- more actor turns
- longer transcript context windows
- richer prompt text
- separate post-game evaluation call

## Demo-Oriented Cost Implication
For event or booth usage, a lower-cost runtime mode may be needed.

Likely levers:
- fewer turns
- smaller transcript windows
- shorter prompt text
- optional evaluator call only at the end
- mock or reduced-cost mode for rehearsals and internal testing

This is another reason the current architecture keeps:
- transcript compaction
- prompt slicing
- adapter boundaries

Those make it possible to tune cost without redesigning the whole runtime.

## Why This Direction
The repository wants multi-agent benefits:
- better voice separation
- more believable back-and-forth
- less "one mind playing every role"

But it wants to avoid the main multi-agent failure modes:
- topic sprawl
- facilitator over-control
- contradictory room memory
- evaluator-like live dialogue

So the current design uses central state and orchestration, with agent separation only where it improves runtime behavior.
Later architectural review narrowed the live runtime to a local-first stance and moved stronger multi-agent usage toward adjacent subsystems such as scenario generation and failure pattern matching.

## Spec to Code Map
### `intent-007` Multi-Agent Simulation Runtime Foundation
What it defines:
- shared runtime foundation
- agent roles
- room-state expectations
- knowledge partition

Current code areas:
- `runtime/state/*`
- `runtime/orchestration/*`

### `is-intent-001-mvp-multi-agent-runtime-design`
What it defines:
- how the foundation is applied to the one-scene MVP workshop
- facilitator and stakeholder runtime shape
- allowed turn patterns

Current code areas:
- `runtime/execution/*`
- `runtime/agents/*`
- `runtime/state/fixtures/*`

### `is-intent-001-runtime-module-structure`
What it defines:
- modular-monolith structure
- responsibility boundaries
- dependency direction

Current code areas:
- whole `runtime/` directory layout

### `is-intent-001-runtime-observability-and-validation`
What it defines:
- turn logs
- debug dumps
- validation fixtures
- known-bad runtime checks

Current code areas:
- `runtime/observability/*`
- `runtime/validation/*`

## Current Code Overview
### `runtime/state/`
Purpose:
- canonical runtime types
- initial room-state creation
- state reducers
- participant state updates

Current files:
- `types.ts`
- `schema.ts`
- `reducers.ts`
- `participant-updates.ts`
- `fixtures/mvp-room-state.json`

### `runtime/orchestration/`
Purpose:
- decide who speaks next
- manage topic parking and active-topic updates

Current files:
- `select-next-turn.ts`
- `topic-management.ts`

### `runtime/agents/`
Purpose:
- build bounded prompt inputs for actor, facilitator, and evaluator roles

Current files:
- `actor/prompt.ts`
- `facilitator/prompt.ts`
- `evaluator/prompt.ts`

### `runtime/execution/`
Purpose:
- prepare the next turn
- run a session step
- run a short scripted session

Current files:
- `prepare-runtime-turn.ts`
- `runtime-responder.ts`
- `run-session.ts`

### `runtime/transcripts/`
Purpose:
- compact recent transcript into bounded context for prompts

Current files:
- `compaction.ts`

### `runtime/observability/`
Purpose:
- emit turn logs
- emit debug dumps

Current files:
- `event-log.ts`
- `debug-dump.ts`

### `runtime/validation/`
Purpose:
- check for bad runtime patterns
- hold transcript fixtures
- run scripted fixture sequences

Current files:
- `transcript-checks.ts`
- `fixture-runner.ts`
- `fixtures/scripted-session.ts`
- `fixtures/transcripts/facilitator-overuse.json`

## What Exists Now
The codebase now has:
- a canonical `room_state` type
- a first initial room-state factory
- a first next-turn selector
- bounded prompt-input builders
- a turn outcome reducer
- a session-step loop
- structured turn logging
- debug dump support
- basic validation helpers
- scripted fixture execution

This means the repository now has a runtime kernel skeleton, not only design documents.

## What Is Still Missing
Important missing pieces:
- real model provider integration
- stronger runtime-asset normalization beyond persona runtime slices
- evaluator implementation
- richer state transition logic for `exchange_state` and `structural_state`
- broader automated test coverage
- scenario-specific prompt content beyond structural input shape

## How To Read The Current Runtime
If you want the simplest reading order:

1. `runtime/state/types.ts`
2. `runtime/state/schema.ts`
3. `runtime/orchestration/select-next-turn.ts`
4. `runtime/execution/prepare-runtime-turn.ts`
5. `runtime/execution/run-session.ts`
6. `runtime/observability/event-log.ts`
7. `runtime/validation/fixture-runner.ts`

This order shows:
- what state exists
- how a turn is chosen
- how a turn is prepared
- how a turn is applied
- how the result is logged

## Current Risks
The current implementation is still early.

Main risks:
- orchestration is still heuristic and minimal
- participant state updates are simplistic
- prompt builders are structural only, not persona-rich yet
- no real runtime harness exists to inspect logs end-to-end automatically
- room-state updates still depend heavily on scripted outcomes

## Next Recommended Build Order
Recommended next steps:

1. add a thin runnable harness for scripted fixtures
2. strengthen reducer logic so more state updates happen inside code rather than scripted outcomes
3. load persona slices from durable product assets
4. add a real model adapter behind the responder interface
5. add transcript-based tests for known-bad patterns

## Practical Reading Advice
If the runtime starts to feel complex, keep one mental model:

- `state` answers: what is true right now
- `orchestration` answers: who should speak next and why
- `agents` answer: how a role should speak from a bounded slice
- `execution` answers: how a turn actually runs
- `observability` answers: what happened this turn
- `validation` answers: is the runtime drifting into bad behavior

That model is enough to navigate the current code without reading everything at once.
