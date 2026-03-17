# Enabler Proposal

- intent_id: intent-000
- title: Platform Engineering Failure Model
- owner: shared
- status: draft
- created_at: 2026-03-17
- updated_at: 2026-03-17
- enables:
  - intent-001

## Purpose
Define the failure model that this product treats as a first-class asset so that people and GenAI can evaluate what each feature, UI decision, and implementation step is meant to make visible, playable, or assessable.

## Problem
Without a shared failure model, implementation can drift toward generic roleplay, generic chat evaluation, or ad hoc UX decisions. That makes it difficult to judge whether the product is actually teaching Platform Engineering failure patterns or merely simulating conversation.

## Asset Definition
This enabler defines the product's baseline concept of failure in Platform Engineering. It should become the durable reference for:

- what counts as failure in this repository
- which structural signals matter during simulation
- which judgment dimensions matter during assessment
- how features should justify their contribution

The initial asset boundary is:

- failure is not only outage or delivery delay
- failure includes unsustainable ownership, blurred boundaries, unmanaged dependency load, and platform-team role collapse
- structural drift matters before explicit collapse
- reasonable local decisions can still produce systemic failure

Current working storage for these assets:

- `failure-model/success-criteria/`
- `failure-model/symptoms/`
- `failure-model/failure-modes/`

## Success Criteria
1. Feature, UI, and implementation documents can explicitly point to this asset when explaining their contribution.
2. The repository has a stable definition of structural signals and judgment dimensions to guide future specs.
3. GenAI-assisted development can distinguish foundational failure-model work from user-facing simulation features.

## Scope
- In scope:
  - defining failure as an organizational and structural outcome
  - defining early structural signals worth exposing in simulation
  - defining judgment dimensions for learner assessment
  - acting as a required reference for future intent documents
- Out of scope:
  - a complete taxonomy of all possible Platform Engineering failure cases
  - implementation detail for scoring, storage, or UI rendering
  - domain generalization beyond Platform Engineering

## Operational Use
- How feature proposals should reference this asset:
  - state which part of the failure model the feature makes visible, playable, or assessable
- How UI specs should reference this asset:
  - state which structural signals or judgment dimensions the interaction needs to surface clearly
- How implementation specs should reference this asset:
  - state which part of the failure model the implementation operationalizes and how correctness will be validated

## Change Contract
- Allowed Changes:
  - refine the failure definition, structural signals, and judgment dimensions while preserving the product's Platform Engineering focus
  - add sharper operational guidance for downstream feature and implementation documents
- Forbidden Changes:
  - reducing the asset to a generic simulation rubric detached from Platform Engineering
  - treating this as optional background context instead of a required development reference
- Approval Required:
  - changes that redefine what counts as failure for the product
  - changes that alter the primary learning thesis from failure-first learning to best-practice demonstration
- Validation:
  - downstream intent documents can reference this enabler explicitly
  - the repository structure makes this enabler visible as a first-class asset
- Rollback:
  - revert this document and any registry or template changes that make use of it together

## Open Questions
- [ ] What is the smallest useful set of structural signals for the first simulation?
- [ ] Which judgment dimensions should remain qualitative in v1, and which should be formalized?

## Evidence / References
- `docs/product/vision.md`
- `failure-model/README.md`
- `README.md`
