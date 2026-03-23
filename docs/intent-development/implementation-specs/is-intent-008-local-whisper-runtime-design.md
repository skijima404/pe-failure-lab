# Implementation Spec

- intent_id: intent-008
- title: Local Whisper Runtime Design
- owner: shared
- status: archived
- created_at: 2026-03-22
- updated_at: 2026-03-24
- related_value_streams:
  - docs/intent-development/value-streams/vs-intent-001-simulation-session-to-reflection.md
- related_intent: docs/intent-development/intents/in-intent-008-local-whisper-runtime-variation.md
- related_feature_proposal: docs/intent-development/feature-proposals/fp-intent-008-local-whisper-runtime-variation.md
- related_ui_spec: TBD
- related_runtime_specs:
  - docs/intent-development/implementation-specs/is-intent-001-conversation-naturalness-runtime-behavior.md
  - docs/intent-development/implementation-specs/is-intent-001-runtime-module-structure.md
  - docs/intent-development/implementation-specs/is-intent-001-runtime-observability-and-validation.md
- related_enabler_proposals:
  - docs/intent-development/enabler-proposals/ep-intent-007-multi-agent-simulation-runtime-foundation.md
- related_decisions:
  - docs/decisions/adr-20260321-local-first-runtime-and-multi-agent-scope.md
- depends_on_enablers:
  - intent-000
  - intent-007

## Archive Note
This implementation spec is preserved as historical exploration material and should not be treated as the current variation design contract.

It is archived because:
- the current direction no longer treats whisper packets as the preferred primary mechanism for replay variation
- the runtime is being simplified toward stop-policy-driven sessions, thinner actor inputs, and evaluator-first model-asset usage
- keeping whisper-specific rules active would increase the risk of accidental reference to an approach now considered a reset candidate

## Enabler Alignment
This implementation spec operationalizes the local-first runtime direction by defining a bounded hidden-variation mechanism that does not turn sidecars into transcript owners or next-speaker authorities.

It narrows the reusable runtime foundation in `intent-007` for one concrete product need:
- repeated-play variation
- persona-preserving local bias injection
- bounded hidden helper usage

## Goal
Define how the runtime should introduce occasional stakeholder variation through short-lived whisper injections while preserving:
- canonical room-state ownership in the main session
- stable persona identity
- local-first orchestration
- visible dialogue authority in the main session

## Problem Statement
The runtime must avoid two failure modes:
- a single reasoning loop that drives the room toward premature closure because it is implicitly optimizing for post-game coherence
- a more separated actor model where helper outputs start selecting speakers, thinning persona density, and adding orchestration complexity

The missing design layer is a mechanism that can influence what a stakeholder temporarily pays attention to without deciding who speaks next or writing the final visible turn.

## Scope
- In scope:
  - whisper packet shape
  - whisper trigger rules
  - whisper lifetime and expiry rules
  - actor-prompt integration rules
  - selection-boundary rules that prevent sidecars from owning turn routing
  - observability and validation expectations for whisper behavior
- Out of scope:
  - broad scenario generation
  - replacing canonical turn selection with hidden-helper ranking
  - persistent stakeholder memory graphs
  - remote-first actor runtime design

## Whisper Runtime Contract
### Main-session ownership rule
The main session remains the canonical owner of:
- room state
- turn selection
- visible transcript
- meeting-layer judgment
- close readiness

Hidden helpers may shape actor attention, but must not directly decide the final visible turn.

### Whisper purpose rule
A whisper is a bounded, temporary signal that nudges one stakeholder toward:
- a different concern priority
- a slightly different reaction temperature
- a new angle worth surfacing
- a more specific follow-up shape

A whisper is not:
- a replacement persona
- a final utterance
- a mandatory question script
- a durable identity rewrite

### Minimum whisper packet
The runtime should support a minimum packet shape with:
- `whisper_id`
- `target_participant_id`
- `triggered_at_turn`
- `expires_after_turn`
- `source_reason`
- `angle_shift`
- `temperature_shift`
- `priority_hint`
- `optional_question_seed`
- `do_not_repeat_tags`

Recommended field meaning:
- `target_participant_id`:
  which stakeholder may receive the hidden bias
- `source_reason`:
  why this whisper was generated from current topic, player move, or room state
- `angle_shift`:
  what new lens becomes temporarily salient, for example `manager-capacity`, `launch-risk`, `adoption-friction`, or `boundary-clarity`
- `temperature_shift`:
  a bounded tone nudge such as `more-curious`, `more-concerned`, or `more-constructive`
- `priority_hint`:
  whether the angle should be used if naturally relevant or only if the actor is already speaking
- `optional_question_seed`:
  a lightweight candidate follow-up shape, not a required line
- `do_not_repeat_tags`:
  guards against repeating the same injected angle too often

### Whisper lifetime rule
Whispers must expire quickly.

Recommended default:
- usable for the next eligible stakeholder turn only
- hard expiry after `1` or `2` turns

Expired whispers should be removed from active runtime state and retained only in logs or trace artifacts.

### Trigger rule
Whispers should be generated conservatively.

Valid triggers include:
- the player introduces a tradeoff that makes another stakeholder's angle plausibly salient
- the room is becoming repetitive in concern ordering
- the current stakeholder's stable persona supports more than one plausible next lens
- a latent organizational pressure can plausibly surface now without opening a full second topic

