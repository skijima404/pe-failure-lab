# Development Memo

- memo_id: dm-20260324-naturalness-vs-evaluation-and-reduction-first
- title: Naturalness vs Evaluation Strictness and Reduction-First Runtime Direction
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
Record the working direction for recovering older natural conversation quality while keeping evaluation stricter and supporting more actors.

## Observed Tension
The repository is trying to achieve all of the following at once:
- natural live conversation
- stricter evaluation quality
- more actor personas
- local-first runtime stability

The recent playtest and comparison against older GPT-4o-era behavior suggest that the current runtime degrades when it tries to solve these goals by adding more code-level steering.

Primary suspected barriers:
- repository context available to the runtime is too broad
- too much visible turn behavior is controlled in code
- actor realization still carries too much phrase and routing control

## Desired Product Shape
The target direction is:
- natural conversation quality closer to the older enterprise-architecture roleplay behavior
- stricter evaluation than the older version
- more available personas without mandatory equal participation

This implies:
- naturalness should come from less control, not more
- evaluation severity should come from evaluator evidence reading, not from heavier actor phrasing
- actor count should increase by enabling conditional entry, not by forcing all actors to speak

## Behaviors To Recover
The production runtime should better support:
- content-first answering
- topic-led progression
- capability-based speaker switching
- conditional actor entry
- progressive deepening
- explicit unknown surfacing
- negotiated next-step formation without forced agreement

## Evaluation Direction
The evaluator should become stricter in ways that do not make live speech more artificial.

Preferred direction:
- require clearer transcript evidence for strong scores
- tolerate natural but weak conversations receiving poor evaluation
- avoid rewarding cooperative tone when concrete decision, evidence, or risk handling is absent
- preserve separation between conversation quality and evaluation quality

## Reduction-First Direction
The next naturalness improvements should default to subtraction before addition.

Preferred subtraction targets:
- fixed phrase inventories in stakeholder rendering
- over-detailed runtime persona payloads
- routing rules that over-attach to the current actor
- runtime logic that forces evaluator semantics into visible speech
- broad repository-context loading that exceeds the needs of the current exchange

Avoid by default:
- adding more template branches
- adding more phrase menus
- compensating for poor naturalness by increasing runtime control logic

## Implementation Implication
Before adding new runtime machinery, ask:
1. Can this be improved by removing prompt weight or phrase inventory?
2. Can this be improved by reducing actor stickiness?
3. Can this be improved by moving severity into evaluation instead of speech?
4. Can this be improved by narrowing the live runtime context rather than enriching it?

If the answer is yes, prefer that reduction-first path.
