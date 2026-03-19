# Implementation Spec

- intent_id: intent-001
- title: Conversation Naturalness Runtime Behavior
- owner: shared
- status: draft
- created_at: 2026-03-19
- updated_at: 2026-03-19
- related_feature_proposal: docs/intent-development/feature-proposals/fp-intent-001-platform-engineering-failure-simulation-core-loop.md
- related_ui_spec: docs/intent-development/ui-specs/ui-intent-001-simulation-session-flow.md
- depends_on_enablers:
  - intent-000

## Enabler Alignment
This implementation spec operationalizes the failure-model-driven simulation loop by making runtime conversation behavior more believable without weakening structural failure visibility.

It preserves the existing product direction:
- stakeholder pressure remains central
- structural drift remains observable
- role differences remain meaningful

It narrows how runtime behavior should be shaped so the simulation does not collapse into facilitator-driven traffic control or repetitive interview turns.

## Goal
Define runtime behavior rules that make live simulation dialogue feel like a plausible enterprise meeting rather than a scripted Q&A sequence.

This includes runs where the scene works better as a brainstorming workshop than as a hard-approval meeting.

## Problem Statement
Current product assets already describe natural conversation as a priority, but the combined effect of:
- explicit staged meeting structure
- facilitator-led turn routing
- highly detailed persona pressure lists

creates a likely runtime failure mode:
- the facilitator becomes a traffic controller
- stakeholder order feels pre-routed
- different stakeholders sound too similar in interaction style
- participants sound too optimized for conclusion and evaluation rather than understanding

## Scope
- In scope:
  - facilitator intervention rules for live runtime
  - stakeholder turn-transition rules
  - active-topic management rules
  - persona compression guidance for runtime prompting
  - voice and cadence differentiation guidance
  - brainstorming-mode handling for provisional ideas and follow-up shaping work
  - naturalness-focused validation checks
- Out of scope:
  - broader scenario redesign beyond intent-001
  - new scoring systems
  - multi-scene expansion
  - replacing the existing failure model

## Runtime Behavior Contract
### Priority Order
When runtime naturalness and orderly progression are in tension, use this priority order:
1. Preserve a believable active exchange.
2. Preserve role-specific perspective and voice difference.
3. Preserve structural legibility.
4. Preserve neat round-robin participation.

Round-robin fairness is not the primary runtime goal.

### Facilitator Runtime Role
The facilitator should operate by exception, not as the default bridge between every speaker.

Default behavior:
- open the meeting
- provide minimal framing
- allow the active exchange to continue without immediate intervention
- step in only when turn ownership becomes unclear, pile-on begins, or the topic drifts

The facilitator should usually not:
- route every follow-up turn
- summarize after every answer
- announce the next speaker before the current concern has played out
- restate a stakeholder's concern when that stakeholder can react directly

Target feel:
- a competent meeting operator
- mostly quiet while the room is working
- visible only when structure needs protection

### Turn-Transition Rule
The next speaker should usually be determined by the active concern, not by a fixed stakeholder order.

Preferred transition patterns:
- stakeholder -> player -> same stakeholder follow-up
- stakeholder -> player -> another stakeholder reacts because the answer created overlap with their concern
- stakeholder -> stakeholder short handoff -> player response

Avoid as the default pattern:
- facilitator -> stakeholder -> player -> facilitator -> next stakeholder

### Active Topic Management
Naturalness does not require multiple open threads at once.
For chat playability, runtime should usually keep the room focused on one active topic.

Preferred behavior:
- one turn advances one main topic
- closely related follow-ups stay within that topic
- newly surfaced topics are acknowledged briefly and parked
- explicit topic switching happens only after the current topic has reached a usable stopping point

Avoid:
- opening a second or third full topic before the first has landed
- stacking valid but separate concerns into one response burden
- letting "brainstorming" become uncontrolled branching

### Stakeholder Response Shape
Stakeholders should not jump directly to fully formed analytical pressure every time.

Preferred runtime sequence when new information appears:
1. recognition, surprise, concern, relief, or curiosity
2. short interpretation in the stakeholder's own frame
3. one rough idea, question, or condition

This keeps the conversation from sounding like stacked oral-exam prompts.

### Conversation Tempo
The room should not sound like everyone is trying to close immediately.

Runtime signals of healthier tempo:
- people check understanding before escalating
- partial agreement is spoken before conditions are added
- stakeholders sometimes acknowledge what did help, not only what is missing
- questions may be exploratory before they become evaluative

