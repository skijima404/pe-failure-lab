---
id: fm-097
title: The Service Experience Is Not Seamless Enough for Independent Use
type: failure_mode
triggers:
  - rf-040
triggered_by: []
leads_to: []
leads_from: []
tags:
  - failure_mode
  - adoption
  - self_service
---

## Failure Mode Statement
The service experience is not seamless enough for independent use, so users encounter too much friction between steps to treat the platform as something they can use smoothly on their own.

## Context
This tends to emerge when the service technically exists, but the handoffs, interfaces, or journey between steps are fragmented enough that users still need guidance to complete normal tasks.

## Mechanism
- The user journey contains enough breaks, ambiguity, or disconnected steps that independent use feels risky or cumbersome.
- Users can start the path, but not complete it smoothly without extra support.
- As a result, self-service remains partial because the service experience does not hold together cleanly enough.

## Countermove
- Design the usage journey so that common tasks can be completed end-to-end without external stitching.
- Check where users drop into uncertainty between service steps.
- Treat fragmented service flow as a self-service failure, not only as an experience quality issue.

## Notes
Initial draft linked to `rf-040`.
