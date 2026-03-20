# Implementation Spec

- intent_id: intent-001
- title: MVP Multi-Agent Runtime Application
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
  - docs/intent-development/implementation-specs/is-intent-001-conversation-naturalness-runtime-behavior.md
  - docs/intent-development/implementation-specs/is-intent-001-conversation-naturalness-multi-agent-handoff.md
- related_enabler_proposals:
  - docs/intent-development/enabler-proposals/ep-intent-007-multi-agent-simulation-runtime-foundation.md
- related_product_contracts:
  - docs/product/contracts/mvp-simulation-contract.md
  - docs/product/contracts/facilitator-role-contract.md
- depends_on_enablers:
  - intent-000
  - intent-007

## Enabler Alignment
This implementation spec applies the shared multi-agent runtime foundation to the current one-scene MVP workshop.

It keeps the current product direction intact:
- one-scene workshop simulation
- natural conversation as top live-runtime priority
- visible structural pressure without evaluator-like live dialogue
- facilitator routing allowed when it remains natural

## Goal
Define how the shared multi-agent runtime foundation should be used in the current MVP scene.

## Problem Statement
The foundation-level runtime substrate is now defined separately.
The remaining scene-specific problem is how to apply that foundation so this workshop stays natural, legible, and phase-appropriate.

## MVP Runtime Decision
Adopt a hybrid runtime with hidden orchestration.

Runtime shape:
- one hidden `room-orchestrator`
- one speaking `facilitator-agent` using the `Mika` role contract
- one speaking `actor-agent` per stakeholder
- one post-game `evaluator-agent`

Decision rationale:
- per-actor agents improve voice separation
- the orchestrator protects one-topic-at-a-time meeting flow
- the facilitator remains an in-world speaker, not the whole control plane
- evaluation stays fully outside the live scene

## Scope
- In scope:
  - one-scene MVP application of the multi-agent runtime foundation
  - scene-specific turn-selection constraints
  - MVP participant count and role usage
  - validation plan for this workshop-style conversation
- Out of scope:
  - redefining the shared runtime foundation
  - multi-scene runtime reuse rules
  - alternate non-workshop conversation formats

## Turn Orchestration Rules
### Turn ownership
Use the ownership model defined in `intent-007`.

For this MVP workshop, preferred ownership sequence is:
- `initiating_actor`
- `player`
- `initiating_actor`
- optional `reacting_actor`
- optional `facilitator`

### Default flow
Preferred live pattern:
1. actor raises or reacts on current topic
2. player answers
3. same actor gets one short reaction
4. if overlap exists, one related actor may react
5. facilitator intervenes only if needed or if exchange should transition

### Facilitator invocation rule
The orchestrator should choose `facilitator-agent` only when at least one condition holds:
- no clear next speaker exists
- more than one actor has a valid claim to speak next
- a new topic must be parked explicitly
- the current speaker is rambling or repeating
- the exchange is ready for closing transition

Otherwise prefer direct actor or player continuation.

### Topic control rule
For this MVP workshop, reject a candidate turn that would:
- create a second full active topic without parking the first
- batch multiple stakeholder demands into one player burden
- push to detailed implementation while the room is still resolving overview framing

When a new valid concern appears, the runtime should either:
- map it into the current topic
- park it with a short label
- or explicitly switch topics if the current topic is resolved enough

### Follow-up depth rule
For MVP, a single actor exchange should usually allow:
- one primary question
- one player answer
- one short actor reaction
- optionally one more player clarification or one overlapping actor reaction

This is enough for stance movement without creating cross-examination rhythm.

### Silence and hesitation rule
The orchestrator should tolerate:
- brief partial agreement
- short reactions before analytical framing
- bounded uncertainty

It should not force facilitator speech just to keep every turn formally connected.

## Prompting Contract
### Actor turn prompt input
Minimum input bundle:
- `speaker_id`
- `speaker_runtime_slice`
- `turn_role`
- `scene_phase`
- `active_topic`
- `exchange_state_summary`
- `recent_transcript`
- `response_constraints`

Recommended `response_constraints`:
- one main point
- natural enterprise tone
- no scoring language
- no hidden-state exposure
- prefer reaction before structured challenge when appropriate

### Facilitator turn prompt input
Minimum input bundle:
- `intervention_reason`
- `active_topic`
- `recent_transcript`
- `visible_unresolved_items`
- `transition_goal`

Recommended `transition_goal` examples:
- `clarify-turn-owner`
- `park-topic`
- `move-to-related-actor`
- `start-closing-checkpoint`

