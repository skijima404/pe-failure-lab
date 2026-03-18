# Platform Engineering Failure Lab

Roleplay-based simulation and assessment lab for exploring failure patterns in Platform Engineering.

## Vision
- `docs/product/vision.md`: repo-level epic hypothesis and long-term direction
- `AGENTS.md`: repository operating guidance for AI-native collaboration

## Core Layout
- `failure-model`: graph-shaped knowledge assets for success criteria, symptoms, failure modes, and cross-cutting principles
- `docs/intent-development`: intent-driven development documents with traceability from intent to implementation
- `docs/operations`: operating rules, quality gates, and repo policies
- `docs/decisions`: architecture and product decisions

## Intent Traceability
This repository uses an intent-driven development flow:

1. Define product intent in a Feature Proposal.
2. Link the intent in `docs/intent-development/intent-registry.md`.
3. Specify learner and observer behavior in a User Interaction Spec.
4. Add an Implementation Spec when scope becomes concrete.
5. Keep traceability between vision, intent, interaction, and implementation explicit.

## Current Focus
- make Platform Engineering failure patterns visible, playable, and discussable
- design simulation flows before committing to implementation detail
- preserve traceability from product vision to scenario and interaction design

## Failure Model
- `failure-model/` is a first-class product asset, not supporting documentation
- the current model is graph-shaped and organized around `success-criteria`, `symptoms`, `failure-modes`, and `cross-cutting-principles`
- the current primary lens is escaping Level 1 patterns in the CNCF Platform Engineering Maturity Model, especially the `Provisional` stage
- in this repository, `failure` most often means remaining trapped in reactive, weakly productized, weakly adopted, weakly measured, and weakly sustained Platform Engineering patterns

## Development Model
- `docs/product/vision.md` defines why the product exists.
- `docs/product/expected-outputs/` defines what the product should return at key moments such as game end.
- `docs/intent-development/enabler-proposals/` defines foundational assets that implementation must serve.
- `docs/intent-development/feature-proposals/` defines user-facing capabilities built on those enablers.
- `docs/intent-development/ui-specs/` and `docs/intent-development/implementation-specs/` must reference the enablers they depend on.
- `failure-model/` defines what success, symptom emergence, and failure causality mean for the simulation itself.
