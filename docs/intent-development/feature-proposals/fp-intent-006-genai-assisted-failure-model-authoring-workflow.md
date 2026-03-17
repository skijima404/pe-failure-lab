# Feature Proposal

- intent_id: intent-006
- title: GenAI-Assisted Failure Model Authoring Workflow
- owner: shared
- status: draft
- created_at: 2026-03-17
- updated_at: 2026-03-17
- related_enablers:
  - intent-000
  - intent-005
- related_ui_spec: TBD

## Intent
Create a repeatable workflow in which people and GenAI can co-author failure-model assets quickly enough for active product development, workshop preparation, and iterative demo refinement.

## Problem
Failure-model authoring currently depends on live conversational alignment and remembered conventions. Without an explicit workflow, the work can become slow, inconsistent, or too dependent on the current chat context, which makes it hard to scale, repeat, or operationalize through a future skill.

## Success Criteria
1. A human and GenAI can move from rough symptom notes to linked `sc/rf/fm` assets without re-deciding the writing model each time.
2. The workflow supports iterative refinement such as rephrasing a symptom, splitting a failure mode, or renaming a file without losing relation integrity.
3. The workflow is specific enough to be encoded later as a reusable `Skill`, script, or validation helper.

## Scope
- In scope:
  - co-authoring workflow for `Success Criteria`, `Symptom`, and `Failure Mode`
  - iterative refinement of titles, statements, observable signals, and frontmatter relations
  - skill-oriented operationalization of failure-model authoring behavior
  - checks for top-down and bottom-up link consistency
- Out of scope:
  - end-user simulation UX
  - full authoring product UI
  - automated scoring or complete ontology management

## Constraints
- Technical:
  - workflow outputs must remain durable repository assets, not chat-only artifacts
- Operational:
  - the workflow should be lightweight enough to use during fast iteration toward demos or talks
- Learning design:
  - authored assets should remain grounded in recognizable Platform Engineering organizational dynamics

## Change Contract
- Allowed Changes:
  - refine workflow steps, prompts, or output conventions to improve speed and consistency
  - add supporting skill, script, or validation artifacts that operationalize this workflow
- Forbidden Changes:
  - reducing the workflow to generic note-taking detached from the failure-model graph
  - optimizing only for authoring speed at the expense of causal clarity or retrieval quality
- Approval Required:
  - changes that remove the requirement to produce repository-backed assets
  - changes that make the workflow independent of the failure-model enablers it relies on
- Validation:
  - a rough idea such as a Japanese symptom note can be turned into linked repository assets with stable ids and relations
  - future skill authoring can cite this proposal as the workflow it is encoding
- Rollback:
  - revert this proposal together with linked registry changes and downstream skill or script work built directly on it

## Open Questions
- [ ] Should the first reusable operationalization be a `Skill`, a validation script, or both?
- [ ] How much automatic checking is necessary before it slows down authoring more than it helps?

## Evidence / References
- `docs/intent-development/enabler-proposals/ep-intent-000-platform-engineering-failure-model.md`
- `docs/intent-development/enabler-proposals/ep-intent-005-failure-model-authoring-guidance.md`
- `docs/templates/failure-model/README.md`
- `failure-model/README.md`