Unhealthy tempo signals to avoid:
- immediate conclusion-seeking after each answer
- every turn ending in a decision test
- repeated demand for enterprise-complete clarity inside an early buy-in meeting

### Brainstorming-Oriented Scene Handling
When the topic is difficult to reason about without visible artifacts, runtime should be allowed to treat the scene as a brainstorming workshop rather than a final commitment gate.

In that mode:
- stakeholders may help shape the draft instead of only evaluating it
- stakeholders may contribute rough, partial, or slightly mistaken ideas in their own frame
- missing detail does not automatically mean failure
- "to be refined and documented after this meeting" can be a legitimate intermediate state
- the player may succeed by bounding open items and assigning next-step design work, not only by finalizing everything in-room
- clean verdict language should be used sparingly

This is especially important when the scene involves:
- scope boundaries
- ownership splits
- target and non-target cases
- success metrics
- architecture or platform framing that would normally rely on a one-page brief, diagram, or visible card

## Persona Runtime Compression Guidance
Persona source assets may remain detailed, but runtime prompting should use a compressed representation.

For each stakeholder, runtime behavior should be derived from:
- core concern
- typical misunderstanding or bias
- trigger for escalation
- cooperation condition
- voice cues

Runtime prompting should avoid loading long question inventories or exhaustive reasoning lists as direct speaking instructions.

### Voice Differentiation Requirement
Stakeholders must differ not only by topic, but by how they speak.

Minimum runtime differentiation dimensions:
- abstraction level
- sentence length
- patience
- willingness to show uncertainty
- whether they start with reaction, condition, or question

Examples of intended contrast:
- Executive:
  starts broad, translates into business meaning, asks for practical scale
- Platform-side stakeholder:
  reacts to operating-model implications, notices boundary and sustainability risk early
- Legacy app-side stakeholder:
  grounds concerns in concrete system risk and transition safety
- New product tech lead:
  reacts through delivery friction, usability, and immediate practicality

## Change Contract
- Allowed Changes:
  - refine runtime contracts and persona usage guidance under intent-001
  - reduce over-specification that causes repetitive or over-routed conversation
  - update linked product contracts and persona assets to align with this runtime behavior
- Forbidden Changes:
  - removing stakeholder pressure as a core learning mechanism
  - flattening role differences into generic difficult-conversation behavior
  - turning the session into freeform chat without structural evaluation
- Approval Required:
  - changes that alter the simulation's primary evaluation center or replace the facilitator role entirely
- Validation:
  - runtime guidance remains traceable to intent-001 and intent-000
  - linked contracts and persona assets preserve structural failure visibility while improving natural dialogue behavior
  - facilitator behavior is explicitly defined as intervention-by-exception
- Rollback:
  - revert this spec together with linked intent-001 edits if the naturalness direction is rejected

