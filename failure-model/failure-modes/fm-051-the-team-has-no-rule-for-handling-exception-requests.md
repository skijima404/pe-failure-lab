---
id: fm-051
title: The Team Has No Rule for Handling Exception Requests
type: failure_mode
triggers:
  - rf-024
triggered_by: []
leads_to: []
leads_from: []
tags:
  - failure_mode
  - barriers
  - expectations
---

## Failure Mode Statement
The team has no rule for handling exception requests, so special cases are negotiated ad hoc instead of being filtered through a stable operating policy.

## Context
This tends to emerge when legacy demands, urgent project requests, or one-off stakeholder asks are treated as situational decisions rather than as cases that should be evaluated against explicit rules.

## Mechanism
- Exception requests arrive without a defined path for accept, redirect, transform, or refuse.
- The team evaluates each case in isolation instead of against a consistent expectation policy.
- As a result, exceptions accumulate and reshape the operating model through precedent.

## Countermove
- Define explicit rules for how exception requests are classified and handled.
- Distinguish between strategic exceptions, operational exceptions, and requests that should be refused.
- Treat repeated ad hoc exceptions as evidence that the operating policy is missing or too weak.

## Notes
Initial draft linked to `rf-024`.
