# Implementation Spec

- intent_id: intent-001
- title: Runtime Module Structure
- owner: shared
- status: draft
- created_at: 2026-03-20
- updated_at: 2026-03-20
- related_feature_proposal: docs/intent-development/feature-proposals/fp-intent-001-platform-engineering-failure-simulation-core-loop.md
- related_ui_spec: docs/intent-development/ui-specs/ui-intent-001-simulation-session-flow.md
- related_runtime_specs:
  - docs/intent-development/implementation-specs/is-intent-001-mvp-multi-agent-runtime-design.md
  - docs/intent-development/implementation-specs/is-intent-001-conversation-naturalness-runtime-behavior.md
- depends_on_enablers:
  - intent-000
  - intent-007

## Enabler Alignment
This implementation spec operationalizes the shared multi-agent runtime foundation by defining how runtime responsibilities should be split into modules inside a modular monolith.

It exists to keep traceability explicit between:
- canonical room state
- orchestration decisions
- agent prompt shaping
- runtime execution
- observability and validation

## Goal
Define a module structure that makes multi-agent runtime behavior understandable, debuggable, and evolvable without requiring distributed infrastructure.

## Problem Statement
Without an explicit module structure, multi-agent implementation is likely to blur:
- where canonical state lives
- who decides the next turn
- where prompt shaping happens
- where transcript summarization happens
- how logs and validation relate to runtime behavior

That would make it difficult to answer:
- what logic caused a turn to happen
- what state the turn was based on
- which component is responsible when behavior becomes unnatural

## Scope
- In scope:
  - module boundaries for the MVP runtime
  - shared runtime kernel responsibilities
  - recommended directory structure
  - allowed dependencies between modules
- Out of scope:
  - final framework choice
  - infra-level deployment topology
  - non-MVP scenario variations

## Recommended Runtime Structure
Recommended top-level layout:

```text
runtime/
  state/
  orchestration/
  agents/
  execution/
  transcripts/
  observability/
  validation/
```

## Module Responsibilities
### `runtime/state/`
Purpose:
- define canonical runtime types and schemas
- own `room_state` structure
- own state reducers or update helpers
- store state fixtures

Should contain:
- `types`
- `schema`
- `reducers`
- `fixtures`

Must not contain:
- prompt construction
- model invocation
- speaker selection heuristics outside explicit state transitions

### `runtime/orchestration/`
Purpose:
- select the next turn owner
- manage active topic and parking behavior
- determine facilitator intervention need
- determine close readiness

Should contain:
- `select-next-turn`
- `topic-management`
- `close-readiness`
- decision helpers

Must not contain:
- direct model calls
- persona prose
- canonical state persistence logic

### `runtime/agents/`
Purpose:
- define prompt adapters and output normalization for speaking agents
- isolate actor, facilitator, and evaluator prompt contracts

Recommended substructure:

```text
runtime/agents/
  actor/
  facilitator/
  evaluator/
```

Each submodule should contain:
- prompt builder
- response adapter
- output parser or normalizer

Must not contain:
- next-speaker selection
- global state mutation authority

### `runtime/execution/`
Purpose:
- run the turn lifecycle
- call the model client
- apply orchestrator decisions
- commit state updates

Should contain:
- `run-turn`
- `run-session`
- `model-client`

Must not become:
- a second orchestration layer
- a hidden state schema layer

### `runtime/transcripts/`
Purpose:
- compact recent transcript into bounded context
- summarize active exchange for prompt input
- maintain readable trace artifacts for later evaluation

Should contain:
- transcript compaction
- exchange summary helpers
- prompt-context extraction helpers

### `runtime/observability/`
Purpose:
- emit structured event logs
- emit debug dumps for turn decisions
- make cause-and-effect visible during development

Should contain:
- decision logging
- state diff logging
- prompt input summaries
- debug renderers

### `runtime/validation/`
Purpose:
- hold transcript fixtures
- hold behavioral checks for naturalness and control quality
- prevent regressions in facilitator overuse, topic sprawl, or actor convergence

Should contain:
- transcript fixtures
- turn-decision fixtures
- validation checks

## Dependency Rules
Recommended dependency direction:

```text
state -> no internal runtime dependency
orchestration -> state
agents -> state, transcripts
execution -> state, orchestration, agents, transcripts, observability
transcripts -> state
observability -> state, orchestration
validation -> state, orchestration, transcripts, observability
```

Rules:
- `state` should be the lowest-level runtime module
- `orchestration` may read state but should not depend on agent prompt code
- `agents` may consume runtime slices but should not decide orchestration
- `execution` may coordinate all runtime modules but should not redefine their contracts

## Traceability Contract
The implementation should let a developer trace any live turn through this chain:

1. `room_state` before the turn
2. orchestration decision
3. prompt input slice
4. agent output
5. state update
6. validation or debug interpretation

This traceability chain is the primary reason to keep modules separate.

## Recommended Initial Files
Recommended first implementation files:

```text
runtime/state/types.ts
runtime/state/schema.ts
runtime/state/fixtures/mvp-room-state.json
runtime/orchestration/select-next-turn.ts
runtime/orchestration/topic-management.ts
runtime/agents/actor/prompt.ts
runtime/agents/facilitator/prompt.ts
runtime/agents/evaluator/prompt.ts
runtime/execution/run-turn.ts
runtime/transcripts/compaction.ts
runtime/observability/event-log.ts
runtime/validation/transcript-checks.ts
```

## Change Contract
- Allowed Changes:
  - refine module boundaries for clarity or maintainability
  - introduce helper modules that preserve the same traceability chain
  - adjust directory names if responsibility boundaries remain explicit
- Forbidden Changes:
  - moving canonical state ownership into agent modules
  - letting orchestration depend on prompt text internals
  - collapsing observability into ad hoc console output with no durable structure
- Approval Required:
  - replacing the modular-monolith direction with distributed services
  - giving speaking agents direct authority to mutate canonical state
  - merging orchestration and evaluator logic into one module
- Validation:
  - runtime responsibilities are visible from the directory structure
  - a developer can identify where a turn was decided, prompted, and logged
  - module dependencies preserve clear ownership boundaries
- Rollback:
  - revert this spec together with dependent runtime structure changes if the modular-monolith direction is rejected

## Execution Notes
- Files allowed to touch:
  - runtime/*
  - docs/intent-development/implementation-specs/is-intent-001-mvp-multi-agent-runtime-design.md
  - docs/intent-development/feature-proposals/fp-intent-001-platform-engineering-failure-simulation-core-loop.md
- Files explicitly out of scope:
  - failure-model/*
  - unrelated product contracts
- Risks:
  - over-designing module layers before enough runtime code exists
  - allowing convenience imports that erode boundaries over time

## Implementation Outline
1. Create the `runtime/` root and state module.
2. Implement orchestration against the canonical room-state schema.
3. Add agent prompt adapters as isolated modules.
4. Add execution loop and structured observability.
5. Add validation fixtures before broadening cast complexity.

## Verification
1. A developer can point to one file that defines state shape and one file that decides the next turn.
2. Prompt-building code is isolated from turn-selection code.
3. Event logs can reference state fields and decision reasons without parsing prompt prose.
4. The structure remains workable inside one process without pretending to be distributed infrastructure.
