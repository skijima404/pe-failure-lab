# Development Memo

- memo_id: dm-20260325-narrow-read-surface-experiment
- title: Narrow Read-Surface Experiment
- owner: shared
- status: draft
- created_at: 2026-03-25
- updated_at: 2026-03-25
- related_intent:
  - docs/intent-development/intents/in-intent-001-simulation-core-loop.md
- related_feature_proposal:
  - docs/intent-development/feature-proposals/fp-intent-001-platform-engineering-failure-simulation-core-loop.md
- related_runtime_specs:
  - docs/intent-development/implementation-specs/is-intent-001-local-first-live-actor-generation.md
  - docs/intent-development/implementation-specs/is-intent-001-runtime-module-structure.md
- related_development_memos:
  - docs/intent-development/development-memos/dm-20260324-naturalness-vs-evaluation-and-reduction-first.md
  - docs/intent-development/development-memos/dm-20260324-skill-assessment-style-renderer-replacement.md
- related_principles:
  - docs/principles/runtime-conversation-design-principles.md

## Purpose
Define the next recommended experiment for improving live roleplay naturalness by narrowing what the play runtime is allowed to read.

## Hypothesis
The remaining naturalness problems are not only caused by sentence realization.

They are also likely caused by the live roleplay path reading too much context.

Observed symptoms:
- clarification answers still collapse into concern replay
- topic progression still falls back to actor concern schema
- actor turns still feel repo-informed rather than exchange-local

## Decision
The next experiment should be a narrow read-surface mode for play and demo runtime paths.

This mode should act like a read-policy toggle or allowlist, not as a repository-wide content reduction.

Repository richness should remain available for:
- development
- architecture work
- evaluation
- traceability

But live roleplay should be allowed to read only a narrow subset.

## Proposed Toggle Shape
Example direction:
- `PLAY_NARROW_CONTEXT=true`
- `PLAY_NARROW_CONTEXT=false`

The exact name may change, but the architectural point is:
- a play-oriented runtime mode should be able to restrict its read surface deliberately

## Narrow Read Allowlist
In narrow mode, live roleplay should primarily read:
- thin runtime persona contract
- current scene setup
- player initialization asset if needed
- current speaker id
- last player move
- active topic
- one compact relevant transcript reference
- current stance
- optional bounded session tension

In narrow mode, live roleplay should avoid reading directly from:
- intent and proposal documents
- broad development memos
- evaluator-facing assets
- Failure Model source assets
- CNCF Maturity Model source assets
- archive folders
- broad repository notes not required for the current exchange

## Why This Is Preferred
This experiment preserves:
- current repository richness
- current runtime state model
- current evaluator strictness direction

While testing whether naturalness improves when live roleplay is no longer exposed to broad repository context.

## Comparison Plan
Compare at least two modes against the same style of interactive play:

1. broad context mode
2. narrow read-surface mode

Compare on:
- clarification quality
- actor switching quality
- topic progression quality
- concern replay frequency
- fixed phrase feel
- evaluation quality gap

## Success Signal
The experiment is promising if narrow mode improves any of the following without damaging boundaries:
- more content-first answers
- less concern-schema replay
- more topic-led progression
- fewer facilitator interruptions on answerable questions
- more exchange-local responses

## Failure Signal
The experiment is not sufficient if:
- turns become vague or under-informed
- actor identity collapses
- topic fit becomes weak
- evaluation evidence degrades sharply

In that case, the next step is not broad repo read-back by default, but a better minimal allowlist.
