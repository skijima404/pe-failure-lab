# MVP Scene Setup

- Product: Platform Engineering Failure Lab
- Asset Type: runtime-scene-setup
- Status: draft
- Updated: 2026-03-20
- Source Concepts:
  - docs/product/concepts/enterprise-context-card.md
  - docs/product/concepts/mvp-simulation-session-concept.md
  - docs/product/contracts/mvp-simulation-contract.md

## Purpose
Provide the thin runtime slice for MVP meeting setup.

This file is an execution-facing asset.
Use this file in preference to richer concept or contract docs during runtime initialization.

## Runtime Setup
- scenario: `Platform Engineering Failure Lab MVP`
- session_mode: `brainstorming workshop`
- meeting_goal: shape a bounded initial platform direction with visible support and ownership implications
- active_topic_seed: `Initial platform scope`
- facilitator_opening_frame: this workshop is happening now because the room needs a usable first direction, not another abstract platform discussion
- player_start_expectation: the player should clarify the current direction quickly, then work through stakeholder reactions on one active topic at a time
- enterprise_context_summary:
  - large enterprise with strong legacy footprint
  - most delivery is still vendor-heavy and waterfall-oriented
  - cloud VMs are the practical default while Kubernetes is the strategic target
  - commitments made in meetings tend to harden into assumed obligations
  - Platform Engineering is likely to be misread as a central support function
