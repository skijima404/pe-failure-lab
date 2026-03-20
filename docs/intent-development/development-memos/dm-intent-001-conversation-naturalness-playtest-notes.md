# Development Memo - Intent 001 Conversation Naturalness Playtest Notes

- intent_id: intent-001
- title: Conversation Naturalness Playtest Notes
- artifact_type: development-memo
- status: working
- created_at: 2026-03-20
- updated_at: 2026-03-20
- related_implementation_spec: docs/intent-development/implementation-specs/is-intent-001-conversation-naturalness-runtime-behavior.md

## Purpose
Keep iterative playtest notes and tuning observations separate from durable implementation assets.

This file is for:
- test-play observations
- runtime tuning notes
- hypotheses to revisit later
- temporary or exploratory findings

This file is not the product contract.
It should not be treated as a direct runtime instruction source.

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
- 2026-03-20:
  The player may be asked for a final closing recap even after the workshop has already reached a usable close. This can make the end of the session feel like an extra test rather than a natural finish.
- 2026-03-20:
  Some opening exchanges still pressure the player too quickly for a sharpened answer. Real meetings often spend the first few turns aligning on premise, scope, or discussion level before requiring a concrete position.
- 2026-03-20:
  The discussion may still zoom into first-service detail too early. For large strategic topics, a more natural order is usually `why -> what -> how`.
- 2026-03-20:
  Actor prompts may be carrying too much failure-model detector logic, especially for the platform-side role. Persona identity, scenario pressure, and failure hooks may need clearer separation.
