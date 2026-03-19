# MVP Simulation Session Concept

- Product: Platform Engineering Failure Lab
- Status: draft
- Updated: 2026-03-19

## Purpose
Define the first thin playable session concept for the product before locking a stricter simulation contract or implementation detail.

This document captures the intended experience shape, the tension the session should preserve, and the explicit MVP limits.

## Session Goal
Create a short Platform Engineering-specific brainstorming workshop simulation where draft progress can coexist with hidden structural deterioration.

The session should make visible:
- blurred boundaries
- rising dependency on the platform team
- weak continuity or sustainability
- drift toward bespoke support or delivery substitution

## Session Shape
- one-scene brainstorming workshop simulation
- target length: 10-15 minutes
- suitable for first test play and potentially booth/demo use

## Core Scene Definition
The v1 session is positioned around:
- Strategic Vision
- coalition pressure after partial coalition formation

The primary evaluation center is:

**Strategic Vision drafting with a partially formed coalition**

The player is in a workshop where they:
- presents a draft strategic direction
- works with coalition participants to shape that direction into something usable
- encounters practical ambiguity and early structural drift while trying to make the vision concrete

This is not a pure execution kickoff.
It is also not a pure approval gate.

The coalition has formed enough that participants are willing to engage seriously.
However, the shape of the vision, the usable scope, and the sustainable operating model are not yet secure.

The workshop should feel like:
- the vision is being drafted and sharpened with others in the room
- coalition participation already exists at a workable level
- practical ambiguity is already surfacing in the room
- participants are helping pressure-test the direction and generate rough ideas, not only evaluate it

The player should be able to enter the scene quickly.

This means:
- the meeting should explain why it is happening now
- the player should not be forced to infer too much hidden backstory
- the opening should make the immediate situation legible without overexplaining

## Workshop Structure
1. Facilitator recap and framing
2. Draft Strategic Vision framing by the player
3. Stakeholder brainstorming, challenge, and refinement
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
- the draft we are trying to shape together

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
It is not best treated as a review meeting either.

It is a brainstorming-oriented working session where stakeholders interpret, shape, and sometimes loosely propose ideas through their own incentives, risks, and constraints.

For live usability:
- each stakeholder should have a short display name
- stakeholders should be introduced clearly, but the discussion does not need to stay in rigid round-robin order
- each turn should usually contain one primary question, not a pile of stacked demands

## Workshop Mode Assumption
For MVP naturalness, this scene should usually be treated as:
- a drafting and brainstorming workshop rather than a final approval forum
- a session where participants help expose constraints, boundaries, and design implications
- a meeting where some important items can legitimately be carried into follow-up work

This means the workshop should usually allow:
- provisional wording
- scoped uncertainty
- rough ideas that are not fully correct yet
- explicit placeholders for items to be refined after the meeting
- agreement on next-step shaping work without requiring every success metric or exclusion to be fully finalized in-room

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
- stakeholders should sound like co-authors of a difficult draft, not only judges of a proposal
- stakeholders may occasionally suggest imperfect or partial ideas in their own frame

## Player Authority Model
Authority is centralized in the player, but followership is not guaranteed.

The player is:
- the primary visible owner of the initiative in the room
- responsible for presenting and clarifying the Strategic Vision draft
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
- mark an item for follow-up design rather than finalizing it in the room

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
Draft progress and structural outcome must remain separate.

### Draft Progress
- Fragmented
- Advancing
- Coalescing

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
- the workshop feels productive while follow-up understanding is misaligned
- a productive workshop produces a credible draft, but hidden support assumptions still drift

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

In workshop-oriented runs, the closing check may also confirm:
- what parts of the draft feel usable enough to continue
- what remains intentionally open
- which unresolved items are valid follow-up work rather than meeting failure

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
- draft progress
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
