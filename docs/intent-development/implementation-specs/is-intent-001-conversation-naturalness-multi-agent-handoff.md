# Implementation Spec - Intent 001 Conversation Naturalness Multi-Agent Handoff

- Product: pe-failure-lab
- Intent: intent-001
- Artifact Type: implementation-spec
- Status: draft
- Updated: 2026-03-20
- Related:
  - `docs/intent-development/enabler-proposals/ep-intent-007-multi-agent-simulation-runtime-foundation.md`
  - `docs/intent-development/implementation-specs/is-intent-001-conversation-naturalness-runtime-behavior.md`
  - `docs/intent-development/implementation-specs/is-intent-001-mvp-multi-agent-runtime-design.md`
  - `docs/product/contracts/mvp-simulation-contract.md`
  - `docs/product/contracts/facilitator-role-contract.md`
  - `docs/product/personas/runtime/`

## Purpose
Provide a development handoff for possible multi-agent runtime designs focused on conversation naturalness.

This document is intentionally comparative.
For the tactical MVP implementation contract, use:
- `docs/intent-development/implementation-specs/is-intent-001-mvp-multi-agent-runtime-design.md`

For the reusable runtime foundation, use:
- `docs/intent-development/enabler-proposals/ep-intent-007-multi-agent-simulation-runtime-foundation.md`

This document compares:
- a single-agent conversation runtime
- a multi-agent runtime with one agent per actor
- a hybrid option

The goal is not model maximalism.
The goal is to improve:
- perceived voice separation
- workshop-like turn flow
- phase-appropriate pressure
- reduced "all participants sound like one person" failure

## Problem Statement
Current conversation naturalness issues appear to come from one runtime layer trying to optimize all of the following at once:
- persona distinctiveness
- phase appropriateness
- structural failure visibility
- conversation flow control
- evaluation readiness

This creates pressure toward the easiest stable solution:
- participants sound too similar
- some personas behave like failure-signal detectors rather than people
- questions become too abstract or too early
- review-meeting behavior reappears even in workshop framing

## Options

### Option A: Single-Agent Runtime
One runtime agent produces the whole live conversation.

#### Advantages
- simplest implementation
- lowest orchestration cost
- easiest state sharing
- easiest to debug deterministically
- easiest to keep topic count under control

#### Disadvantages
- voices tend to converge
- personas can collapse into one shared reasoning style
- the same agent may over-prioritize structural signal detection over natural speech
- facilitator, persona, and evaluator concerns are harder to separate cleanly
- subtle phase drift is harder to prevent because the same agent is also incentivized to surface structural risk

#### Best Use
- earliest prototype
- low-cost demo mode
- environments where consistency matters more than character separation

### Option B: One Agent Per Actor
Each in-world participant gets a separate runtime agent.

Typical cast:
- `Aki`
- `Naoki`
- `Hiroshi`
- `Emi`
- `Mika`
- optional separate `Evaluator`

#### Advantages
- strongest voice separation
- more believable disagreement, hesitation, and imperfect idea generation
- easier to make each actor feel like a person rather than a rubric
- actor-level tuning becomes more local and understandable
- good fit for workshop scenes where lateral reactions matter

#### Disadvantages
- higher orchestration complexity
- topic sprawl risk increases sharply
- actors may all independently push structural concerns too early
- shared context can drift across agents
- requires a strong facilitator or conductor layer to preserve flow
- more expensive and harder to test reproducibly

#### Best Use
- naturalness-first runtime
- workshop-heavy scenes
- later-stage simulation runtime where actor differentiation is a major product value

### Option C: Hybrid Runtime
One conversation-control agent manages flow.
Separate actor agents generate participant behavior.
Evaluation is separated into a post-game agent.

Typical split:
- actor agents for stakeholders
- one in-world facilitator or out-of-band conductor
- one evaluator after the scene

#### Advantages
- much better voice separation than single-agent
- better flow control than fully distributed actor-only runtime
- cleaner separation between "who is speaking" and "what structural pressure matters"
- easier phase caps and topic limits
- evaluator can be kept out of live dialogue

#### Disadvantages
- still meaningfully more complex than single-agent
- conductor quality becomes critical
- unclear responsibility boundaries can still cause odd turns unless carefully designed
- requires explicit rules for when actor agents may initiate, react, or be skipped

#### Best Use
- recommended direction for conversation naturalness work
- scenes where workshop flow matters more than strict deterministic control

## Recommendation
Recommended default: `Option C - Hybrid Runtime`

Reason:
- `Option A` is easier, but it keeps reproducing the same core failure: one intelligence trying to be actor, facilitator, pressure controller, and evaluator at once
- `Option B` maximizes naturalness, but will likely create too much sprawl without a strong conductor
- `Option C` creates the cleanest separation of concerns without losing too much controllability

