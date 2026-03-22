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
  - docs/intent-development/implementation-specs/is-intent-001-remote-multi-agent-session-boundaries.md
- related_enabler_proposals:
  - docs/intent-development/enabler-proposals/ep-intent-007-multi-agent-simulation-runtime-foundation.md
- related_decisions:
  - docs/decisions/adr-20260321-local-first-runtime-and-multi-agent-scope.md
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
- local-first execution for the live simulation loop

## Goal
Define how the shared runtime foundation should be used in the current MVP scene.

For transcript hygiene, facilitator/evaluator separation, and optional remote turn-boundary rules, use:
- `docs/intent-development/implementation-specs/is-intent-001-remote-multi-agent-session-boundaries.md`

## Problem Statement
The foundation-level runtime substrate is now defined separately.
The remaining scene-specific problem is how to apply that foundation so this workshop stays natural, legible, and phase-appropriate.

## MVP Runtime Decision
Adopt a local-first hybrid runtime with hidden orchestration.

Runtime shape:
- one hidden `room-orchestrator`
- one speaking `facilitator-agent` using the `Mika` role contract
- one speaking `actor-agent` per stakeholder
- one post-game `local evaluator`

Execution stance:
- orchestration remains local
- live actor separation is primarily a responsibility boundary
- remote response chains are optional, not the architectural center of the MVP live loop
- evaluator remains local-first

Decision rationale:
- per-actor agents improve voice separation
- the orchestrator protects one-topic-at-a-time meeting flow
- the facilitator remains an in-world speaker, not the whole control plane
- evaluation stays fully outside the live scene
- evaluator judgment remains local so failure-signal reading does not collapse into remote write-up generation
- local-first execution keeps the runtime easier to debug, test, and explain
- proposal-heavy turns may still justify bounded sidecar help, but only as input to the main session rather than as transcript authority

## Scope
- In scope:
  - one-scene MVP application of the runtime foundation
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

### Multi-perspective sidecar rule
For MVP, treat only selected multi-perspective player turns as a special case.

Recommended handling:
1. the main session derives canonical judgment for utterance type, meeting layer, intent, and whether extra stakeholder perspective is needed
2. if `multi_perspective_needed = true`, the orchestrator prepares one bounded reaction packet
3. optional local child-session sidecars generate stakeholder-specific reaction candidates
4. the orchestrator may use that packet later for facilitator intervention, gap surfacing, or bounded perspective insertion
5. the main session keeps final visible utterance authority and should not force an immediate speaker change from this signal alone

Judgment boundary rule:
- the runtime should keep one explicit `player-turn judgment` boundary between raw player text and canonical routing tags
- that boundary may use a local heuristic implementation temporarily, but should be replaceable by AI-backed or child-session-backed judgment without changing downstream routing/state contracts
- downstream runtime code should consume canonical tags rather than re-implementing speech-act heuristics in multiple places

Do not:
- delegate canonical room-state updates to sidecars
- let sidecars write the final visible transcript directly
- trigger sidecars from rigid surface-form rules alone
- require sidecars for every clarification, confirmation, or question-answer turn

Conservative trigger rule:
- prefer false negatives over false positives for `multi_perspective_needed`
- if the room can continue naturally with one stakeholder response, keep `multi_perspective_needed = false`
- only raise it when the player turn introduces a real alternative, tradeoff, reframing pressure, or bounded-first-move choice that would materially benefit from extra perspective
- treat `multi_perspective_needed = true` as intervention-friendly timing, not as a mandatory routing override

### Meeting-layer rule
The main session should maintain an explicit meeting layer for the current exchange.

Minimum working layers:
- `why`
- `what`
- `how`

Operating rule:
- the orchestrator should prefer staying within the current layer unless the player explicitly asks to move
- sidecar outputs should be filtered against the current meeting layer before they affect visible dialogue
- a candidate that jumps from `how` back to `why`, or from `why` down to detailed `how`, should normally be suppressed unless the room is explicitly reframing
- unresolved confusion about current layer may justify facilitator intervention, but not silent actor-layer jumps

