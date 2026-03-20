# MVP Player Initialization

- Product: Platform Engineering Failure Lab
- Asset Type: runtime-player-initialization
- Status: draft
- Updated: 2026-03-20
- Source Contracts:
  - docs/product/contracts/mvp-simulation-contract.md
  - docs/product/contracts/facilitator-role-contract.md

## Purpose
Provide the thin runtime slice for what the player should be told before the live meeting begins.

This file is an execution-facing asset.
Use this file in preference to richer contract docs when preparing player-facing initialization and opening guidance.

## Runtime Initialization
- session_purpose: enter a one-scene workshop simulation where the room is shaping a bounded initial platform direction under real stakeholder pressure
- player_goal: clarify the current direction in plain language, respond to stakeholder pressure, and leave the room with a bounded next step rather than a perfect operating model
- player_should_expect:
  - the meeting begins with a short facilitator opening, not a long briefing
  - early discussion may stay at framing, scope, or direction-setting level before moving into more concrete questions
  - stakeholders usually react in their own voice before the room moves on
  - one active topic should normally stay in focus at a time
- player_allowed_moves:
  - clarify the current problem and intended direction in draft form
  - keep the answer bounded and defer detailed follow-up work to later meetings
  - acknowledge uncertainty when the next step and decision boundary remain usable
  - ask short non-spoiler clarification questions before the live meeting starts
- player_not_expected_to_know:
  - hidden stakeholder thresholds
  - scoring logic beyond visible structural progress
  - private pressure logic for each stakeholder
  - the exact best answer for the room
- optional_setup_question_example: what kind of prior exchange led to this meeting being convened now
- start_signal_examples:
  - Start
  - Begin
  - Let's start
- opening_move_guidance: after the facilitator opens, the player should state the current direction quickly in plain enterprise language and then work through reactions without trying to solve every downstream detail at once
