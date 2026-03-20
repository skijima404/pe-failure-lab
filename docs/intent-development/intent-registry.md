# Intent Registry

Last updated: 2026-03-21

| value_stream_id | value_stream | intent_id | intent | proposal_type | title | stage | enabler_proposal | feature_proposal | related_enablers | ui_spec | implementation_spec | status | updated_at |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
|  |  | intent-000 |  | enabler | Platform Engineering Failure Model | proposal | docs/intent-development/enabler-proposals/ep-intent-000-platform-engineering-failure-model.md |  |  |  |  | draft | 2026-03-17 |
| vs-intent-001 | docs/intent-development/value-streams/vs-intent-001-simulation-session-to-reflection.md | intent-001 | docs/intent-development/intents/in-intent-001-simulation-core-loop.md | feature | Platform Engineering Failure Simulation Core Loop | implementation |  | docs/intent-development/feature-proposals/fp-intent-001-platform-engineering-failure-simulation-core-loop.md | intent-000, intent-007 | docs/intent-development/ui-specs/ui-intent-001-simulation-session-flow.md | docs/intent-development/implementation-specs/is-intent-001-conversation-naturalness-runtime-behavior.md; docs/intent-development/implementation-specs/is-intent-001-mvp-multi-agent-runtime-design.md; docs/intent-development/implementation-specs/is-intent-001-runtime-module-structure.md; docs/intent-development/implementation-specs/is-intent-001-runtime-observability-and-validation.md | draft | 2026-03-21 |
| vs-intent-001 | docs/intent-development/value-streams/vs-intent-001-simulation-session-to-reflection.md | intent-002 | docs/intent-development/intents/in-intent-002-precise-failure-pattern-scenarios.md | feature | Precise Failure Pattern Scenario Design | proposal |  | docs/intent-development/feature-proposals/fp-intent-002-precise-failure-pattern-scenario-design.md | intent-000 |  |  | draft | 2026-03-21 |
| vs-intent-001 | docs/intent-development/value-streams/vs-intent-001-simulation-session-to-reflection.md | intent-003 | docs/intent-development/intents/in-intent-003-end-of-game-assessment-and-discussion.md | feature | End-of-Game Assessment, Feedback, and Discussion | proposal |  | docs/intent-development/feature-proposals/fp-intent-003-end-of-game-assessment-feedback-and-discussion.md | intent-000 |  |  | draft | 2026-03-21 |
| vs-intent-001 | docs/intent-development/value-streams/vs-intent-001-simulation-session-to-reflection.md | intent-004 | docs/intent-development/intents/in-intent-004-demo-grade-live-simulation-surface.md | feature | Demo-Grade Live Simulation Surface | proposal |  | docs/intent-development/feature-proposals/fp-intent-004-demo-grade-live-simulation-surface.md | intent-000 |  |  | draft | 2026-03-21 |
|  |  | intent-005 |  | enabler | Failure Model Authoring Guidance | proposal | docs/intent-development/enabler-proposals/ep-intent-005-failure-model-authoring-guidance.md |  |  |  |  | draft | 2026-03-17 |
| vs-intent-006 | docs/intent-development/value-streams/vs-intent-006-rough-note-to-linked-failure-model-assets.md | intent-006 | docs/intent-development/intents/in-intent-006-failure-model-authoring-workflow.md | feature | GenAI-Assisted Failure Model Authoring Workflow | proposal |  | docs/intent-development/feature-proposals/fp-intent-006-genai-assisted-failure-model-authoring-workflow.md | intent-000, intent-005 |  |  | draft | 2026-03-21 |
|  |  | intent-007 |  | enabler | Multi-Agent Simulation Runtime Foundation | proposal | docs/intent-development/enabler-proposals/ep-intent-007-multi-agent-simulation-runtime-foundation.md |  |  |  |  | draft | 2026-03-20 |
|  |  | intent-008 |  | enabler | Runtime Regression Validation Workflow | proposal | docs/intent-development/enabler-proposals/ep-intent-008-runtime-regression-validation-workflow.md |  |  |  |  | draft | 2026-03-20 |

## Stage Definitions
- `proposal`: enabler or feature proposal drafting or review stage
- `ui-spec`: UI spec drafting or review stage
- `implementation`: under active development
- `done`: implemented and validated

## Proposal Type Definitions
- `enabler`: foundational product asset that multiple features or implementations depend on
- `feature`: user-facing capability or experience built on one or more enablers

## Status Definitions
- `draft`: being authored
- `review`: under review
- `approved`: approved for next stage
- `superseded`: replaced by a newer intent