Tactical implementation note:
- for MVP, prefer a hidden room orchestrator plus speaking actor agents, rather than making the facilitator own all orchestration directly
- the primary implementation challenge is shared room-state design, not whether routing exists at all

## Suggested Agent Responsibilities

### 1. Actor Agent
Each stakeholder actor should optimize for:
- sounding like a person
- reacting naturally
- asking questions at phase-appropriate depth
- occasionally offering tentative options or partial ideas

Actor agents should not optimize for:
- scoring
- explicit failure-mode detection language
- global turn routing
- deciding when the scene should close

### 2. Conductor Agent
The conductor should optimize for:
- keeping one active topic at a time
- preserving overall legibility
- helping the room usually move from `why` to `what` to `how`
- deciding which actor should respond next
- parking early-detail questions when the room is still at overview level

The conductor may speak either:
- as `Mika` in-world
- or as an out-of-band orchestration layer that only occasionally emits `Mika` turns

### 3. Phase / Pressure Layer
This may be:
- folded into the conductor
- or implemented as a separate hidden control layer

Its purpose is to cap question depth by scene phase.

Examples:
- early `Strategic Vision` scene: allow concern, but do not demand final operating ownership
- workshop mode: allow premise alignment and tentative framing before commitment pressure
- first-use shaping: prefer practical examples over abstract governance debate

### 4. Evaluator Agent
The evaluator should run after the live scene.

It should own:
- structural progress interpretation
- draft progress interpretation
- reflection summary

It should not shape the live meeting turn-by-turn.

## Core Design Principle
The most important separation is:

- `persona` = who this person is
- `pressure` = what concern is salient in this scene
- `phase cap` = how deep this scene is allowed to go
- `evaluation` = what the system concludes afterward

If these stay fused inside one live-speaking agent, the runtime tends to produce:
- abstract questions
- premature governance pressure
- reduced voice separation
- evaluator-like stakeholder behavior

## Specific Tradeoff: Per-Actor Agents

### Why Per-Actor Agents Are Attractive
- directly addresses the "everyone sounds the same" complaint
- supports human-like interruptions, short agreements, and uneven reactions
- makes workshop scenes feel more social and less like a single orchestrated interview

### Why Per-Actor Agents Alone Are Insufficient
- does not by itself solve progression quality
- can increase cross-talk and repeated pressure
- can make every actor independently "correct" in an unnatural way
- can amplify failure-model overfitting if each actor still carries too much structural detector logic

### Practical Conclusion
Per-actor agents are not overkill if naturalness is a core goal.
They become overkill only when used without a conductor and phase cap.

## Suggested Minimum Viable Multi-Agent Design
Recommended first implementation slice:

1. Separate stakeholder actor agents
2. Keep `Mika` as conductor-plus-facilitator
3. Keep evaluator fully post-game
4. Keep failure hooks out of actor prompts as much as possible
5. Feed actor agents only:
   - runtime persona slice
   - current topic
   - current scene phase
   - recent local conversation context

Do not feed actor agents:
   - full expected output spec
   - full failure-model catalog
   - broad scoring language
   - unrelated stakeholder internals

## Prompting Guidance

### Actor Prompt Should Emphasize
- voice
- local concern
- reaction style
- phase-appropriate depth
- willingness to ask or suggest, not only judge

### Conductor Prompt Should Emphasize
- turn selection
- topic parking
- abstraction-level control
- rhythm and breath in the meeting
- minimal but timely facilitator intervention

### Evaluator Prompt Should Emphasize
- structural signal interpretation
- phase-aware scoring
- concise reflection output

## Risks
- too much conductor control recreates current traffic-control feel
- too little conductor control makes the room noisy and exhausting
- actor agents may still drift toward abstract pressure if persona prompts remain too failure-model-heavy
- multi-agent orchestration may hide bugs behind "natural variation"

## Validation Questions
- do actors sound more distinct than in the single-agent runtime?
- does the room still keep one active topic most of the time?
- do early workshop turns stay at premise / framing level when appropriate?
- does `Naoki` become more practical without losing his structural function?
- does `Mika` feel like a human facilitator rather than a flow robot?
- does evaluation remain strong even though it is no longer embedded in live turns?

## Adoption Guidance
Start with a hybrid runtime rather than a full freeform actor swarm.

Recommended order:
1. keep current contracts and runtime persona slices
2. split evaluator out first
3. add conductor-mediated per-actor stakeholder generation
4. only then consider whether `Mika` should also be a distinct speaking agent versus a lighter control layer

## Open Questions
- should `Mika` be a full actor agent or a thin voice over a conductor layer?
- should actor agents see only local recent context or the whole meeting transcript?
- where should phase caps live: conductor prompt, scene state, or separate hidden controller?
- how much failure-model visibility should remain in actor prompts, if any?
