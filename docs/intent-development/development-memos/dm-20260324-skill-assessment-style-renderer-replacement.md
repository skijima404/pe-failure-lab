# Development Memo

- memo_id: dm-20260324-skill-assessment-style-renderer-replacement
- title: Skill-Assessment-Style Renderer Replacement Direction
- owner: shared
- status: draft
- created_at: 2026-03-24
- updated_at: 2026-03-24
- related_intent:
  - docs/intent-development/intents/in-intent-001-simulation-core-loop.md
- related_feature_proposal:
  - docs/intent-development/feature-proposals/fp-intent-001-platform-engineering-failure-simulation-core-loop.md
- related_runtime_specs:
  - docs/intent-development/implementation-specs/is-intent-001-local-first-live-actor-generation.md
  - docs/intent-development/implementation-specs/is-intent-001-thin-runtime-persona-contract.md
- related_principles:
  - docs/principles/runtime-conversation-design-principles.md

## Purpose
Record the working direction to replace the current stakeholder live renderer with a thinner, more skill-assessment-like realization path.

## Decision
It is acceptable, and currently preferred, to replace the stakeholder-facing live realization path with a skill-assessment-style renderer approach.

This does not mean rebuilding the whole repository.

The preferred scope of replacement is:
- stakeholder visible-turn realization
- actor live prompt shape
- the minimal handoff contract used by stakeholder turn generation

The preferred scope to keep is:
- canonical state
- turn orchestration
- transcript capture
- evaluator path
- production / verification / test boundaries

## Why
Recent playtests suggest that:
- naturalness is still bottlenecked by `runtime/execution/local-live-actor-rendering.ts`
- stakeholder turns still feel selected from coded sentence skeletons
- clarification, topic progression, and role switching all degrade when visible phrasing remains code-led

This implies that further incremental tuning of the current renderer may produce diminishing returns.

## Replacement Direction
The replacement should move from:
- sentence-builder ownership

Toward:
- thin structured handoff ownership

The renderer or successor path should primarily receive:
- who is speaking
- what the player just asked or proposed
- current active topic
- one compact relevant transcript reference
- thin actor contract
- current stance
- selected session tension if any
- answer vs reaction mode

It should not primarily depend on:
- large fixed phrase arrays
- actor-specific lead menus
- actor-specific concern replay menus
- actor-specific closing-question menus

## Design Target
The target is closer to the skill-assessment pattern:
- thin character contract
- thin scene context
- more realization freedom at turn time
- less code ownership over sentence shape

This should still preserve current repository needs that skill-assessment did not emphasize as strongly:
- stricter evaluator behavior
- multi-actor runtime support
- local-first runtime boundaries

## Boundary
This direction is not a justification to:
- move evaluation semantics back into live speech
- make remote API generation the default center
- rebuild state or orchestration without evidence

The replacement should remain a renderer-path reset, not a whole-runtime rewrite.

## Implementation Implication
When deciding between another incremental renderer patch and a renderer replacement, prefer replacement if:
- playtest still reveals phrase-inventory feel
- clarification still collapses into concern replay
- new information still fails to create topic progression
- actor switching works mechanically but not conversationally
