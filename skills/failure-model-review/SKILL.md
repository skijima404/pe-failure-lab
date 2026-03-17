---
name: failure-model-review
description: Use when reviewing failure-model assets in this repository for abstraction drift, overlap, GenAI readability, dialogue-detectable observable signals, and top-down or bottom-up frontmatter link consistency across Success Criteria, Symptom, and Failure Mode files.
---

# Failure Model Review

Use this skill when the task is to review existing failure-model assets rather than author them from scratch.

This skill operationalizes:

- `docs/intent-development/enabler-proposals/ep-intent-000-platform-engineering-failure-model.md`
- `docs/intent-development/enabler-proposals/ep-intent-005-failure-model-authoring-guidance.md`
- `docs/intent-development/feature-proposals/fp-intent-006-genai-assisted-failure-model-authoring-workflow.md`
- `docs/intent-development/value-streams/vs-intent-006-rough-note-to-linked-failure-model-assets.md`
- `docs/templates/failure-model/README.md`

## Review Goals
- confirm that each node is at the right abstraction level
- confirm that nearby nodes are distinguishable
- confirm that statements are readable by GenAI from the first sentence
- confirm that `Observable Signals` are detectable in conversation
- confirm that frontmatter links support both top-down and bottom-up traversal

## Review Method
1. Identify the cluster being reviewed:
   - target `Success Criteria`
   - linked `Symptom` files
   - linked `Failure Mode` files
2. Read frontmatter first:
   - ids
   - relation fields
   - tags
3. Check role separation:
   - `Success Criteria` should describe the desired condition
   - `Symptom` should describe an observable failure state
   - `Failure Mode` should describe a recurring judgment pattern
4. Check first-sentence clarity:
   - the first sentence should identify the node without requiring extra setup
5. Check signal detectability:
   - prefer quote-like or prompt-like signals tied to dialogue or visible action
6. Check overlap and confusion:
   - distinguish similar nodes by audience, timing, or decision pattern
7. Check relation consistency:
   - `threatened_by` <-> `threatens`
   - `triggered_by` <-> `triggers`
   - `leads_to` <-> `leads_from`

## What to Flag
- a `Symptom` that reads like a `Failure Mode`
- a `Failure Mode` that only names a theme and not a judgment pattern
- two nodes that differ only in wording, not in role
- `Observable Signals` that are too abstract to detect in simulation-time conversation
- missing or asymmetric relation links
- file names that no longer match materially updated titles

## Output Style
- findings first
- cite exact files and lines when possible
- separate structural issues from wording issues
- if the set is clean, say so explicitly and note any remaining ambiguity or risk