Invalid triggers include:
- every player proposal by default
- surface-form keyword matching alone with no room-state check
- attempts to manufacture conflict when the room is naturally converging
- replacing missing scenario design with arbitrary randomness

### Selection-boundary rule
Whisper generation must not directly rewrite:
- `initiating_actor_id`
- `awaiting_reaction_from`
- canonical facilitator intervention reason

The orchestrator may consider active whispers only after a canonical next speaker has already been selected.

Whispers may:
- shape the selected actor's prompt input
- shape whether a selected actor leans toward curiosity, concern, or constructive challenge
- provide a temporary angle if it fits the active topic

Whispers may not:
- override the canonical next speaker by themselves
- force facilitator intervention by themselves
- open a second full topic by themselves

### Actor prompt integration rule
When the selected speaker has an active whisper, the actor prompt may include:
- one temporary angle shift
- one bounded reaction-temperature hint
- one optional follow-up seed

The prompt must also state:
- the whisper is subordinate to persona core
- the actor should ignore the whisper if it would break topic fit or sound unnatural
- the actor should not expose hidden-system reasoning

### Persona preservation rule
Runtime persona slices remain the primary source of identity.

Whispers must remain secondary to:
- core concern
- typical bias
- escalation trigger
- cooperation condition
- voice cues

If a whisper conflicts with persona core, persona wins.

### Topic-fit rule
A whisper should normally stay within the current active topic and meeting layer.

Allowed:
- reframing the same topic through another stakeholder lens
- surfacing one concrete implication of the active topic

Disallowed:
- using a whisper to silently jump from `why` to deep `how`
- using a whisper to introduce a new unresolved topic without parking behavior
- using a whisper to reopen a settled exchange unless the orchestrator independently chooses to do so

## State Contract
Recommended additions to canonical runtime state:
- `sidecar_state.active_whispers`
- `sidecar_state.whisper_history`

Recommended `active_whispers` behavior:
- small bounded list
- at most one active whisper per stakeholder by default
- explicit expiry metadata

Recommended `whisper_history` behavior:
- append-only trace for validation
- includes whether the whisper was consumed, ignored, or expired unused

## Observability Contract
The runtime should log for each whisper:
- when it was created
- why it was created
- who it targeted
- whether it was consumed
- whether it expired unused
- whether it was suppressed for topic-fit or persona-fit reasons

Turn logs should be able to answer:
- was a whisper active for this speaker?
- did it affect prompt shaping?
- did the visible turn remain within topic and persona constraints?

## Validation Contract
Deterministic checks should catch:
- whisper-driven next-speaker overrides
- whispers that survive past their expiry
- repeated reuse of the same angle tag too often in one session window
- actor prompts where whisper content exceeds persona content in importance
- visible output that sounds like hidden-helper analysis instead of natural dialogue

Fixture-based checks should review:
- same-scenario replay with meaningful but bounded variation
- same persona sounding like the same person across different whispers
- no increase in facilitator overuse caused by whisper logic
- no new topic sprawl caused by whisper injection

## Change Contract
- Allowed Changes:
  - add whisper packet types, expiry handling, and prompt-shaping rules
  - refine conservative trigger logic tied to topic, role, and room state
  - add validation fixtures for repeated-play variation and persona preservation
- Forbidden Changes:
  - using whisper helpers as direct next-speaker selectors
  - allowing hidden helpers to emit final in-world transcript text as authoritative output
  - making persistent actor-memory divergence the default runtime posture
- Approval Required:
  - changing the rule that the main session owns canonical room state and visible transcript
  - expanding whisper lifetime beyond short-lived bounded use without a new product decision
  - letting whisper logic silently rewrite facilitator intervention rules
- Validation:
  - a developer can trace whisper creation, consumption, suppression, and expiry
  - repeated runs can vary without collapsing persona identity
  - canonical turn selection remains explainable without helper ambiguity
- Rollback:
  - revert this spec together with runtime whisper-state changes if the design is rejected

## Execution Notes
- Files allowed to touch:
  - runtime/state/*
  - runtime/sidecars/*
  - runtime/agents/actor/*
  - runtime/execution/session-driver.ts
  - runtime/observability/*
  - runtime/validation/*
- Files explicitly out of scope:
  - failure-model/*
  - unrelated product contracts
  - broad scenario-generation assets
- Risks:
  - weak expiry rules could turn whispers into hidden persistent memory
  - overly generic angle labels could make runs feel random rather than plausible
  - prompt overloading could recreate evaluator-like language through helper summaries

## Implementation Outline
1. Replace proposal-sidecar-centered state with whisper-oriented bounded hidden state.
2. Define conservative trigger rules that derive whispers from player move, active topic, and room state rather than from keywords alone.
3. Integrate active whispers into actor prompt shaping only after canonical turn selection is complete.
4. Add observability and validation so whisper creation, use, suppression, and expiry remain inspectable.

## Verification
1. The runtime can explain who spoke next without relying on whisper logic.
2. The same scenario can produce at least two plausibly different stakeholder turns while preserving recognizable persona voice.
3. A whisper expires predictably if it is not used.
4. Actor prompts remain persona-first and treat whisper content as secondary.
5. Transcript fixtures do not show new evaluator leakage or topic sprawl caused by whisper support.
