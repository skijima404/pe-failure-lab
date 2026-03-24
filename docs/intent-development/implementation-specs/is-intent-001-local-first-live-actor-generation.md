# Implementation Spec

- intent_id: intent-001
- title: Local-First Live Actor Generation
- owner: shared
- status: draft
- created_at: 2026-03-23
- updated_at: 2026-03-24
- related_intent: docs/intent-development/intents/in-intent-001-simulation-core-loop.md
- related_feature_proposal: docs/intent-development/feature-proposals/fp-intent-001-platform-engineering-failure-simulation-core-loop.md
- related_runtime_specs:
  - docs/intent-development/implementation-specs/is-intent-001-conversation-naturalness-runtime-behavior.md
  - docs/intent-development/implementation-specs/is-intent-001-thin-runtime-persona-contract.md
  - docs/intent-development/implementation-specs/is-intent-001-runtime-module-structure.md
  - docs/intent-development/implementation-specs/is-intent-008-local-whisper-runtime-design.md
- related_decisions:
  - docs/decisions/adr-20260321-local-first-runtime-and-multi-agent-scope.md
  - docs/decisions/adr-20260323-separate-runtime-verification-assets-from-product-runtime.md
- related_development_memos:
  - docs/intent-development/development-memos/dm-20260324-clarification-turn-handling-direction.md
  - docs/intent-development/development-memos/dm-20260324-naturalness-vs-evaluation-and-reduction-first.md
  - docs/intent-development/development-memos/dm-20260324-skill-assessment-style-renderer-replacement.md
  - docs/intent-development/development-memos/dm-20260325-narrow-read-surface-experiment.md

## Goal
Define the product-facing local-first actor generation path for live simulation turns without reusing verification-only renderers.

## Problem Statement
The repository previously mixed:
- verification-oriented deterministic renderers
- product-facing live runtime discussion about natural dialogue quality

This created repeated confusion:
- local scripts looked product-facing while actually running verification scaffolding
- deterministic phrase templates were mistaken for intended live actor behavior
- naturalness tuning and verification tuning pulled on the same code path

## Decision
The repository should maintain two explicit actor-generation paths:

1. product-facing local live actor generation
2. verification-only deterministic actor rendering

The product-facing live path should:
- remain local-first for canonical state, turn ownership, topic control, and whisper handling
- avoid importing from `runtime/verification/`
- prioritize persona consistency and meeting naturalness over deterministic fixture replay
- treat whispers as optional hidden nudges rather than transcript scripts

The verification path should remain available for:
- fixture execution
- regression checks
- deterministic boundary inspection

The live runtime should also keep the actor-generation path thinner than the evaluator path:
- actor and facilitator generation should rely on minimal runtime inputs plus temporary stance context
- CNCF Maturity Model and Failure Model source knowledge should not be loaded directly into live actor generation as default runtime knowledge
- those model assets should remain primarily available to evaluation and planning layers

## Local Live Actor Generation Contract
### Ownership
- canonical room state remains in `runtime/state/`
- turn selection remains in `runtime/orchestration/`
- lightweight variation or stance injection may remain in `runtime/sidecars/` only if it stays subordinate to actor persona and topic fit
- live phrasing is generated only after canonical turn selection completes
- evaluator-specific model knowledge remains outside live actor generation

### Inputs
The live actor generator should derive visible turns from:
- runtime persona slice
- session-specific participant setup
- current active topic
- compact recent transcript
- optional selected session tensions
- optional active stance or hidden nudge for the selected speaker

The live actor generator should not require:
- direct Failure Model asset loading
- direct CNCF Maturity Model asset loading
- exhaustive persona inventories
- exhaustive scenario prose

Preferred read-surface direction:
- a play or demo runtime mode may deliberately restrict live roleplay to an allowlisted narrow read surface
- broad repository richness should not automatically become live actor context

### Naturalness Rules
The local live actor generator should:
- react to the current moment before sounding evaluative
- keep one main point per turn
- sound like the same person across runs even when the angle changes
- avoid fixed full-sentence templates as the primary speaking mechanism
- use reusable phrasing atoms sparingly and only as connective tissue
- prefer contextual references from the current transcript over generic reusable lines
- tolerate unresolved, looping, or time-boxed conversation without forcing closure language

The local live actor generator should preserve these conversational behaviors:
- content-first answering for clarification and background requests
- topic-led progression where new information creates the next question naturally
- capability-based speaker switching when another actor is better positioned to answer
- conditional actor entry rather than mandatory equal participation
- progressive deepening instead of repeating the same concern in slightly different words

The local live actor generator should also distinguish:
- clarification or background-answer turns
- ordinary reaction turns

Clarification-style turns should prefer content answer before concern restatement.

Facilitator exception:
- narrow fixed repair or stop-language is acceptable for facilitator turns when the room needs traffic control or bounded closure

Actor rule:
- stakeholder concern expression should not be primarily produced by choosing from a small closed phrase list
- repeated-play variation should come from conversational function, stance, and context, not only from phrase inventory rotation
- stakeholder turns should not primarily be controlled by large fixed lead, concern, and closing-question inventories

### Whisper Rules
- a whisper or successor mechanism may shift concern emphasis, reaction posture, or move choice
- a whisper must not become the visible wording directly
- persona core and topic fit remain stronger than whisper content
- the live actor generator should ignore a whisper if using it would force a second topic or break the persona

