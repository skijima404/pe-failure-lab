# MVP Simulation Session Concept

- Product: Platform Engineering Failure Lab
- Status: draft
- Updated: 2026-03-18

## Purpose
Define the first thin playable session concept for the product before locking a stricter simulation contract or implementation detail.

This document captures the intended experience shape, the tension the session should preserve, and the explicit MVP limits.

## Session Goal
Create a short Platform Engineering-specific meeting simulation where apparent progress can coexist with hidden structural deterioration.

The session should make visible:
- blurred boundaries
- rising dependency on the platform team
- weak continuity or sustainability
- drift toward bespoke support or delivery substitution

## Session Shape
- one-scene meeting simulation
- target length: 10-15 minutes
- suitable for first test play and potentially booth/demo use

## Core Scene Definition
The v1 session is positioned around:
- Strategic Vision
- coalition-forming pressure

The primary evaluation center is:

**Strategic Vision under coalition-forming pressure**

The player is in a meeting where they:
- presents the current Strategic Vision
- seeks buy-in from the coalition and/or broader support base
- encounters practical ambiguity and early structural drift under pressure

This is not a pure execution kickoff.

The direction has been articulated enough to be presented, but commitment, interpretation, and sustainable follow-through are not yet secure.

The meeting should feel like:
- the vision is being articulated and concretized
- buy-in is still being formed or tested
- practical ambiguity is already surfacing in the room

The player should be able to enter the scene quickly.

This means:
- the meeting should explain why it is happening now
- the player should not be forced to infer too much hidden backstory
- the opening should make the immediate situation legible without overexplaining

## Meeting Structure
1. Facilitator recap and framing
2. Strategic Vision articulation by the player
3. Stakeholder Q&A and challenge
4. Closing follow-up understanding check
5. Game-end output

For runtime execution, the session should also support:
- a short initialization step before the meeting starts
- an optional lightweight setup question about what prior exchange led to the meeting
- a game-end discussion mode after result output

Runtime phrasing should prefer plain enterprise language such as:
- the direction you are proposing
- what you want this initiative to become
- the direction you want people to align around

Design-internal labels such as `Strategic Vision` may remain in product assets, but should not dominate spoken runtime dialogue.

## Roles
- Change Agent / Player
- Executive
- Platform-side stakeholder
- App-side stakeholder - Legacy
- App-side stakeholder - New
- Facilitator

## Role Interpretation
This is not just a policy explanation meeting.

It is also a buy-in meeting. Stakeholders interpret the vision through their own incentives, risks, and constraints.

For live usability:
- each stakeholder should have a short display name
- stakeholders should be introduced and called on one at a time
- each turn should usually contain one primary question, not a pile of stacked demands

## Facilitator Position
The facilitator is a real meeting facilitator only.

Allowed:
- open the meeting
- recap context
- manage turn-taking
- keep the agenda moving
- surface unresolved items
- ask clarification questions when commitments, ownership, or follow-up are ambiguous
- ask for closing follow-up summaries
- force one clarification at close, but only for ownership ambiguity or next-step ambiguity

Not allowed:
- coach the player
- provide strategic advice
- reinterpret the player's answer into a safer version
- rescue ambiguity
- reveal hidden scoring or state logic

Runtime tone requirement:
- the facilitator should keep the meeting tense but not excessively oppressive
- the meeting should feel demanding, not exhausting
- one stakeholder question at a time is preferred for MVP

## Player Authority Model
Authority is centralized in the player, but followership is not guaranteed.

The player is:
- the primary visible owner of the initiative in the room
- responsible for presenting and clarifying the Strategic Vision
- responsible for shaping the practical engagement model

However:
- durable execution cannot be guaranteed by authority alone
- the platform-side stakeholder is not automatically treated as a secured follower
- sustainable follow-through depends on coalition, not just formal authority

One intended failure shape is that the player behaves as if coalition already exists and makes commitments on that basis even when real followership or sustainable capacity has not been secured.

The player must be explicitly allowed to:
- decline
- defer
- reframe
- route to another owner

## Platform-Side Stakeholder Position
The platform-side stakeholder should be treated as a critical internal coalition member, not merely an assumed follower.

They may be:
- supportive
- cautious
- conditionally aligned
- not yet fully committed

This matters because the player may speak as though sustainable platform capacity already exists even when it has not actually been secured.

## Live Structural States for MVP
Keep the visible model minimal:
- Boundary Clarity
- Dependency Load
- Continuity Risk

## Thin State Change Logic
Boundary Clarity goes down when:
- support scope becomes vague
- ownership is left ambiguous
- exception handling is implied but not defined
- the player speaks as though responsibilities are shared without naming who owns what

Boundary Clarity goes up when:
- support limits are explicit
- ownership is named
- exception conditions are bounded
- exit or handoff is stated clearly

Dependency Load goes up when:
- the platform team is positioned as direct delivery support
- specific teams begin to rely on platform people rather than a bounded model
- bespoke support is normalized or implied

Dependency Load goes down when:
- self-service is reinforced
- support remains bounded
- handoff or reuse paths are protected

Continuity Risk goes up when:
- follow-up depends on heroics or goodwill
- exceptions have no clear stop condition
- next steps depend on future undefined effort
- the player creates expectations without durable coalition or owner commitment

Continuity Risk goes down when:
- next steps are owned
- time boundaries exist
- support mode is bounded
- durable follow-through looks plausible

## Outcome Separation
Meeting outcome and structural outcome must remain separate.

### Meeting Outcome
- Go
- Conditional Go
- No Go

### Structural Outcome
- Stable
- Strained
- Drifting
- Failed

The session should allow for visible apparent success with worsening structural conditions.

Thin interpretation for MVP:

- Stable:
  boundaries held, dependency did not materially increase, and continuity remained supportable
- Strained:
  some ambiguity or extra load emerged, but it remained bounded and recoverable
- Drifting:
  apparent progress happened, but support, ownership, or continuity became structurally unsafe
- Failed:
  the hard failure trigger was crossed

Examples:
- broad verbal alignment with worsening structural states
- participants leave feeling roughly satisfied while holding incompatible expectations
- Conditional Go appears orderly while follow-up understanding is misaligned

## Hard Failure Trigger
A hard failure trajectory is triggered when the player commits the platform team to:
- recurring team-specific support
- delivery substitution
- undefined exception handling

without explicit boundary, owner, and exit condition.

## Closing Mechanic
The facilitator should close with a follow-up understanding check such as:

> Before we close, I'd like to reconfirm the follow-up items. Could each of you briefly summarize what you believe happens next from your perspective?

This is not a broad satisfaction check.

It is specifically about whether each stakeholder's understanding is:
- Aligned
- Partially aligned
- Misaligned

## Minimal Follow-Up Object
The simulation will likely need a minimal internal follow-up structure:
- action
- owner
- timing
- support_mode
- scope

Scope is necessary to judge boundary drift.

## MVP Game-End Output
At minimum, show:
- meeting outcome
- structural outcome
- live state summary
  - Boundary Clarity
  - Dependency Load
  - Continuity Risk
- stakeholder follow-up understanding check
  - Aligned / Partially aligned / Misaligned

No deep causal mismatch analysis is required yet.

## Explicit MVP Non-Goals
Do not add yet:
- detailed misunderstanding analysis
- fine-grained explanation of wording differences
- hidden coaching behavior from the facilitator
- multi-scene story expansion
- a broad platform simulation framework
- a large scoring framework before the contract is stable

## Immediate Next Step
Turn this concept into a compact MVP Simulation Contract before deeper persona writing.

## Related Context
- `docs/product/concepts/enterprise-context-card-v1.md`
