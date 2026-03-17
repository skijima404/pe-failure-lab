# Intent-Driven Development Space

Purpose: keep product intent, learner interaction design, and implementation scope durable, linkable, and traceable.

## Structure
- `intent-registry.md`: canonical index of each intent and document status.
- `enabler-proposals/`: foundational proposals that define durable assets required by multiple features.
- `feature-proposals/`: problem and intent level proposals.
- `ui-specs/`: learner and observer interaction specs linked to proposals.
- `value-streams/`: end-to-end experience flows that connect enablers, features, and learning outcomes.
- `lifecycle-specs/`: lifecycle definitions for simulation scenarios and learning loops.
- `implementation-specs/`: implementation-level MVP structures, schemas, and execution plans.
- `output-briefs/`: demo, workshop, booth, and training output context docs.

## Workflow
1. Create an Enabler Proposal in `enabler-proposals/` when a durable product asset must exist before or across features.
2. Register each enabler or feature in `intent-registry.md` with a stable `intent_id` and `proposal_type`.
3. Create a Feature Proposal in `feature-proposals/` and link any required enablers.
4. Create a UI spec in `ui-specs/` and link both the feature and its required enablers.
5. Create an Implementation Spec when execution scope becomes concrete, and declare which enablers it depends on.
6. Keep `stage`, `status`, and `updated_at` current as implementation progresses.

## Development Gate
- New development work should not proceed unless it is linked to an Intent and Proposal in this space.
- This applies to new product behavior, durable assets, workflows, repository rules, skills, scripts, and validation helpers.
- If work does not fit an existing Enabler Proposal or Feature Proposal, create or update the relevant intent documents first.
- Small maintenance changes may proceed without a new proposal when they only clarify or repair existing scoped work. Examples include typo fixes, wording cleanup, link repair, file renames, and frontmatter correction.

## Skill Placement
- Unless explicitly requested otherwise, new skills should be created inside the repository so they remain visible as project assets.
- Repository-local skills should be stored under `skills/`.
- Global installation into `$CODEX_HOME/skills` is reserved for cases where the user explicitly wants cross-repository reuse.

## Traceability Rules
- Enabler Proposals are first-class product assets, not background notes.
- Expected outputs should be defined explicitly when a session or phase has a meaningful deliverable.
- A Feature Proposal should state which enablers it depends on.
- A UI Spec should state which enablers shape its interaction model.
- An Implementation Spec should state which enablers the implementation operationalizes.
- If an enabler changes materially, linked feature, UI, and implementation documents should be reviewed.

## Naming Convention
- Enabler Proposal: `ep-<intent_id>-<slug>.md`
- Feature Proposal: `fp-<intent_id>-<slug>.md`
- UI Spec: `ui-<intent_id>-<slug>.md`
- Value Stream: `vs-<intent_id>-<slug>.md`
- Lifecycle Spec: `lc-<intent_id>-<slug>.md`
- Implementation Spec: `is-<intent_id>-<slug>.md`
- Output Brief: `ob-<intent_id>-<output-slug>.md`
- Intent ID: `intent-###`
