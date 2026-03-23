# Implementation Spec

- intent_id: intent-001
- title: Runtime Module Structure
- owner: shared
- status: draft
- created_at: 2026-03-20
- updated_at: 2026-03-23
- related_value_streams:
  - docs/intent-development/value-streams/vs-intent-001-simulation-session-to-reflection.md
- related_intent: docs/intent-development/intents/in-intent-001-simulation-core-loop.md
- related_feature_proposal: docs/intent-development/feature-proposals/fp-intent-001-platform-engineering-failure-simulation-core-loop.md
- related_ui_spec: docs/intent-development/ui-specs/ui-intent-001-simulation-session-flow.md
- related_runtime_specs:
  - docs/intent-development/implementation-specs/is-intent-001-mvp-multi-agent-runtime-design.md
  - docs/intent-development/implementation-specs/is-intent-001-remote-multi-agent-session-boundaries.md
  - docs/intent-development/implementation-specs/is-intent-001-conversation-naturalness-runtime-behavior.md
- related_development_memos:
  - docs/intent-development/development-memos/dm-20260324-production-runtime-reset-direction.md
- related_decisions:
  - docs/decisions/adr-20260321-local-first-runtime-and-multi-agent-scope.md
  - docs/decisions/adr-20260323-separate-runtime-verification-assets-from-product-runtime.md
- depends_on_enablers:
  - intent-000
  - intent-007

## Enabler Alignment
This implementation spec operationalizes the shared runtime foundation by defining how runtime responsibilities should be split into modules inside a local-first modular monolith.

It exists to keep traceability explicit between:
- canonical room state
- orchestration decisions
- agent prompt shaping
- transcript boundary handling
- evaluator evidence packaging
- local evaluator judgment
- runtime execution
- observability and validation

## Goal
Define a module structure that makes the live runtime understandable, debuggable, and evolvable without requiring distributed infrastructure.

## Problem Statement
Without an explicit module structure, live runtime implementation is likely to blur:
- where canonical state lives
- who decides the next turn
- where prompt shaping happens
- where transcript summarization happens
- where user-facing transcript filtering happens
- where evaluator evidence packets are assembled
- where evaluator judgment actually happens
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

## Current Operating Truth
After `adr-20260323-separate-runtime-verification-assets-from-product-runtime`, the repository should be interpreted as follows:
- modules under `runtime/execution/`, `runtime/orchestration/`, `runtime/state/`, `runtime/agents/`, `runtime/transcripts/`, `runtime/presentation/`, `runtime/evaluation/`, and `runtime/observability/` define product-runtime structure and contracts
- assets under `runtime/verification/` are verification-oriented runtime scaffolding and must not be treated as product-quality actor runtime behavior
- product-facing entrypoints should live under `scripts/production/`
- verification-oriented entrypoints should live under `scripts/verification/`
- shared script utilities should live under `scripts/shared/`
- runtime contract tests should live under `tests/runtime/`
- `simulate:local` and `simulate:local:interactive` should use the product-facing local live actor generation path
- verification-oriented commands such as `fixture:*` and `simulate:local:mock` may use deterministic verification renderers

## Recommended Runtime Structure
Recommended top-level layout:

```text
runtime/
  state/
  orchestration/
  agents/
  execution/
  transcripts/
  presentation/
  evaluation/
  observability/
  validation/
  verification/
scripts/
  production/
  verification/
  shared/
tests/
  runtime/
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
- define prompt adapters and output normalization for speaking runtime actors
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
- call the model client when needed
- apply orchestrator decisions
- commit state updates

Should contain:
- `run-turn`
- `run-session`
- `model-client`

Must not become:
- a second orchestration layer
- a hidden state schema layer

Execution preference:
- the default MVP live loop should remain local-first
- remote generation should be treated as an optional transport under `execution/`, not as the architectural center of the runtime

### `runtime/transcripts/`
Purpose:
- compact recent transcript into bounded context
- summarize active exchange for prompt input
- maintain readable trace artifacts for later evaluation
- prepare evaluator-facing evidence slices from canonical transcript/state history

Should contain:
- transcript compaction
- exchange summary helpers
- prompt-context extraction helpers
- evidence-packet builders

### `runtime/presentation/`
Purpose:
- enforce user-facing transcript boundary rules
- suppress orchestration or progress text from visible simulation output
- separate initialization, live session, closing, and reflection presentation layers

Should contain:
- transcript filtering
- visible event classification
- simulation-facing output shaping

Must not contain:
- orchestration decision logic
- canonical state ownership
- evaluator scoring logic

### `runtime/evaluation/`
Purpose:
- interpret evidence packets locally
- apply phase-aware scoring and structural judgment
- generate canonical reflection objects before any optional prose shaping

Should contain:
- evidence interpretation
- score calculation or score assignment helpers
- reflection object assembly

May optionally expose:
- a prose-shaping handoff input for a downstream writer layer

Must not contain:
- live turn orchestration
- in-world facilitator dialogue
- authority to rewrite evidence after judgment is fixed

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

### `runtime/verification/`
Purpose:
- hold deterministic verification-only actor rendering or adapter assets
- support fixture execution and smoke-style harnesses
- keep non-product-quality text generation out of product runtime modules

Should contain:
- mock adapters
- deterministic local verification renderers
- verification-only responders

Must not contain:
- canonical state ownership
- next-turn orchestration
- product-quality actor generation logic

## Dependency Rules
Recommended dependency direction:

```text
state -> no internal runtime dependency
orchestration -> state
agents -> state, transcripts
verification -> execution, state, agents
execution -> state, orchestration, agents, transcripts, presentation, observability
transcripts -> state
presentation -> state, transcripts
evaluation -> state, transcripts
observability -> state, orchestration, evaluation
validation -> state, orchestration, transcripts, presentation, evaluation, observability
```

Rules:
- `state` should be the lowest-level runtime module
- `orchestration` may read state but should not depend on agent prompt code
- `agents` may consume runtime slices but should not decide orchestration
- `presentation` may filter or classify visible output but should not mutate canonical state
- `evaluation` should consume evidence and state-derived artifacts, but should not depend on speaking-agent prompt logic
- `execution` may coordinate all runtime modules but should not redefine their contracts

## Traceability Contract
The implementation should let a developer trace any live turn through this chain:

1. `room_state` before the turn
2. orchestration decision
3. prompt input slice
4. agent output
5. state update
6. presentation filtering or evidence packaging
7. local evaluator judgment
8. validation or debug interpretation

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
runtime/execution/prepare-runtime-turn.ts
runtime/execution/runtime-responder.ts
runtime/execution/run-session.ts
runtime/transcripts/compaction.ts
runtime/transcripts/evidence-packet.ts
runtime/presentation/filter-visible-events.ts
runtime/evaluation/score-session.ts
runtime/evaluation/build-reflection.ts
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
