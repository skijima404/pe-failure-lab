# Global Traceability Operating Model Notes

- status: draft
- created_at: 2026-03-21
- updated_at: 2026-03-21
- scope: repository-local memo for possible future global extraction

## Purpose
Capture the current operating model that is emerging in this repository so it can later be stabilized, refactored, and selectively promoted into global rules or provisioning assets.

This note is intentionally lightweight.
It is not yet the final global rule document.

## Current Core Model
The current preferred traceability chain is:

1. `Product Vision`
2. `Value Stream`
3. `Intent`
4. `Feature Proposal`
5. `User Interaction Spec`
6. `Implementation Spec`

Supporting assets such as `Enabler` documents may shape multiple layers in this chain, but they do not replace the chain itself.

## Why This Model Exists
The repository needs a structure that answers:
- what the product is trying to become now
- which value flow is being improved
- what specific change is intended in that flow
- what feature is being proposed
- how the user or operator should experience it
- how it should be implemented

This is optimized for current truth and downstream traceability, not only for decision history.

## Current Truth Principle
The primary source of truth should describe what is true now.

Preferred current-truth assets:
- `Product Vision`
- `Value Stream`
- `Intent`
- `Feature Proposal`
- `User Interaction Spec`
- `Implementation Spec`
- current `Enabler` assets when they define reusable active foundations

`ADR` documents are useful only when preserving why a previous assumption, structure, or operating model was abandoned.
They should not be treated as the primary source of current operating truth.

## ADR Role
When used, an `ADR` should record:
- what previous truth or structure was discarded
- why it was discarded
- what current asset replaced it

This repository currently prefers readable, current-state `Enabler` documents over immutable ADR-heavy operating history.

## Enabler Notes
`Enabler` currently covers multiple kinds of durable foundation.
Possible later refinement:
- introduce `enabler_type`
- or add classification tags

Possible categories:
- `architecture`
- `workflow`
- `authoring`
- `validation`
- `information-model`

This is only a future consideration.
No taxonomy change is required yet.

## Global Promotion Candidates
The following ideas appear likely to generalize beyond this repository:
- repositories should be AI-native by default
- repository-facing durable assets should default to English unless explicitly scoped otherwise
- important logic and operating truth should be preserved as repository assets rather than chat residue
- non-trivial work should be linked into a durable traceability chain
- the default chain should begin with `Product Vision` and `Value Stream`
- mutable current-truth assets should be separated from immutable historical decision records
- production assets, test or validation assets, and requirement or design assets should be separated by default
- mock, fixture, prototype, and validation-only assets should not be promoted into production paths implicitly

## Asset Boundary Rule
Repositories should separate asset classes physically when their intended use is different.

Minimum default distinction:
- production assets
- test or validation assets
- requirement or design assets

Additional classes may be introduced when useful, such as:
- mocks
- fixtures
- prototypes
- generated artifacts

## Why This Matters
When asset classes are mixed together, temporary or validation-only assets can be mistaken for production truth.
This creates risk for both humans and AI agents.

Typical failure mode:
- a mock or validation artifact is created for short-term testing
- later work reuses it in a production path
- the repository no longer makes its intended use legible
- production behavior starts depending on an asset that was never reviewed as production truth

## Boundary Expectations
- intended asset usage should be inferable from directory placement and naming, not only from local context
- test or validation mocks, fixtures, and prototypes should remain outside production paths by default
- if a test or validation asset must be promoted into production use, that promotion should be explicit and reviewed
- requirement and design documents should remain distinguishable from execution-facing production assets

This rule is especially important in AI-native repositories because agents often infer intended use from physical structure before they infer it from deeper local context.

## Not Yet Ready for Global Promotion
The following still need local validation before being promoted:
- exact folder naming such as `docs/intent-development/` versus `docs/traceability/`
- final `Enabler` taxonomy
- whether all repositories need the full chain or only a minimal scaffold
- how strict the gating rule should be for small teams or early-stage repositories

## Likely Future Refactor Direction
If this model remains stable, a later refactor may rename the current traceability area toward something like:
- `docs/traceability/`

Possible later structure:
- `docs/traceability/vision/`
- `docs/traceability/value-streams/`
- `docs/traceability/intents/`
- `docs/traceability/enablers/`
- `docs/traceability/feature-proposals/`
- `docs/traceability/user-interaction-specs/`
- `docs/traceability/implementation-specs/`
- `docs/traceability/registry.md`

That refactor should only happen after the operating model is stable enough that naming churn will not obscure more important work.

## Deferred Improvement Backlog
The following ideas came up as useful next-step refinements for the structure itself.
They are intentionally deferred for now.

### Clarify `Intent`
- define `Intent` more explicitly as the smallest durable statement of intended change in a value stream
- distinguish `Intent` from `Vision`, `Feature Proposal`, `Requirement`, and `User Story`
- keep the current chain, but make the role of `Intent` easier to explain to future readers and agents

### Clarify `User Interaction Spec`
- define why this sits after `Feature Proposal`
- clarify that it may cover not only end-user UI but also operator, maintainer, reviewer, and AI-agent interaction expectations when relevant
- decide how broadly "interaction" should be interpreted in this repository model

### Clarify `Implementation Spec`
- define expected scope more explicitly
- decide whether it should routinely include architecture decisions, interface contracts, verification hooks, observability, rollout constraints, and non-functional expectations

### Add Feedback Loops
- avoid treating the chain as purely one-way
- define how validation, telemetry, runtime observation, and learning can update current truth
- preserve the principle that traceability without correction becomes bureaucracy

### Strengthen the AI-Specific Rationale
- document more explicitly why this model is useful for AI-native development
- capture that AI should not rely on chat residue or immutable history as the primary operating truth
- capture that AI is more stable when current truth is represented in durable repository assets with clear links

### Consider Additional Cross-Cutting Assets
- evaluate whether `Validation` or `Evidence` should become an explicit cross-cutting asset or relation
- evaluate whether `Constraints` should be represented more explicitly across proposal and implementation layers
- evaluate whether `Observability` or `Runtime Learning` should become a first-class part of the operating model
- evaluate whether asset boundary class should become a first-class metadata field in addition to folder separation

### Keep Deferred Until the Model Stabilizes Further
- detailed `Enabler` taxonomy
- strict folder naming commitments
- aggressive global standardization of the full chain
- detailed ADR operating rules

## Related Operating Checks
- `docs/operations/end-of-day-structure-check.md`: lightweight daily check for asset-boundary integrity and traceability-chain integrity
