---
name: failure-model-authoring
description: Use when authoring or revising failure-model assets in this repository, especially when turning rough notes into linked Success Criteria, Symptom, and Failure Mode files with GenAI-readable wording, stable frontmatter links, and repository-consistent naming.
---

# Failure Model Authoring

Use this skill when the task is to create, refine, or review `success_criteria`, `symptom`, or `failure_mode` assets for this repository.

This skill operationalizes:

- `docs/intent-development/enabler-proposals/ep-intent-000-platform-engineering-failure-model.md`
- `docs/intent-development/enabler-proposals/ep-intent-005-failure-model-authoring-guidance.md`
- `docs/intent-development/feature-proposals/fp-intent-006-genai-assisted-failure-model-authoring-workflow.md`
- `docs/intent-development/value-streams/vs-intent-006-rough-note-to-linked-failure-model-assets.md`
- `docs/templates/failure-model/README.md`

## Workflow
1. Anchor the work to a target `Success Criteria`.
2. Convert rough notes into `Symptom` candidates that describe observable failure states.
3. Add `Consequence` so the symptom has practical stakes.
4. Extract `Failure Mode` candidates as recurring judgment patterns, omissions, or assumptions that produce the symptom.
5. Normalize titles, statements, file names, and observable signals for GenAI readability.
6. Add frontmatter links and verify top-down and bottom-up consistency.
7. If the same concern is repeating across multiple steps, decide whether it should instead become a `cross_cutting_principle`.

## Asset Roles
- `Success Criteria`:
  - desired organizational condition
- `Symptom`:
  - observable failure state in conversation, decision-making, or organizational behavior
- `Failure Mode`:
  - recurring judgment pattern, omission, or assumption that produces a symptom
- `Cross-Cutting Principle`:
  - reusable concern that applies across multiple steps and should not be fully re-explained in each local node

Do not collapse `Symptom` and `Failure Mode` into one node unless there is a strong reason.

## Writing Rules
- Keep `Symptom Statement` and `Failure Mode Statement` understandable from the first sentence.
- Prefer one strong first sentence over a long setup.
- Write `Observable Signals` so they can be matched against dialogue, questions, or visible actions.
- Favor nodes that help explain why an effort does or does not continue over time; for this repository, continuity and long-term compounding are first-order concerns, not optional nice-to-haves.
- When the same rationale is recurring across many steps, prefer creating or updating a `cross_cutting_principle` and then keeping step-local nodes focused on the stage-specific failure shape.
- Prefer signals like:
  - `When asked "Why now?", the answer stays future-oriented`
  - `When asked "Why should leadership care?", the answer stays technical`
  - `When asked "Why should I join?", the answer returns to targets or buzzwords`
- Use English by default for repository-facing assets unless the task explicitly requires another language.

## Frontmatter Rules
- Use stable ids such as `sc-001`, `rf-001`, and `fm-001`.
- Use plain YAML lists, not tool-specific link syntax.
- Use these relation names:
  - `threatened_by`
  - `threatens`
  - `triggered_by`
  - `triggers`
  - `leads_to`
  - `leads_from`
- Maintain reciprocal links where the repository expects both directions.

## Naming Rules
- If a title changes materially, update the file name in the same edit.
- Prefer short, distinguishable titles that make the node's role obvious.
- Distinguish nearby nodes by the first sentence, not only by context or notes.

## Review Checklist
- Is the node at the right abstraction level?
- Is the first sentence enough to identify the node?
- Are `Observable Signals` detectable in conversation?
- Are similar nodes distinguishable from each other?
- Are top-down and bottom-up links both present and consistent?
- Does the file remain a durable repository asset rather than a chat residue?
- Is any repeated rationale better represented once as a `cross_cutting_principle`?