If the whisper mechanism is replaced, the replacement should still remain:
- short-lived
- subordinate to topic fit
- subordinate to persona consistency
- unsuitable as a direct transcript script

### Minimal Runtime Contract
The live actor generation path should aim for a minimal runtime contract:
- one canonical room state
- one next-speaker decision
- one compact actor input
- one generated visible turn
- one transcript append

The live actor path should not also become:
- a full model-asset reasoning layer
- a deterministic phrase engine
- a forced-convergence controller
- a large repository-context interpreter that tries to carry every available source detail into live speech

Narrow read-surface rule:
- if play quality degrades because live roleplay appears repo-informed rather than exchange-local, prefer introducing a narrow runtime read policy over broad repo-context access

### Clarification Handling Rule
The local-first live actor path should treat clarification-style player turns as a first-class case.

Expected behavior:
- if the player asks for background or framing, the room should provide usable content rather than only repeating persona pressure
- if the requested clarification belongs to room framing, facilitator recap is allowed
- if the requested clarification belongs to the engaged stakeholder's role, that actor should answer in content-first mode

The runtime should not treat every clarification as if it were a proposal needing the same bounded-reaction surface.

### Evaluation Separation Rule
The live actor path should optimize for natural dialogue, while evaluation remains intentionally stricter.

Expected direction:
- live actors do not need to explicitly cover every assessment dimension
- evaluator output may remain severe if transcript evidence is weak, missing, or overly fuzzy
- smooth or collaborative talk alone is not sufficient for a strong evaluation
- actor count may increase without requiring all actors to speak in every exchange

## Current Runtime Direction
The current local-first runtime should be interpreted with the following operational shape:

- live actor surface generation should derive turns from:
  - runtime persona slice
  - participant session setup
  - compact transcript reference
  - session tension inferred from exchange state
  - optional short-lived whisper stance hints
- whisper payloads should carry light stance and move bias such as:
  - probing
  - guarded
  - constructive
  - skeptical
- whisper payloads should not carry transcript-ready full-sentence questions as the primary live path
- a stakeholder turn may:
  - ask a bounded question
  - narrow the proposal
  - give conditional support
  - push back on unresolved ambiguity
- the runtime should return control to the player after a settled stakeholder response instead of automatically routing through facilitator closure language
- facilitator intervention should remain for:
  - opening
  - trigger/background alignment
  - turn-ownership repair
  - pile-on risk
  - topic drift
  - explicit stop transitions
- stop transitions may be triggered by:
  - bounded next-step visibility
  - resolved-enough exchange state
  - repeated unresolved looping
  - hard turn limit
- unresolved or time-boxed endings should remain evaluator-valid and should not be treated as runtime failure

### Reduction-First Implementation Rule
When local-live conversation becomes repetitive, game-like, or over-controlled, prefer subtraction before expansion.

First reduction targets:
- fixed phrase inventories
- heavy persona or scenario payloads
- routing rules that over-stick to the current actor
- control logic that forces visible turns to carry hidden evaluation semantics
- repository context that is too broad for the current live exchange

Only add new runtime machinery after reduction attempts fail to recover naturalness.

### Renderer Replacement Allowance
If repeated playtests still show phrase-inventory feel, weak clarification answers, or poor topic progression after reduction-first passes, the repository may replace the stakeholder live renderer with a thinner skill-assessment-style realization path.

Replacement scope should prefer:
- stakeholder visible-turn realization
- actor live prompt shape
- minimal actor handoff contract

Replacement scope should avoid unnecessary churn in:
- canonical state
- orchestration
- evaluator path
- production / verification / test boundaries

### Stop And Closure Rules
The local-first simulation does not need to force agreement to remain valid.

The runtime may end a session because of:
- bounded conclusion
- unresolved time-box expiry
- repetition or loop threshold
- hard turn limit

Low alignment or unresolved endings should remain valid evaluator inputs rather than invalid play states.

### Verification Boundary
Product-facing live actor generation must not:
- import deterministic local rendering from `runtime/verification/`
- import mock adapters from `runtime/verification/`
- share the same responder implementation as fixture execution

## Script Contract
The repository should distinguish:
- `simulate:local` and `simulate:local:interactive` as product-facing local live paths
- `simulate:local:mock` and `fixture:*` commands as verification-oriented paths

## Validation
1. Product-facing local scripts do not import from `runtime/verification/`.
2. Verification scripts may import from `runtime/verification/`.
3. The same stakeholder still sounds like the same person across runs.
4. Whisper influence appears as a shifted angle rather than a copied hidden packet.
5. Local live turns remain on one active topic and do not regress into deterministic fixture wording.
6. Product-facing live actor generation does not require direct loading of Failure Model or CNCF Maturity Model source assets.
7. The runtime can end on time-box or unresolved stop conditions without collapsing the learning loop.
8. The player can regain turn ownership after a stakeholder response without mandatory facilitator settlement.

## Follow-up
- improve live actor surface realization quality without reintroducing verification assets
- expand local live actor generation to cover facilitator wording if the current local facilitator path becomes a naturalness bottleneck
- add clarification-answer regression coverage so player informational questions do not collapse back into repeated persona-warning turns
- keep evaluation strictness improvements in evaluator-facing paths rather than pushing them back into actor phrasing
