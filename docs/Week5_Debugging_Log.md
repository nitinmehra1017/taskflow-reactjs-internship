# Week 5 Debugging Log

## QA-001 Filtered task removal loses keyboard focus

- Description: completion or editing can remove the active task card while a filter is applied.
- Reproduction: create a pending medium-priority task. Filter to pending and activate Complete; alternatively filter to medium, open Edit, change priority to high and save.
- Expected: focus moves to the remaining task results heading if the original trigger disappears.
- Actual before fix: the trigger is disconnected and focus falls to the document body. Modal restoration cannot focus an element that no longer exists.
- Root cause: filtering unmounts the card after state updates; there was no persistent fallback for a disconnected action trigger.
- Fix: `TasksPage.jsx` keeps a ref to the My tasks heading with tabIndex -1. It captures completion/edit triggers and schedules a post-render connectivity check. Only disconnected triggers cause heading focus; ordinary modal trigger restoration stays intact.
- Regression tests: `QA-001 completing a task hidden by the current filter moves focus to task results` and `QA-001 editing a task out of the active filter restores focus to task results` in `qa-regressions.test.jsx`.
- Verification: both failed before the fix, passed after it and passed in the full suite. Actual desktop browser checks and focus screenshots confirm the heading destination.

## QA-002 Retrying a remote error loses keyboard focus

- Description: Retry removes the error panel that contains its focused button.
- Reproduction: cause a network failure in Explore, focus Retry request, press Enter and allow the request to complete.
- Expected: focus remains in persistent request feedback while the request changes state.
- Actual before fix: removing the error panel drops focus to the document body.
- Root cause: the loading transition destroys the Retry button without selecting a surviving focus destination.
- Fix: `ExplorePage.jsx` adds a focus ref and tabIndex -1 to the existing request status paragraph; Retry schedules focus there after refresh.
- Regression test: `QA-002 retrying a remote failure retains keyboard focus in request feedback` in `qa-regressions.test.jsx`.
- Verification: failed before, passed after and in the full suite. Chrome Enter retry recovered to 200 actual remote records with focus on request feedback. The temporary, explicitly labelled failure harness is saved as evidence and removed from final application source.

## Debugging evidence

`regressions-before-fix.log` records three real failed assertions; `regressions-after-fix.log` records all three passing. `tests-coverage.log` records the complete passing suite. The first expanded 111-test run had one ambiguous status query: 110 passed and one failed. `initial-query-failure.log` retains it. Scoping to the Demo feedback region fixed the test query, not application behavior.

## Other investigated areas

API cancellation/stale responses, duplicate imports, malformed responses, storage read/write failures, invalid task fields, combined filters and state immutability passed their executed automated checks. No additional defect is claimed in these areas. Responsive measurements found no horizontal overflow in the 15 recorded route/viewport checks. Automated accessibility checks found no reported violations in the tested fixtures; this is not a complete WCAG or assistive-technology audit. A fresh Chrome session after final source restoration loaded Dashboard and 200 live Explore records. Its captured warning/error console list was empty (`browser-console-final.json`); this observation is limited to that session.
