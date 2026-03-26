# Dev Chat Report

- report_type: dev-chat-share
- owner: shared
- status: draft
- created_at: 2026-03-26
- updated_at: 2026-03-26
- related_memo:
  - docs/intent-development/development-memos/dm-20260326-playable-repo-deployment-direction.md

## Decision Summary
- decision: split authoring and playable repositories
- reason: natural roleplay quality is easier to preserve in a thin playable repository than in the rich authoring repository

## Repository Split
- authoring_repo_role: `pe-failure-lab` remains the only authoring source for traceability, design assets, Failure Model source, evaluator logic, and runtime experimentation
- playable_repo_role: `playable-pe-failure-lab` becomes a deployment target for thin play assets and demo/tuning runs
- editing_rule: do not hand-edit the playable repo; changes should originate in the authoring repo and be deployed

## Minimal Deploy Asset Set
- asset: thin scenario initialization
- asset: thin stakeholder personas
- asset: facilitator flow
- asset: player initialization
- asset: minimal play runtime config
- asset: only the smallest roleplay-facing assets required for execution

## Keep In Authoring Repo
- asset: intent / proposal / traceability docs
- asset: development memos
- asset: archive assets
- asset: Failure Model source assets
- asset: richer evaluation logic and experiments

## Failure Model Direction
- role_in_roleplay: not required by default
- role_in_evaluation: primary use
- role_in_explainer: allowed and recommended for demo/explainer experiences

## Immediate Next Step
- step: define the first deploy asset list for the playable repo
- step: prepare a simple export/deploy procedure and start tuning there

## Risks To Watch
- risk: drift between authoring and playable repos if hand edits happen in the playable repo
- risk: deploying too much context and recreating the same naturalness problems
