# Intent-Driven Development Space

Purpose: keep product intent, learner interaction design, and implementation scope durable, linkable, and traceable.

## Structure
- `intent-registry.md`: canonical index of value streams, intents, and linked delivery assets.
- `value-streams/`: end-to-end value flows that define the primary product or workflow journeys this repository is trying to support.
- `intents/`: durable statements of what should change within a value stream.
- `enabler-proposals/`: foundational proposals that define durable assets required by multiple features.
- `feature-proposals/`: problem and intent level proposals.
- `ui-specs/`: learner and observer interaction specs linked to feature proposals and value streams.
- `lifecycle-specs/`: lifecycle definitions for simulation scenarios and learning loops.
- `implementation-specs/`: implementation-level MVP structures, schemas, and execution plans linked to feature proposals and value streams.
- `output-briefs/`: demo, workshop, booth, and training output context docs.

## Workflow
1. Define or confirm the relevant Value Stream in `value-streams/`.
2. Create an Intent in `intents/` that states what should change within that value stream.
3. Register the Value Stream and Intent in `intent-registry.md` with stable ids and current status.
4. Create an Enabler Proposal in `enabler-proposals/` when a durable product asset must exist before or across intents or features.
5. Create a Feature Proposal in `feature-proposals/` and link the related value stream, intent, and any required enablers.
6. Create a User Interaction Spec in `ui-specs/` when user-facing behavior, operator flow, or interaction quality must become explicit.
7. Create an Implementation Spec when execution scope becomes concrete, and declare the linked value stream, intent, feature proposal, and required enablers.
8. Keep `stage`, `status`, and `updated_at` current as implementation progresses.

## Enabler and ADR Policy
- Enabler Proposals are the default format for foundational assets, operating foundations, and reusable architecture substrate in this repository.
- Prefer an Enabler when the main need is to define a durable foundation that downstream features, UI specs, and implementation specs should depend on.
- Write an ADR in `docs/decisions/` when a major architecture change is triggered by failure, repeated evidence, or a breakdown in the previous approach.
- The ADR should preserve what happened and why the change became necessary.
- When both are needed, use:
  - ADR for the decision event, trigger, and consequences
  - Enabler for the durable foundation that later work should reference

## Development Gate
- New non-trivial development work should not proceed unless it is linked to a Value Stream and Intent in this space, and then to the relevant Feature Proposal, User Interaction Spec, or Implementation Spec as needed.
- This applies to new product behavior, durable assets, workflows, repository rules, skills, scripts, and validation helpers.
- If the required assets do not yet exist, create a minimal scaffold first.
- Small maintenance changes may proceed without a new proposal when they only clarify or repair existing scoped work. Examples include typo fixes, wording cleanup, link repair, file renames, and frontmatter correction.

## Skill Placement
- Unless explicitly requested otherwise, new skills should be created inside the repository so they remain visible as project assets.
- Repository-local skills should be stored under `skills/`.
- Global installation into `$CODEX_HOME/skills` is reserved for cases where the user explicitly wants cross-repository reuse.

## Traceability Rules
- Value Streams are first-class product assets that define the end-to-end value flow the repository is trying to support.
- Intents should state what should change within a specific Value Stream.
- Enabler Proposals are first-class product assets, not background notes.
- ADRs capture major architecture corrections or failure-triggered shifts that should remain historically legible.
- Expected outputs should be defined explicitly when a session or phase has a meaningful deliverable.
- A Feature Proposal should state which value stream and intent it realizes.
- A User Interaction Spec should state which value stream and feature it operationalizes in user-facing behavior.
- A Feature Proposal should state which enablers it depends on.
- A UI Spec should state which enablers shape its interaction model.
- An Implementation Spec should state which value stream, intent, and enablers the implementation operationalizes.
- If an enabler changes materially, linked feature, UI, and implementation documents should be reviewed.

## Naming Convention
- Intent: `in-<intent_id>-<slug>.md`
- Enabler Proposal: `ep-<intent_id>-<slug>.md`
- Feature Proposal: `fp-<intent_id>-<slug>.md`
- UI Spec: `ui-<intent_id>-<slug>.md`
- Value Stream: `vs-<intent_id>-<slug>.md`
- Lifecycle Spec: `lc-<intent_id>-<slug>.md`
- Implementation Spec: `is-<intent_id>-<slug>.md`
- Output Brief: `ob-<intent_id>-<output-slug>.md`
- Intent ID: `intent-###`
