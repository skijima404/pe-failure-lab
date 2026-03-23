# Platform Engineering Failure Lab

Roleplay-based simulation and assessment lab for exploring failure patterns in Platform Engineering.

## Quick Start
Use the repository root as the simulation execution entry point.

Current runtime stance:
- the live simulation runtime is `local-first`
- remote OpenAI-backed modes are optional playtest and validation modes
- visible Codex child sessions are operator tooling, not simulation actors

1. Read the initialization brief:

```bash
npm run simulate:init
```

2. Run the mock-backed MVP session driver:

```bash
npm run simulate:local
```

For human-in-the-loop local play:

```bash
npm run simulate:local:interactive -- --language=ja
```

3. Run an OpenAI-backed mode only when you intentionally want remote generation:

```bash
cp .env.example .env
npm run simulate:remote:smoke
```

OpenAI-backed execution reads the repository-root `.env` file and expects:
- `OPENAI_API_KEY`
- `OPENAI_MODEL` (optional)
- `OPENAI_REASONING_EFFORT` (optional)
- `OPENAI_REMOTE_MULTI_AGENT` (optional, enables per-speaker remote response chains)

For playtest notes, use:
- `docs/templates/playtest/runtime-playtest-note-template.md`

## Simulation Entry
Use the repository root as a valid entry point for running the MVP simulation, not only for development.

If an AI agent is asked to run or test-play the simulation from the repository root, it should treat the following artifacts as the primary execution bundle:
- `docs/product/concepts/enterprise-context-card.md`
- `docs/product/concepts/mvp-simulation-session-concept.md`
- `docs/product/contracts/mvp-simulation-contract.md`
- `docs/product/contracts/facilitator-role-contract.md`
- `docs/product/personas/executive-stakeholder.md`
- `docs/product/personas/platform-side-stakeholder.md`
- `docs/product/personas/legacy-app-side-stakeholder.md`
- `docs/product/personas/new-product-tech-lead.md`
- `failure-model/`

For MVP test play, the root-level default interpretation should be:
- this repository is both a simulation-design workspace and a simulation-running workspace
- if the user asks to run, test-play, or simulate, prioritize session execution behavior over development-planning behavior
- use the existing contracts and persona assets before proposing broader redesign

Suggested root-level execution flow:
1. Read the MVP simulation contract and enterprise context.
2. Load the persona cards and facilitator contract.
3. Start in initialization mode.
4. Wait for explicit start.
5. Run the meeting simulation.
6. Produce game-end output and enter post-game discussion mode

Execution note:
- prefer the local-first flow when checking runtime structure, prompt boundaries, or orchestration behavior
- use remote-backed modes when validating optional actor-generation behavior, not as the default mental model for the runtime

## Vision
- `docs/product/vision.md`: repo-level epic hypothesis and long-term direction
- `docs/product/concepts/mvp-simulation-session-concept.md`: current thin playable session concept
- `docs/product/concepts/enterprise-context-card.md`: fixed enterprise context for the first playable version
- `docs/product/contracts/facilitator-role-contract.md`: meeting-operator contract for the facilitator role
- `docs/product/contracts/mvp-simulation-contract.md`: thin playable session contract
- `docs/product/personas/executive-stakeholder.md`: first stakeholder persona card
- `docs/product/personas/platform-side-stakeholder.md`: platform realism and boundary-focused stakeholder persona
- `docs/product/personas/legacy-app-side-stakeholder.md`: legacy-system risk and migration-pressure stakeholder persona
- `docs/product/personas/new-product-tech-lead.md`: modern delivery-friction and bespoke-help pressure persona
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
- `docs/intent-development/enabler-proposals/` is the default format for foundational assets and reusable operating foundations that implementation must serve.
- `docs/intent-development/feature-proposals/` defines user-facing capabilities built on those enablers.
- `docs/intent-development/ui-specs/` and `docs/intent-development/implementation-specs/` must reference the enablers they depend on.
- `docs/decisions/` stores ADRs for major architecture changes, especially when failure, repeated evidence, or implementation breakdown explains why the shift happened.
- `failure-model/` defines what success, symptom emergence, and failure causality mean for the simulation itself.

Recent architecture decision:
- `docs/decisions/adr-20260321-local-first-runtime-and-multi-agent-scope.md`: live runtime is local-first, while stronger multi-agent separation is better reserved for higher-independence subsystems such as scenario generation or failure pattern matching