## Execution Notes
- Files allowed to touch:
  - docs/product/contracts/mvp-simulation-contract-v1.md
  - docs/product/contracts/facilitator-role-contract-v1.md
  - docs/product/personas/*.md
  - docs/intent-development/ui-specs/ui-intent-001-simulation-session-flow.md
  - docs/intent-development/feature-proposals/fp-intent-001-platform-engineering-failure-simulation-core-loop.md
- Files explicitly out of scope:
  - failure-model/*
  - unrelated intent documents
- Risks:
  - reducing persona detail too aggressively could weaken domain specificity
  - preserving too much existing turn-order language could neutralize the naturalness changes

## Implementation Outline
1. Reframe facilitator behavior from explicit traffic control to exception-based intervention.
2. Reframe turn progression around active concern instead of fixed stakeholder sequencing.
3. Compress runtime persona usage so each stakeholder keeps distinct voice, bias, and escalation triggers without sounding templated.
4. Align UI and contract language so the experience is not framed primarily as pressure-response turn play.
5. Reduce review-meeting behaviors such as verdict rounds, over-clean closing, and evaluator-like stakeholder turns.

## Verification
1. A sample session transcript should not require facilitator speech between every stakeholder exchange.
2. At least one plausible turn chain should allow direct stakeholder follow-up or short stakeholder-to-stakeholder handoff without losing clarity.
3. Stakeholders should be distinguishable by voice and interaction rhythm even before their topic content becomes explicit.
4. A session should still make scope, dependency, and continuity drift observable without relying on oppressive tone.
5. A brainstorming-oriented run should allow valid provisional outcomes without treating every unresolved item as immediate failure.
6. At least one stakeholder should sometimes contribute a rough or partially mistaken idea without collapsing the scene into scoring logic.
7. The transcript should usually carry only one active topic at a time, with additional topics briefly parked rather than explored in parallel.

## Observation Notes
- 2026-03-19:
  Runtime trials may be over-emphasizing Kubernetes framing. Revisit wording so infrastructure scope remains more neutral unless a specific scenario requires Kubernetes to become salient.
- 2026-03-19:
  Concern-driven turn emergence improves naturalness, but it can also create more simultaneous open threads than the player can realistically handle. In particular, multiple stakeholders may respond with valid follow-up conditions in sequence, producing an interaction that feels believable but operationally hard to manage. Revisit how many active concerns can remain open before facilitator intervention or narrowing is needed.
- 2026-03-19:
  Stakeholders may still be demanding commitment too aggressively, especially around success criteria, measurement shape, and scope exclusions that would plausibly be refined after the meeting rather than finalized inside it. Revisit how often participants should accept "to be refined and documented after this meeting" as a legitimate intermediate state instead of treating missing precision as immediate failure.
- 2026-03-19:
  Some scenarios may be structurally better suited to workshop-style drafting than chat-only approval discussion. Revisit whether the default scene framing for intent-001 should more often assume a partially formed coalition working session, especially when the topic normally depends on a one-page brief or visible scope and ownership artifacts.
- 2026-03-19:
  Initialization language may still be too approval-meeting-oriented. Revisit the session-controller opening so it explicitly frames the scene as a workshop-style alignment and shaping discussion, not only as a meeting where the player must explain and secure support for a direction that already exists.
- 2026-03-19:
  Scenario initialization may be over-anchoring on Kubernetes. Consider letting the player choose whether the current workshop scope is Kubernetes-centered, virtual-server-centered, or mixed before the meeting starts, so the opening context does not prematurely bias the discussion toward Kubernetes-only framing.
- 2026-03-19:
  Even with improved naturalness, turns can still sprawl across multiple subtopics at once. Revisit whether each stakeholder turn should usually stay anchored to one active topic only, especially when the conversation starts mixing platform responsibilities, product ownership, enablement shape, operational ownership, and exception support in a single turn.
- 2026-03-19:
  The scene can still collapse back into review-meeting behavior: structured wrap-up, sequential stakeholder verdicts, and a clean evaluator close. Revisit how often workshop-style runs should include more lateral idea generation, partial misunderstanding, and imperfect participant suggestions before converging. Stakeholders should sometimes contribute rough ideas or slightly wrong proposals in their own frame, not only polished evaluation criteria.
- 2026-03-19:
  Stakeholder phrasing may still be too repetitive across runs, especially in opening acknowledgment lines and transition phrases like "direction is clearer now" or "one thing I want to confirm." Revisit variation rules so the same persona can enter from multiple natural sentence shapes without losing structural function.
- 2026-03-19:
  Some stakeholder questions are still too abstract to answer cleanly in live play. Revisit whether questions should default more often to concrete contrasts, examples, or forced-choice clarifications instead of broad "where is the boundary?" style prompts that place too much formulation burden on the player at once.
- 2026-03-19:
  The platform-side stakeholder may still be coming across too negatively by default. Revisit whether this persona should show more visible conditional curiosity, practical hope, or problem-solving instinct before landing on sustainability concern, so they read less like a default blocker and more like a demanding collaborator.
- 2026-03-19:
  The platform-side stakeholder may also be over-indexing on deep governance and responsibility-boundary interrogation within a single topic. Even when the topic is important, this can stall workshop momentum and reduce the sense of forward movement. Revisit whether this persona should more often pivot from boundary concern into concrete implementation-oriented prompts, examples, or lightweight idea generation so chat play feels more constructive and enjoyable for the player.
- 2026-03-19:
  Stakeholder challenge may be insufficiently phase-aware. In early shaping phases, participants are sometimes demanding final-owner precision, operating responsibility detail, or governance closure that would only be appropriate in a later design or rollout phase. Revisit phase-appropriate question depth so the workshop can stay exploratory when the player is only establishing direction, approach, or team split.
- 2026-03-20:
  In the first few exchanges, stakeholders may be moving too quickly from premise confirmation into "so what exactly are you asking for?" pressure. For workshop-style play, early turns should allow premise alignment and discussion-level clarification without immediately forcing the player into a fully sharpened answer.
- 2026-03-20:
  Workshop-style dialogue may still be slipping into proposal-defense language such as "what exactly are you going to provide?" too early. In brainstorming-oriented runs, some stakeholder prompts should instead invite shared idea generation, lightweight options, or candidate shapes before pushing the player into commitment framing.
