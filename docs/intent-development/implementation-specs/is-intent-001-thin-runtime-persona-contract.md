# Implementation Spec

- intent_id: intent-001
- title: Thin Runtime Persona Contract
- owner: shared
- status: draft
- created_at: 2026-03-24
- updated_at: 2026-03-24
- related_intent: docs/intent-development/intents/in-intent-001-simulation-core-loop.md
- related_feature_proposal: docs/intent-development/feature-proposals/fp-intent-001-platform-engineering-failure-simulation-core-loop.md
- related_runtime_specs:
  - docs/intent-development/implementation-specs/is-intent-001-local-first-live-actor-generation.md
  - docs/intent-development/implementation-specs/is-intent-001-conversation-naturalness-runtime-behavior.md
  - docs/intent-development/implementation-specs/is-intent-001-runtime-module-structure.md
- related_development_memos:
  - docs/intent-development/development-memos/dm-20260324-production-runtime-reset-direction.md

## Goal
Define a thinner runtime persona contract that preserves actor distinctiveness without overloading live generation with dense persona prose, evaluator logic, or scenario-heavy behavioral scripts.

## Problem Statement
The repository's current runtime direction is moving toward:
- thinner local-first kernel responsibilities
- more generative live conversation
- evaluator-first model-asset usage

If runtime persona assets stay too heavy, that direction will be undermined:
- actor prompts become over-specified
- live turns sound structurally correct but repetitive
- actor behavior starts carrying evaluation semantics that should stay outside live speech
- replay variation becomes hard to achieve without adding more hidden runtime machinery

## Decision
Runtime personas should be compressed into a light character contract suited for live turn generation.

The runtime persona contract should optimize for:
- recognizable voice difference
- stable concern orientation
- predictable conversational behavior under pressure
- compatibility with stance-driven live rendering

The runtime persona contract should not optimize for:
- exhaustive role biography
- complete question inventories
- embedding assessment dimensions directly into actor behavior
- carrying full Failure Model or CNCF Maturity Model semantics into live speech

## Thin Runtime Persona Contract
### Required Runtime Fields
Each live actor should expose only a minimal stable runtime contract:
- `tone_summary`
- `core_concern`
- `default_move`
- `patience`
- `trust_threshold`
- `likely_misunderstanding`

### Recommended Optional Fields
Use only when they clearly improve natural conversation:
- `cooperation_condition`
- `voice_cues`

### Field Meaning
- `tone_summary`:
  one-line description of how the actor typically sounds in conversation
  example style:
  - skeptical, value-oriented, commercially serious
  - practical, plainspoken, guarded about hidden extra work
  - practical, open, impatient with vague helpfulness
- `core_concern`:
  the main thing the actor is trying not to lose
- `default_move`:
  the actor's most likely conversational move when reacting naturally
- `patience`:
  how long the actor tolerates ambiguity before pushing harder
- `trust_threshold`:
  what level of clarity or evidence the actor needs before softening
- `likely_misunderstanding`:
  the actor's default wrong assumption or interpretive bias
- `cooperation_condition`:
  the condition under which the actor starts helping rather than only testing
- `voice_cues`:
  sparse phrasing guidance, not sentence templates

## Strict Vocabulary Appendix
Runtime values that directly affect branching should use strict vocabulary.

### `default_move`
Allowed values:
- `ask`
- `narrow`
- `support-with-condition`
- `push-back`
- `repair-flow`

### `patience`
Allowed values:
- `low`
- `medium`
- `high`

### `trust_threshold`
Allowed values:
- `one-bounded-signal`
- `visible-support-boundary`
- `day-one-utility`
- `credible-transition-path`
- `direct-exchange-legible`

### `tone_summary`
`tone_summary` should remain guidance-oriented rather than enum-locked.

It should:
- stay short
- describe the speaking texture
- resemble `skill-assessment` tone summaries

It should not:
- become a long biography
- become a hidden checklist
- become a branching key in runtime logic

## Runtime Usage Rules
### Live generation rule
The live actor renderer or prompt builder should consume the thin runtime contract directly.

It should combine:
- current topic
- recent transcript
- temporary stance
- thin actor contract

It should not require:
- long persona paragraphs
- large question banks
- detailed scenario-specific hidden instructions

### Stance interaction rule
Temporary stance should shape the current turn, but stable actor contract should remain the source of identity.

Recommended relationship:
- thin runtime contract = stable identity
- stance = temporary posture inside this run or turn

### Evaluation boundary rule
Runtime persona assets must not become a hidden place where evaluation logic is smuggled back into actor turns.

Avoid:
- putting scoring dimensions directly into actor persona bullets
- adding evaluator-like failure checklists into persona contracts
- writing persona fields that exist only to improve rubric coverage

## Current Operating Shape
The current runtime should interpret the thin contract as follows:

- `tone_summary`:
  - stable speaking texture for the actor
  - should resemble `skill-assessment` tone summaries more than a long biography
- `default_move`:
  - maps into the local live renderer's bounded move family
  - should use the strict vocabulary appendix values
- `patience`:
  - indicates how quickly the actor hardens under pressure or looping
  - should use the strict vocabulary appendix values
- `trust_threshold`:
  - indicates how easily the actor softens when the player offers one believable bounded signal
  - should use the strict vocabulary appendix values
- `likely_misunderstanding`:
  - encodes the actor's default wrong read of the room
  - should remain conversational, not evaluator-like
- `cooperation_condition`:
  - remains optional
  - should describe when the actor starts helping instead of only testing
- `voice_cues`:
  - should stay sparse
  - they are cues, not templates

## Scenario Contract Alignment
Scenario and session setup should also remain thin enough to match the persona contract.

Preferred session-facing actor setup:
- one-line role focus
- one current pressure seed
- one likely misunderstanding or overreach
- one likely first move

Current session setup field names:
- `role_focus`
- `current_pressure_seed`
- `likely_misunderstanding_or_overreach`
- `likely_first_move`

Avoid:
- detailed scripted turn trees
- success-condition prose embedded directly into actor setup
- broad hidden context packs that actors must carry every turn

## Validation
1. Actors remain distinguishable with a thin contract.
2. Live turns become less templated without collapsing actor identity.
3. Reducing persona detail does not reintroduce evaluator-like speech.
4. The live runtime can support replay variation without requiring heavier hidden orchestration.

## Follow-up
- refactor runtime persona source assets toward the thin contract
- align `session_setup` fields with the same reduced character model
- remove or archive persona fields that primarily served older deterministic or convergence-heavy runtime behavior
