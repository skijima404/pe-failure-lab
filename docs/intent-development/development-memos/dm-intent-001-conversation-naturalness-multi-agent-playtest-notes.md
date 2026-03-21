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

- 2026-03-21:
  Another test opening used:
  - "tell us, as a draft, what direction this company should aim for"
  This may still over-anchor the first player turn toward presenting a prepared proposal. If the desired feel is less "bring a draft" and more "let's explore the direction together," facilitator openings should avoid explicit `draft` or `tatakidai` framing in the first prompt.

- 2026-03-21:
  Local-runtime testing highlighted a likely multi-agent orchestration constraint: once actor agents are initialized and the runtime begins turn-based coordination, conversation naturalness depends heavily on the turn model itself. In particular, natural meeting-like patterns such as:
  - stakeholder A
  - player
  - stakeholder B piggybacks on the same topic
  - player responds
  should remain allowed when topic continuity is clear and pile-on risk stays low.

- 2026-03-21:
  This suggests the multi-agent implementation will likely need an explicit same-topic overlap rule. Natural overlap should be allowed when:
  - the active topic is unchanged
  - the second stakeholder concern clearly connects to the immediately preceding exchange
  - unresolved concerns do not expand into unplayable parallel threads
  - facilitator intervention is not required for legibility

- 2026-03-21:
  Multi-agent runtime may therefore require turn design that is intentionally optimized for natural conversation rather than a simple alternating actor schedule. The challenge is not just "who speaks next," but whether the next voice is:
  - continuing the same topic naturally
  - piling on in a way that increases player burden too quickly
  - better handled by facilitator parking

- 2026-03-21:
  Evaluator output may still end with an implementation-driving sentence such as "I can turn this into an Intent/Proposal draft next." This is undesirable in the reflection surface. The evaluator should stop at reflection unless the user explicitly asks to continue into artifact creation.

- 2026-03-21:
  Multi-agent evaluation placement remains a core architecture question. A fully remote evaluator is likely to drift toward plausible write-up rather than grounded evaluation unless it receives either:
  - the relevant slice of the failure model
  - raw or structured session evidence
  Preferably both in a curated form.

- 2026-03-21:
  Passing the full failure model and full raw log to a remote evaluator is likely too heavy and too unstable. A more realistic hybrid pattern is:
  1. local evidence extraction
  2. local attachment of relevant failure-model slices or symptom candidates
  3. remote generation of the final reflection report
  This suggests that the real design problem is not "where evaluation lives" but "where evaluation evidence is stabilized."

- 2026-03-21:
  A likely future need is an explicit evaluator input contract, probably a compact evidence packet rather than raw full-context replay. That packet would ideally contain:
  - key turns or structured evidence
  - relevant structural state changes
  - candidate failure symptoms or slices
  - phase-aware scoring context

- 2026-03-21:
  Remote execution can also break the initialization format itself. In the sampled run, the initialization exchange exposed chat-native wrapper behavior such as:
  - "Worked for 1m 10s"
  - general assistant-style setup prose
  - a second assistant-style clarification turn before the actual session start
  This makes the interaction feel less like a simulation contract and more like ordinary chat with a roleplay attached afterward.

- 2026-03-21:
  The issue is not only wording quality. It is a boundary problem between:
  - runtime orchestration
  - initialization contract
  - visible simulation start
  Multi-agent remote mode may need a stricter initialization wrapper so the user sees one clean simulation-facing initialization block rather than intermediate orchestration-flavored turns.

- 2026-03-21:
  A likely requirement for remote mode is:
  - preserve the existing initialization shape
  - suppress chat-native progress or wrapper text from the user-facing simulation transcript
  - avoid re-explaining the setup twice before `Start`

- 2026-03-21:
  During live simulation turns, temporary system-style progress messages may appear between the player's message and the actor response, for example messages equivalent to "generating a response in this direction." This is immersion-breaking. Remote multi-agent mode likely needs a stronger suppression boundary so orchestration or progress text never appears inside the visible simulation dialogue.
