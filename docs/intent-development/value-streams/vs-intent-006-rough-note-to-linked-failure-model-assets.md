# Value Stream

- intent_id: intent-006
- title: Rough Note to Linked Failure Model Assets
- owner: shared
- status: draft
- created_at: 2026-03-17
- updated_at: 2026-03-21
- related_intents:
  - docs/intent-development/intents/in-intent-006-failure-model-authoring-workflow.md
- related_enablers:
  - intent-000
  - intent-005
- related_feature_proposals:
  - intent-006

## Objective
Describe the end-to-end value flow by which rough human notes and conversational refinement become linked `success_criteria`, `symptom`, and `failure_mode` assets that are reusable by people and GenAI.

## Entry Condition
- a human has rough notes, partial examples, or intuition about a failure pattern
- the target `Success Criteria` is known or can be identified during discussion
- repository templates and frontmatter conventions are available

## Value Flow
1. Rough note capture:
   the human states an initial idea in natural language, often incomplete, mixed in abstraction, or written in shorthand.
2. Success criteria anchoring:
   the discussion identifies which `Success Criteria` the note belongs to so the authoring work has a stable destination.
3. Symptom framing:
   the rough note is rewritten into an observable state that can be detected in conversation, decision-making, or organizational behavior.
4. Consequence clarification:
   the downstream effect of leaving the symptom unresolved is made explicit so the symptom has practical meaning.
5. Failure mode extraction:
   recurring judgment patterns, omissions, or assumptions that produce the symptom are separated out as candidate `Failure Mode` nodes.
6. Naming and wording normalization:
   titles, statements, file names, and observable signals are revised so they are short, distinguishable, and readable by GenAI.
7. Frontmatter linking:
   top-down and bottom-up relationships are added using stable ids so `sc`, `rf`, and `fm` assets connect in both traversal directions.
8. Consistency review:
   the set is reviewed for overlap, abstraction drift, weak observability, and broken relation symmetry.
9. Repository asset finalization:
   the resulting files are kept as durable repository assets rather than transient chat outputs, ready for future simulation, evaluation, skill, or script work.

## User Value by Stage
- Rough note capture:
  - a human can start from vague intuition without first producing polished specifications
  - GenAI can engage with partial material rather than waiting for complete definitions
- Success criteria anchoring:
  - the discussion stays connected to a meaningful product asset rather than drifting into isolated notes
- Symptom framing:
  - failure becomes observable and simulation-usable rather than remaining abstract
- Consequence clarification:
  - the symptom gains practical stakes and becomes easier to prioritize
- Failure mode extraction:
  - causes can be explored without collapsing them into the symptom itself
- Naming and wording normalization:
  - the resulting assets become easier for GenAI to retrieve, compare, and extend
- Frontmatter linking:
  - the graph becomes traversable from outcomes to causes and from causes to outcomes
- Consistency review:
  - overlap, ambiguity, and broken links are caught before they spread through the repository
- Repository asset finalization:
  - the output becomes reusable for future feature work, UI work, evaluation logic, and skill development

## Critical Product Bets
- rough conversational material can be converted into durable machine-readable assets without requiring heavyweight authoring tooling
- keeping `Symptom` and `Failure Mode` distinct improves both simulation fidelity and GenAI reuse
- frontmatter relations plus concise statements are enough to support useful graph-like traversal before full automation exists

## Failure Modes in the Value Stream
- rough notes are copied too literally, so symptoms and failure modes stay mixed together
- statements are left too abstract, so the authored assets are hard to detect in simulation-time conversation
- similar nodes are not differentiated enough, so GenAI retrieves the wrong pattern or collapses multiple nodes into one
- frontmatter links are incomplete or asymmetric, so top-down and bottom-up traversal break
- file names, titles, and ids drift apart, so the repository becomes harder to maintain
- authoring stays trapped in chat context and is not converted into durable repository assets

## Required Supporting Assets
- `docs/intent-development/intents/in-intent-006-failure-model-authoring-workflow.md`
- `docs/intent-development/enabler-proposals/ep-intent-000-platform-engineering-failure-model.md`
- `docs/intent-development/enabler-proposals/ep-intent-005-failure-model-authoring-guidance.md`
- `docs/intent-development/feature-proposals/fp-intent-006-genai-assisted-failure-model-authoring-workflow.md`
- `docs/templates/failure-model/README.md`
- `failure-model/README.md`
