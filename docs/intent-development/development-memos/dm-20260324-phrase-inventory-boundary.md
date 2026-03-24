# Development Memo

- memo_id: dm-20260324-phrase-inventory-boundary
- title: Phrase Inventory Boundary
- owner: shared
- status: draft
- created_at: 2026-03-24
- updated_at: 2026-03-24
- related_runtime_specs:
  - docs/intent-development/implementation-specs/is-intent-001-local-first-live-actor-generation.md
  - docs/intent-development/implementation-specs/is-intent-001-thin-runtime-persona-contract.md
- related_principles:
  - docs/principles/runtime-conversation-design-principles.md

## Purpose
Clarify where fixed phrase inventory is acceptable in the live runtime, and where it becomes harmful to conversation quality.

## Decision
Fixed or near-fixed phrase inventory is acceptable only when the runtime is expressing:
- facilitator repair language
- facilitator traffic-control language
- session-opening or hard-stop boundary language
- other narrow meeting-control utterances where repeated real-world phrasing is expected

Fixed or near-fixed phrase inventory is not acceptable as the primary mechanism for:
- stakeholder concern expression
- stakeholder clarification answers
- stakeholder explanation of tradeoffs
- stakeholder reaction variation across repeated play

## Why
In real meetings, facilitator repair phrases often are formulaic.
Examples:
- asking people to speak one at a time
- resetting the thread
- calling a stop

Those phrases do not meaningfully reduce realism.

By contrast, stakeholder concern expression should vary in:
- what part of the concern is foregrounded
- how directly it is spoken
- whether it is framed as explanation, condition, objection, or question

If actor turns are produced from a closed phrase list, repeated play starts to feel like:
- option selection
- same-actor loop
- concern replay rather than conversation

## Direction
### Facilitator language
Facilitator fixed phrases are allowed when:
- the room needs flow repair
- the room needs a bounded stop
- the room needs a narrow recap

### Actor language
Actor turns should be assembled from:
- current conversational function
- current topic
- recent transcript reference
- thin runtime contract
- temporary stance

They should not mainly be selected from:
- fixed lead arrays
- fixed concern arrays
- fixed question arrays

## Follow-up
The next live-rendering pass should reduce product-path phrase inventory specifically in stakeholder turns while keeping narrow facilitator repair language available.