## MVP-Specific Runtime Shape
Use this cast:
- `facilitator-agent` as `Mika`
- `3` stakeholder `actor-agents` for the first implementation slice
- `player`
- `evaluator-agent`

Recommended first stakeholder set:
- executive stakeholder
- platform-side stakeholder
- one delivery-side stakeholder

## Smallest Implementable Slice
Implement the MVP runtime in this order:

1. Build a single-process orchestrator using the `intent-007` room-state contract.
2. Implement `facilitator-agent` plus `3` stakeholder actor agents.
3. Give each actor only compressed persona data and bounded recent context.
4. Enforce explicit `active_topic` and `parking_lot` updates every turn.
5. Allow only these turn patterns:
   - actor -> player -> same actor
   - actor -> player -> overlapping actor
   - facilitator -> actor
   - facilitator -> player
6. Keep evaluator fully post-game.

Do not implement yet:
- free actor self-selection without orchestrator approval
- more than one overlapping actor reaction
- hidden sub-conversations
- dynamic spawning of extra agents

## Risks
- the workshop may still feel over-routed if facilitator invocation thresholds are too low
- three actors may underrepresent coalition complexity while still being enough for MVP
- one-topic discipline may feel artificial if parking behavior is too visible or too frequent

## Validation Plan
### Transcript checks
1. In a healthy run, the facilitator should not appear between most stakeholder-player exchanges.
2. At least one exchange should show same-actor follow-up before topic transition.
3. At least one exchange should show a natural overlapping actor reaction without facilitator bridging.
4. The room should usually keep only one active topic open.

### Distinctness checks
1. Stakeholders should be recognizable by speech pattern before their domain concern is fully explicit.
2. At least one actor should react with curiosity or partial agreement before pressure.
3. At least one actor should offer a rough or imperfect idea without sounding like a rubric.

### Structural checks
1. A session can still expose scope, ownership, or support ambiguity.
2. Structural result remains reportable primarily as `x/5`.
3. Later-phase detail is not required for a valid mid-range result in this workshop scene.

## Change Contract
- Allowed Changes:
  - refine the MVP application of the shared multi-agent runtime foundation
  - align implementation planning with existing facilitator and MVP simulation contracts
  - introduce code only after the scene-specific runtime contract is explicit
- Forbidden Changes:
  - redefining the shared multi-agent foundation inside this document
  - replacing natural turn emergence with rigid round-robin control
  - exposing scoring logic directly to live actors
- Approval Required:
  - changing the number of MVP stakeholder roles
  - replacing the facilitator with a non-diegetic narrator
  - making the evaluator part of live turn orchestration
- Validation:
  - traceability is maintained from intent-001 to this spec, `intent-007`, and the linked product contracts
  - MVP-specific runtime constraints are distinguishable from the shared runtime foundation
  - scene-specific rules are concrete enough to drive implementation
- Rollback:
  - revert this spec and any dependent runtime implementation docs together if the hybrid runtime direction is rejected

## Execution Notes
- Files allowed to touch:
  - docs/intent-development/implementation-specs/is-intent-001-conversation-naturalness-multi-agent-handoff.md
  - docs/intent-development/implementation-specs/is-intent-001-conversation-naturalness-runtime-behavior.md
  - docs/intent-development/feature-proposals/fp-intent-001-platform-engineering-failure-simulation-core-loop.md
  - docs/intent-development/enabler-proposals/ep-intent-007-multi-agent-simulation-runtime-foundation.md
  - runtime implementation files to be introduced later
- Files explicitly out of scope:
  - failure-model/*
  - unrelated intent documents
- Risks:
  - prompt design may be over-tuned before enough transcript evidence exists
  - room-state schemas may drift unless runtime code uses the same field names

## Implementation Outline
1. Finalize the tactical runtime contract in docs.
2. Define the shared room-state schema in code and fixtures from `intent-007`.
3. Implement the hidden orchestrator and deterministic turn-selection rules for this workshop.
4. Implement actor and facilitator prompt adapters against the shared state.
5. Add transcript-based validation fixtures for naturalness and structural visibility.

## Verification
1. The runtime can produce a valid turn-selection decision from the shared `room_state` without asking every agent what should happen next.
2. Actor prompts can be generated from a bounded input bundle that excludes evaluator logic.
3. The facilitator prompt can be generated only when an explicit intervention reason exists.
4. Test transcripts can show one-topic-at-a-time progression with short, natural follow-up chains.
