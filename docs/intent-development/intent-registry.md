# Intent Registry

Last updated: 2026-03-22

| intent_id | proposal_type | title | stage | enabler_proposal | feature_proposal | related_enablers | ui_spec | implementation_spec | status | updated_at |
|---|---|---|---|---|---|---|---|---|---|---|
| intent-000 | enabler | Platform Engineering Failure Model | proposal | docs/intent-development/enabler-proposals/ep-intent-000-platform-engineering-failure-model.md |  |  |  |  | draft | 2026-03-17 |
| intent-001 | feature | Platform Engineering Failure Simulation Core Loop | implementation |  | docs/intent-development/feature-proposals/fp-intent-001-platform-engineering-failure-simulation-core-loop.md | intent-000 | docs/intent-development/ui-specs/ui-intent-001-simulation-session-flow.md | docs/intent-development/implementation-specs/is-intent-001-conversation-naturalness-runtime-behavior.md | draft | 2026-03-19 |
| intent-002 | feature | Precise Failure Pattern Scenario Design | proposal |  | docs/intent-development/feature-proposals/fp-intent-002-precise-failure-pattern-scenario-design.md | intent-000 |  |  | draft | 2026-03-17 |
| intent-003 | feature | End-of-Game Assessment, Feedback, and Discussion | proposal |  | docs/intent-development/feature-proposals/fp-intent-003-end-of-game-assessment-feedback-and-discussion.md | intent-000 |  |  | draft | 2026-03-17 |
| intent-004 | feature | Demo-Grade Live Simulation Surface | proposal |  | docs/intent-development/feature-proposals/fp-intent-004-demo-grade-live-simulation-surface.md | intent-000 |  |  | draft | 2026-03-17 |
| intent-005 | enabler | Failure Model Authoring Guidance | proposal | docs/intent-development/enabler-proposals/ep-intent-005-failure-model-authoring-guidance.md |  |  |  |  | draft | 2026-03-17 |
| intent-006 | feature | GenAI-Assisted Failure Model Authoring Workflow | proposal |  | docs/intent-development/feature-proposals/fp-intent-006-genai-assisted-failure-model-authoring-workflow.md | intent-000, intent-005 |  |  | draft | 2026-03-17 |
| intent-007 | enabler | Multi-Agent Simulation Runtime Foundation | proposal | docs/intent-development/enabler-proposals/ep-intent-007-multi-agent-simulation-runtime-foundation.md |  |  |  |  | draft | 2026-03-21 |
| intent-008 | feature | Local Whisper Runtime Variation | implementation |  | docs/intent-development/feature-proposals/fp-intent-008-local-whisper-runtime-variation.md | intent-000, intent-007 |  | docs/intent-development/implementation-specs/is-intent-008-local-whisper-runtime-design.md | draft | 2026-03-22 |

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
- `archived`: preserved for historical reference but not active current truth
