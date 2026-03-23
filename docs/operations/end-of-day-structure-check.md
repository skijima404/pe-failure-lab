# End-of-Day Structure Check

- status: draft
- created_at: 2026-03-23
- updated_at: 2026-03-23
- scope: repository-local operating check

## Purpose
Run a lightweight end-of-day check so the repository does not drift away from:
- asset boundary rules
- current-truth preservation
- the traceability chain from `Product Vision` to implementation

This is intended to catch structural drift while it is still cheap to correct.

## Primary Checks
The check should review two areas:

1. asset boundary integrity
2. traceability chain integrity

## Asset Boundary Integrity
Check whether production-facing work has remained physically and semantically separate from:
- test assets
- validation assets
- mocks
- fixtures
- prototypes
- requirement or design documents

Questions:
- Did any new production path start depending on a mock, fixture, prototype, or validation-only artifact?
- Were any temporary or verification-only assets placed in production-facing directories?
- Does directory placement still make intended asset usage legible?
- Did any requirement or design asset become execution-facing without explicit promotion?

## Traceability Chain Integrity
Check whether non-trivial work remains connected to the current repository chain:

1. `Product Vision`
2. `Value Stream`
3. `Intent`
4. `Feature Proposal`
5. `User Interaction Spec`
6. `Implementation Spec`

Questions:
- Did today's non-trivial changes map to an existing `Value Stream` and `Intent`?
- If a new capability or workflow was introduced, does it have the necessary upstream asset links?
- Did any important design or operating truth remain only in chat or transient notes?
- Did any new implementation work bypass the relevant feature or interaction layer without justification?

## Lightweight Human Checklist
Use this checklist at the end of the day:

1. Review today's meaningful file additions and edits.
2. Identify any new or changed production-facing paths.
3. Confirm they do not depend on test, mock, fixture, prototype, or validation-only assets.
4. Identify any non-trivial capability or workflow changes.
5. Confirm each one has an upstream chain at least through `Value Stream` and `Intent`, and through downstream specs where needed.
6. Record any missing current-truth asset before ending the workday, even if only as a minimal scaffold.

## Expected Output
The check should produce only:
- structural violations
- ambiguous cases that need explicit review
- missing traceability links
- missing current-truth assets

It should avoid producing noisy "all good" commentary unless explicitly requested.

## Future Skill Shape
This check is a good candidate for a repository-local skill.

Possible skill responsibilities:
- inspect changed files since the start of the day or since the last commit boundary
- flag likely asset-boundary violations
- flag likely traceability-chain gaps
- report only exceptions and suggested fixes

Possible output sections:
- `Asset Boundary Findings`
- `Traceability Findings`
- `Required Follow-Up`

## Design Principle
The purpose of this check is not governance theater.

It exists to prevent two concrete failure modes:
- temporary or validation-only assets quietly becoming production truth
- implementation moving faster than the repository's current-truth chain can explain