### Failure-model risk sidecar rule
If the runtime uses a failure-model sidecar during live turns:
1. the sidecar receives a bounded analysis packet rather than full canonical session ownership
2. the packet should include:
   - current meeting layer
   - active topic
   - resolved topics
   - decisions already made
   - player utterance
   - inferred player intent
   - bounded recent transcript slice
3. the sidecar should return:
   - `top_risks`
   - `excluded_as_already_resolved`
   - `excluded_as_layer_mismatch`
   - evidence or rationale
   - optional follow-up angle
4. the orchestrator should apply a second filter before any returned risk affects actor selection, facilitator intervention, or visible utterance shaping

Do not:
- let the sidecar act as an evaluator-speaking voice during the meeting
- let raw risk output pass directly into visible dialogue
- treat sidecar risk output as canonical truth about what the room must discuss next

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

If the turn came from sidecar-supported proposal evaluation, the main session should still own:
- final wording continuity with recent transcript
- final decision on whether the actor responds with support, concern, or conditional support
- visible fit to the active topic and current meeting phase

If proposal or risk sidecars are used, the main session should also own:
- final judgment about whether the response remains within the current meeting layer
- removal of already-resolved concerns from visible phrasing
- suppression of failure-model vocabulary that would sound evaluator-like in live speech

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
- `local evaluator`

Recommended first stakeholder set:
- executive stakeholder
- platform-side stakeholder
- one delivery-side stakeholder

### Execution preference
For MVP live runtime, prefer:
- one local orchestrator
- one local execution loop
- explicit role and context partition between facilitator, stakeholders, player, and evaluator
- optional remote generation only when it clearly improves the live experience enough to justify added complexity
- optional local child-session sidecars only for bounded, proposal-like reaction generation where multiple stakeholder perspectives add value

Do not assume:
- remote execution is required for actor distinctness
- visible child sessions are part of simulation-facing runtime behavior
- stronger execution separation automatically improves communication quality

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
6. Keep evaluator fully post-game and local-first.
7. If proposal-sidecar logic is introduced, keep it behind one bounded packet builder and one main-session utterance shaper.
8. If failure-model sidecar logic is introduced, keep it hidden behind a separate bounded analysis packet and an orchestrator-side second filter.

Do not implement yet:
- free actor self-selection without orchestrator approval
- more than one overlapping actor reaction
- hidden sub-conversations
- dynamic spawning of extra agents
- stronger remote actor-runtime separation without explicit product justification
- remote evaluator judgment as the default MVP path
- sidecar participation for every turn type instead of just selected proposal-like turns
- letting failure-model sidecars write visible dialogue or choose the next visible turn directly

## Risks
- the workshop may still feel over-routed if facilitator invocation thresholds are too low
- three actors may underrepresent coalition complexity while still being enough for MVP
- one-topic discipline may feel artificial if parking behavior is too visible or too frequent
- proposal-sidecar ranking can become hidden complexity if the main session does not keep packet scope and selection criteria explicit
- risk sidecars can destabilize meeting flow if layer-mismatch suppression and resolved-topic filtering are weak

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

### Proposal-turn checks
1. Clarification and confirmation turns should still work without sidecar assistance.
2. If sidecars are used for proposal turns, the final visible utterance should still read as one coherent meeting voice rather than stitched output.
3. Proposal-turn sidecars should improve perspective coverage without forcing every stakeholder to speak visibly.

### Risk-sidecar checks
1. Risk-sidecar output should exclude already-resolved items before reaching visible shaping.
2. The orchestrator should suppress sidecar risks that would jump across the current `why` / `what` / `how` meeting layer without explicit reframing.
3. Visible live dialogue should not read like a failure-model report or evaluator summary even when risk sidecars are active.

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
  - remote execution may be overvalued relative to clearer local-first boundary design

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
