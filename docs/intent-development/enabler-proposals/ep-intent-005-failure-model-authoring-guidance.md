# Enabler Proposal

- intent_id: intent-005
- title: Failure Model Authoring Guidance
- owner: shared
- status: draft
- created_at: 2026-03-17
- updated_at: 2026-03-17
- enables:
  - intent-006

## Purpose
Define the durable authoring guidance needed so that people and GenAI can create, revise, and extend failure-model assets with consistent structure, readable causality, and reusable repository conventions.

## Problem
Without explicit authoring guidance, failure-model work can drift into inconsistent abstraction levels, unstable naming, broken frontmatter links, and prose that is difficult for GenAI to retrieve or apply during simulation design and evaluation work.

## Asset Definition
This enabler defines the repository's working rules for authoring `success_criteria`, `symptom`, and `failure_mode` assets.

It should become the durable reference for:

- how `Success Criteria`, `Symptom`, and `Failure Mode` are differentiated
- how frontmatter relationships are expressed for forward and backward traversal
- how titles, statements, and file names should be written
- how observable signals should be phrased for simulation-time detection
- how repository-facing failure-model assets should be revised without losing traceability

The initial asset boundary is:

- `Symptom` describes an observable failure state in conversation, decision-making, or organizational behavior
- `Failure Mode` describes a recurring judgment pattern, omission, or assumption that produces a symptom
- `Statement` sections should make the node understandable from the first sentence
- `Observable Signals` should be written so GenAI can match them against dialogue and actions
- frontmatter relations should stay stable, explicit, and machine-readable

Current working storage for these assets and rules:

- `failure-model/`
- `docs/templates/failure-model/`
- future authoring skill or validation helpers derived from these rules

## Success Criteria
1. New failure-model assets are authored at a consistent abstraction level and remain distinguishable as `sc`, `rf`, or `fm`.
2. GenAI-assisted authoring can extend the failure model without repeatedly redefining naming, linkage, or writing conventions.
3. Future skills, scripts, or validation checks can rely on this guidance as the source of truth for authoring behavior.

## Scope
- In scope:
  - authoring rules for `success_criteria`, `symptom`, and `failure_mode`
  - frontmatter relationship conventions
  - writing guidance for statements, observable signals, and file naming
  - repository conventions needed for future GenAI skills or validation helpers
- Out of scope:
  - complete automation of authoring or validation
  - replacing the failure-model enabler itself
  - generic writing guidance unrelated to failure-model assets

## Operational Use
- How feature proposals should reference this asset:
  - state how the feature depends on stable failure-model authoring rules or reusable failure-model assets
- How UI specs should reference this asset:
  - state which observable signals or node distinctions need to remain legible in the interaction
- How implementation specs should reference this asset:
  - state which authoring rules, relation rules, or validation rules the implementation operationalizes

## Change Contract
- Allowed Changes:
  - refine authoring rules to improve consistency, traceability, or GenAI readability
  - add sharper guidance for writing, naming, linking, or validating failure-model assets
- Forbidden Changes:
  - reintroducing tool-specific link syntax or conventions not needed by this repository
  - allowing authoring rules to drift into undocumented per-document habits
- Approval Required:
  - changes that redefine the distinction between `symptom` and `failure_mode`
  - changes that alter the frontmatter relationship model
- Validation:
  - new assets can be authored without ambiguity about type, relationship naming, or expected writing style
  - future skill or script work can point to this enabler as the operational source of truth
- Rollback:
  - revert this document together with linked registry and downstream proposal changes that depend on it

## Open Questions
- [ ] When should tag taxonomy be formalized more strictly?
- [ ] Should a lightweight validation script be treated as part of this enabler or as a separate implementation asset?

## Evidence / References
- `docs/intent-development/enabler-proposals/ep-intent-000-platform-engineering-failure-model.md`
- `docs/templates/failure-model/README.md`
- `failure-model/README.md`
- `failure-model/success-criteria/sc-001-establish-a-sense-of-urgency.md`

