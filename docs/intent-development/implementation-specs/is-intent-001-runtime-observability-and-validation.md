# Implementation Spec

- intent_id: intent-001
- title: Runtime Observability and Validation
- owner: shared
- status: draft
- created_at: 2026-03-20
- updated_at: 2026-03-21
- related_value_streams:
  - docs/intent-development/value-streams/vs-intent-001-simulation-session-to-reflection.md
- related_intent: docs/intent-development/intents/in-intent-001-simulation-core-loop.md
- related_feature_proposal: docs/intent-development/feature-proposals/fp-intent-001-platform-engineering-failure-simulation-core-loop.md
- related_ui_spec: docs/intent-development/ui-specs/ui-intent-001-simulation-session-flow.md
- related_runtime_specs:
  - docs/intent-development/implementation-specs/is-intent-001-mvp-multi-agent-runtime-design.md
  - docs/intent-development/implementation-specs/is-intent-001-remote-multi-agent-session-boundaries.md
  - docs/intent-development/implementation-specs/is-intent-001-runtime-module-structure.md
- depends_on_enablers:
  - intent-000
  - intent-007

## Enabler Alignment
This implementation spec operationalizes the multi-agent runtime foundation by defining how runtime behavior should be logged, inspected, and validated.

Its purpose is to make the runtime explainable enough that a developer can answer:
- what happened
- what state it was based on
- why that turn was selected
- what changed afterward
- how the local evaluator reached its judgment

## Goal
Define the minimum observability and validation contract required to keep multi-agent runtime behavior traceable during MVP development.

This spec should also support validation of the remote session-boundary rules defined in:
- `docs/intent-development/implementation-specs/is-intent-001-remote-multi-agent-session-boundaries.md`

## Problem Statement
The main risk in multi-agent development is not only bad output.
It is loss of causal visibility.

Without explicit observability and validation rules, the team will struggle to determine:
- whether unnatural behavior came from state, orchestration, prompt shaping, or model output
- whether actor convergence is a prompt issue or a context-slice issue
- whether facilitator overuse is intentional or accidental
- whether the evaluator judgment came from evidence continuity or from weak prose-generation fallback

## Scope
- In scope:
  - turn-level event logging
- debug dump structure
- state diff logging
- visible transcript-boundary validation
- evaluator evidence-packet validation
- local evaluator judgment traceability
- transcript fixtures
- validation checks for naturalness and control quality
- Out of scope:
  - production analytics platform
  - user-facing dashboards
  - full telemetry infrastructure

## Observability Contract
### Required turn log
Each turn should emit a structured record with at least:
- `session_id`
- `turn_index`
- `scene_phase`
- `active_topic_before`
- `turn_owner`
- `selected_speaker`
- `selection_reason`
- `intervention_reason` when applicable
- `layer_trace`
- `prompt_input_summary`
- `agent_output_summary`
- `state_changes`
- `visible_output_classification`
- `evaluation_reference` when applicable
- `active_topic_after`

### `selection_reason`
This field is mandatory.

It should explain why the runtime chose the next speaker in terms of runtime logic, for example:
- `initiating-actor-follow-up`
- `overlap-reaction`
- `facilitator-turn-ownership-unclear`
- `facilitator-topic-parking`
- `closing-transition`

### `prompt_input_summary`
This should not log the entire prompt by default.

It should log:
- speaker identity
- turn role
- active topic label
- exchange state summary
- recent transcript turn count
- major response constraints

### `layer_trace`
This should make the architecture layer explicit so the word `multi-agent` is not ambiguous in logs.

Minimum shape:
- `operator_layer`
- `orchestration_layer`
- `speaker_layer`
- `response_layer`
- `evaluator_layer`

For the current MVP remote runtime, preferred values are:
- `operator_layer: local-codex-session`
- `orchestration_layer: local-room-orchestrator`
- `speaker_layer: runtime-actor` or `player`
- `response_layer: remote-response-chain`, `local-opening`, or `local-player-input`
- `evaluator_layer: local-first`

### `state_changes`
This should describe what changed, not dump the whole room state every turn.

Minimum shape:
- `changed_fields`
- `topic_transition`
- `participant_updates`
- `parking_lot_updates`
- `close_readiness_change`

### `visible_output_classification`
This field should record whether a turn artifact was:
- `simulation-visible`
- `debug-only`
- `suppressed-orchestration`
- `suppressed-progress`

