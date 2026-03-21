# Development Memo - Intent 001 Conversation Naturalness Multi-Agent Playtest Notes

- intent_id: intent-001
- title: Conversation Naturalness Multi-Agent Playtest Notes
- artifact_type: development-memo
- status: working
- created_at: 2026-03-21
- updated_at: 2026-03-21
- related_implementation_spec: docs/intent-development/implementation-specs/is-intent-001-conversation-naturalness-multi-agent-handoff.md

## Purpose
Keep multi-agent-specific playtest observations separate from:
- durable runtime guidance
- single-agent conversation-naturalness notes

This memo is for:
- multi-agent orchestration observations
- actor separation issues
- conductor or facilitator behavior issues specific to multi-agent runs
- prompt-merging or script-shaping artifacts that appear only after multi-agent rollout

This file is not a runtime contract.
It should not be treated as a direct prompting source.

## Observation Notes
- 2026-03-21:
  The facilitator opening in multi-agent runtime may still feel partly scripted or pre-shaped. It does not currently look like a hardcoded line from one source file, but rather like a strong synthesis of existing workshop-opening guidance:
  - explain why the workshop is happening now
  - frame the session as draft shaping
  - move from overview toward specifics
  - ask the player to state the direction and starting point briefly
  This suggests the multi-agent runtime may still be over-merging contract guidance into a polished opening script.

- 2026-03-21:
  A sample opening used wording close to:
  - "today ... how this Platform Engineering effort should take shape in this company"
  - "not to confirm an ideal theory, but to see what axis makes sense here"
  - "please speak briefly about what you want to change and where you want to start"
  This opening is directionally aligned with current assets, but may still place too much answer-formulation burden on the player in the first turn.

- 2026-03-21:
  The opening question may still be slightly too leading:
  - "what do you want to change?"
  - "where do you want to start?"
  For multi-agent runtime, it may be worth checking whether facilitator openings should sometimes invite a lighter first articulation, such as:
  - what problem feels most important here
  - what kind of direction you are trying to explore
  rather than asking for both transformation goal and starting point immediately.

- 2026-03-21:
  Multi-agent orchestration may be preserving contract intent well, but at the cost of making the opening too coherent and too polished. This could indicate that conductor-plus-facilitator synthesis is still dominating actor spontaneity.
