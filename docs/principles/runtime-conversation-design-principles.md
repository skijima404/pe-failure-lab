# Runtime Conversation Design Principles

- status: draft
- created_at: 2026-03-24
- updated_at: 2026-03-24
- scope: repository-local principle for live simulation runtime design
- related_runtime_specs:
  - docs/intent-development/implementation-specs/is-intent-001-conversation-naturalness-runtime-behavior.md
  - docs/intent-development/implementation-specs/is-intent-001-local-first-live-actor-generation.md
  - docs/intent-development/implementation-specs/is-intent-001-thin-runtime-persona-contract.md
  - docs/intent-development/implementation-specs/is-intent-001-runtime-module-structure.md
- related_memos:
  - docs/intent-development/development-memos/dm-20260324-production-runtime-reset-direction.md

## Purpose
Capture the repository-local design principles that should govern live conversation quality in the production-facing simulation runtime.

These principles are intended to reduce drift back toward:
- over-specified actor prompts
- deterministic local phrase engines
- evaluator semantics leaking into live speech
- replay variation that depends on heavy hidden machinery too early

## Principle 1: Over-Specification Kills Conversation Naturalness
When live actor prompts become too detailed or prescriptive, the runtime tends to produce:
- repetitive meeting turns
- mechanically complete but unnatural responses
- actors that sound like one reasoning engine with different labels

Preferred direction:
- use light role contracts
- let context and turn state shape the current move
- avoid full-sentence templates as the main product behavior

## Principle 2: Actor Difference Should Come From Light Contracts
Actor distinctiveness should come primarily from:
- tone summary
- core concern
- default move
- patience
- trust threshold
- likely misunderstanding

Not from:
- long biography blocks
- large question inventories
- heavy scenario-specific hidden scripts

The runtime should preserve identity with small, stable character contracts rather than dense persona payloads.

## Principle 3: Generative Variation Is A Design Surface
Variation is not only a risk to control.
It is part of the product value when bounded correctly.

Preferred direction:
- use live context, stance, and session tension to vary reactions
- allow repeated plays of the same scenario to feel different
- accept that not every valuable playthrough needs a different scenario

Avoid:
- generic randomness with no role or topic grounding
- excessive deterministic scripting that removes replay texture

## Principle 4: Evaluation Semantics Stay Outside Live Actor Speech
Live actors and facilitator should not carry the full assessment model.

Failure Model and CNCF Maturity Model knowledge should primarily serve:
- planning layers
- evaluator evidence reading
- post-session interpretation

Live conversation should focus on:
- plausible enterprise reaction
- bounded disagreement
- clarification
- partial support
- hesitation
- unresolved pressure

Evaluation quality should come from transcript evidence, not by forcing actors to say every important dimension out loud.

## Principle 5: The Runtime Does Not Need Forced Convergence
A session does not need to end in agreement to be valuable.

Valid endings include:
- bounded conclusion
- unresolved stop
- loop threshold
- hard turn limit
- time-box expiry

Learning value comes from what happened under pressure, not only from whether the room converged.

## Principle 6: Thin Kernel, Thick Evidence
The runtime kernel should stay focused on:
- canonical state
- turn orchestration
- actor and facilitator input shaping
- transcript capture
- stop policy

It should not become:
- a model-asset reasoning store
- a dense scenario planner
- a hidden evaluator

If more assessment intelligence is needed, prefer making evaluator evidence richer instead of making live speech heavier.

## Principle 7: Production And Verification Must Stay Legible
Production-facing conversation behavior and verification scaffolding must remain visibly separate.

Default interpretation:
- `scripts/production/` is for playable product-facing flows
- `scripts/verification/` is for fixtures, mocks, and regression harnesses
- `runtime/verification/` is not product-quality actor behavior
- `tests/runtime/` protects boundaries and contracts

If a useful verification asset is promoted into production, that promotion should be explicit and reviewed.

## Usage
When deciding whether a runtime change is directionally correct, ask:
1. Does this make live conversation more natural by reducing over-specification?
2. Does this keep actor identity legible with a lighter contract?
3. Does this preserve evaluator-first assessment responsibility?
4. Does this keep replay variation grounded rather than scripted?
5. Does this keep the kernel slim?

If the answer to most of these is no, the change is likely drifting away from the intended runtime direction.