This exists so remote transcript hygiene can be validated without losing internal traceability.

### `evaluation_reference`
When a turn becomes part of the evaluator evidence set, the runtime should be able to mark that relationship.

Minimum shape:
- `included_in_evidence_packet`
- `evidence_tags`
- `judgment_relevance`

## Debug Dump Contract
When deeper inspection is needed, the runtime should be able to emit a per-turn debug dump containing:
- `room_state_before`
- `decision_object`
- `prompt_input`
- `raw_agent_output`
- `normalized_agent_output`
- `visible_output`
- `suppressed_output`
- `evaluation_links`
- `room_state_after`

This dump is for development and fixture authoring, not default runtime output.

## Validation Contract
Validation should use both deterministic checks and fixture-based transcript review.

### Deterministic checks
Checks that can be programmatic:
- facilitator frequency per transcript window
- more than one active topic opened without parking
- repeated actor questioning without player answer
- agent outputs containing scoring or evaluator language
- missing `selection_reason` in turn logs
- visible transcript containing suppressed-orchestration or suppressed-progress events
- player-entry violations where stakeholder exchange advances before player articulation
- evaluator output containing artifact-creation offers without explicit user request
- reflection report claims unsupported by local evidence references

### Fixture-based checks
Checks that rely on representative transcripts:
- actor voice separation
- stakeholder reaction before over-structured analysis
- enough back-and-forth for stance movement
- natural facilitator routing without visible traffic control
- clean boundary between closing and evaluator reflection
- clean initialization block with no wrapper leakage

## Recommended Validation Assets
Recommended assets to keep under version control:
- sample `room_state` fixtures
- sample turn-decision fixtures
- sample evaluator input packets
- sample evaluator judgment traces
- short expected transcript fixtures
- known-bad transcript fixtures

Recommended known-bad categories:
- `facilitator-overuse`
- `topic-sprawl`
- `voice-collapse`
- `premature-governance-pressure`
- `scoring-language-leakage`
- `initialization-wrapper-leakage`
- `orchestration-text-visible`
- `closing-evaluator-boundary-collapse`

## Review Workflow
When a transcript feels wrong, inspect in this order:

1. `room_state_before`
2. `selection_reason`
3. `prompt_input_summary`
4. `agent_output_summary`
5. `state_changes`

This order helps determine whether the failure came from:
- bad state
- bad orchestration
- bad prompt slicing
- bad output normalization

## Recommended File Layout
Recommended observability and validation files:

```text
runtime/observability/event-log.ts
runtime/observability/debug-dump.ts
runtime/validation/transcript-checks.ts
runtime/validation/fixtures/
runtime/validation/fixtures/transcripts/
runtime/validation/fixtures/room-states/
```

## Change Contract
- Allowed Changes:
  - refine turn-log fields
  - add stricter validation checks as new failure patterns become visible
  - extend fixture coverage as the cast or runtime grows
- Forbidden Changes:
  - removing selection-reason logging from the runtime
  - relying only on subjective chat review with no durable fixtures
  - hiding full causal context inside prompt text with no structured trace
- Approval Required:
  - dropping per-turn state diff logging
  - replacing fixture-based review with purely manual review
  - making observability optional for MVP runtime development
- Validation:
  - a developer can reconstruct why a turn happened from logs and fixtures
  - validation catches at least facilitator overuse, topic sprawl, and scoring leakage
  - transcript debugging can distinguish state, orchestration, and prompt issues
- Rollback:
  - revert this spec together with runtime logging changes if the observability direction is rejected

## Execution Notes
- Files allowed to touch:
  - runtime/observability/*
  - runtime/validation/*
  - runtime/state/fixtures/*
  - docs/intent-development/implementation-specs/is-intent-001-runtime-module-structure.md
- Files explicitly out of scope:
  - user-facing analytics surfaces
  - unrelated evaluation product assets
- Risks:
  - excessive logging can create noise if summary fields are not curated
  - weak fixture design can create false confidence

## Implementation Outline
1. Define the turn log shape and decision-object shape.
2. Implement minimal structured logging for each turn.
3. Implement debug dump output for failing or explicitly inspected runs.
4. Add deterministic transcript checks.
5. Add known-good and known-bad fixtures for review.

## Verification
1. Every turn log includes `selection_reason`.
2. A failing transcript can be traced back to a specific decision and state slice.
3. At least one automated check catches facilitator overuse.
4. At least one fixture captures a known-bad traffic-control transcript shape.
