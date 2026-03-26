# Development Memo

- memo_id: dm-20260326-playable-repo-deployment-direction
- title: Playable Repo Deployment Direction
- owner: shared
- status: draft
- created_at: 2026-03-26
- updated_at: 2026-03-26
- related_intent:
  - docs/intent-development/intents/in-intent-001-simulation-core-loop.md
- related_feature_proposal:
  - docs/intent-development/feature-proposals/fp-intent-001-platform-engineering-failure-simulation-core-loop.md
- related_runtime_specs:
  - docs/intent-development/implementation-specs/is-intent-001-local-first-live-actor-generation.md
  - docs/intent-development/implementation-specs/is-intent-001-runtime-module-structure.md
- related_development_memos:
  - docs/intent-development/development-memos/dm-20260324-naturalness-vs-evaluation-and-reduction-first.md
  - docs/intent-development/development-memos/dm-20260325-narrow-read-surface-experiment.md

## Purpose
Record the preferred split between the authoring repository and a future playable repository used for demo and tuning runs.

## Decision
Preferred direction:
- keep `pe-failure-lab` as the only authoring source
- deploy a thin play pack into a separate playable repository
- treat the playable repository as a deployment target, not as an editing surface

Named split:
- authoring repository: `pe-failure-lab`
- playable repository: `playable-pe-failure-lab`

## Repository Roles
### Authoring Repository
The authoring repository keeps:
- traceability documents
- design and proposal assets
- Failure Model source assets
- evaluator logic and richer evaluation inputs
- runtime experimentation and development history

### Playable Repository
The playable repository should contain only what is directly needed for play and tuning.

Expected contents:
- thin scenario pack
- thin stakeholder persona pack
- facilitator flow
- player initialization
- play runtime configuration
- the smallest runtime code and assets required for roleplay execution

The playable repository should not become a second authoring location.

## Operating Rule
- changes are authored only in `pe-failure-lab`
- the playable repository is updated only by deploy or export steps
- manual edits in the playable repository are discouraged and should be treated as drift risk
- if manual edits happen in the playable repository, treat that as deployment drift and reconcile from the authoring repository

## Tuning Environment Direction
The first tuning environment does not need full automation.

Recommended first step:
1. define the minimal deploy asset set
2. perform a manual or script-assisted export into the playable repository
3. run play and tuning experiments there
4. feed findings back into the authoring repository

This is sufficient to validate the split before building a more formal deployment pipeline.

## Minimal Deploy Asset Set
Initial deploy target should prefer:
- playable scenario initialization
- facilitator flow
- thin persona definitions
- player-facing initialization text
- runtime configuration used by play mode

First deploy asset list:
- scenario initialization source:
  - `docs/product/concepts/runtime/mvp-scene-setup.md`
- player initialization source:
  - `docs/product/concepts/runtime/mvp-player-initialization.md`
- facilitator runtime persona source:
  - `docs/product/personas/runtime/facilitator-runtime.md`
- stakeholder runtime persona sources:
  - `docs/product/personas/runtime/executive-stakeholder-runtime.md`
  - `docs/product/personas/runtime/platform-side-stakeholder-runtime.md`
  - `docs/product/personas/runtime/new-product-tech-lead-runtime.md`
  - optional legacy stakeholder if the playable scenario needs it:
    - `docs/product/personas/runtime/legacy-app-side-stakeholder-runtime.md`
- play runtime configuration and thin runtime code:
  - `runtime/scene/`
  - `runtime/personas/`
  - `runtime/execution/`
  - `runtime/orchestration/`
  - `runtime/state/`
  - `runtime/agents/actor/`
  - `runtime/agents/facilitator/`
  - `runtime/presentation/`
  - `runtime/transcripts/`
  - `scripts/production/`

Only include the minimum subset actually required by the playable runtime entrypoint.

Do not deploy by default:
- broad development memos
- intent and proposal documents
- archive folders
- raw Failure Model source assets unless a specific evaluation experiment requires them
- richer evaluator experiments and runtime validation fixtures
- `runtime/verification/`

## Failure Model Direction
Default role of Failure Model in this split:
- keep as authoring-source asset
- use primarily in evaluation, reflection, and explainer paths
- do not require direct loading in playable roleplay by default

## Immediate Next Step
Build the first tuning environment by preparing:
- a deploy asset list
- a simple export/deploy procedure
- a dev-chat report so implementation sessions can align on the split

## Simple Export/Deploy Procedure
Recommended first procedure:
1. define the playable entrypoint and the exact runtime modules it requires
2. copy or sync only the approved thin asset set from `pe-failure-lab`
3. generate a deploy manifest that records:
   - source repository
   - source paths
   - deploy timestamp
   - target repository
4. run demo or tuning sessions only in `playable-pe-failure-lab`
5. feed all findings, fixes, and tuning decisions back into `pe-failure-lab`
6. redeploy instead of hand-editing the playable repository

This procedure is intentionally simple. It is meant to validate the repository split before introducing a more formal export tool.
