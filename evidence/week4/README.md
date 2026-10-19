# Week 4 verification evidence

All JPEG images are genuine browser captures. The explorer's successful requests used actual JSONPlaceholder responses, not a bundled response fixture. Screenshot dimensions and SHA-256 hashes are recorded in screenshot-metadata.json.

## Normal live browser checks

Codex in-app browser on macOS, with viewport overrides at 1440×1000, 768×1000 and 390×1000. Full-page captures may be taller than these viewports. Main checks loaded 200 todos and ten users. Search, completion/user filters, pagination, empty results, pending/completed imports, dashboard updates, keyboard Enter, route preservation and refresh persistence were exercised. Document width matched each tested viewport. Browser error entries are retained in browser-errors.json. These are representative checks, not a full accessibility or cross-browser audit.

- explorer-desktop-1440.jpg and explorer-final-desktop.jpg: live remote records before and after imports.
- search-filters.jpg: combined title, completion and user filtering.
- pagination-page-2.jpg: second client-side page and page count.
- remote-import.jpg: pending todo imported; duplicate action disabled.
- dashboard-after-import.jpg: final local statistics after pending and completed imports.
- import-persistence-after-refresh.jpg: imported local task survived an actual reload.
- tablet-768.jpg: completion filtering and tablet layout.
- mobile-390.jpg and mobile-390-viewport.jpg: full-page and viewport mobile layouts.
- mobile-import-completed.jpg: keyboard import of a completed remote todo.
- empty-results.jpg: nonmatching search state with clear action.
- refresh-capture.jpg: early refresh capture; the fast response had already completed. It is not loading-state proof.

## Controlled conditions for transient states

loading-controlled-delay.jpg and refreshing-controlled-delay.jpg use a temporary eight-second delay before the real remote requests. Previous results during refresh are actual remote data. No successful response was fabricated. The delay was removed from final source before validation.

error-controlled-failure.jpg and retry-recovered-live-data.jpg use the temporary entry wrapper saved in browser-failure-harness.txt. It rejects the initial two endpoint calls to simulate a network failure; the verification page includes a banner explaining that condition. Retry delegates to native Fetch and recovered to actual live records. This is not evidence of a real API outage. The temporary wrapper omitted StrictMode for a deterministic first attempt; normal final source retains StrictMode. The wrapper was removed before final tests and build. No runtime debug control or response fixture was shipped.

## Commands and security

npm-ci.log and npm-ci-final.log are actual installation output before and after the compatible lockfile patch. tests.log, lint.log, format-check.log and build.log record the final passing checks. Initial logs are retained where present; an intermediate formatting failure was corrected and rerun. start.log and start-final.log record actual development server output. No native Terminal screenshot is claimed.

Audit JSON and dependency trees show 26 full-graph affected package entries before and after the compatible fix, versus zero production-only advisories. audit-fix-preview.log is mixed npm dry-run text/JSON, deliberately stored as a log. audit-fix.log records the actual non-force fix. No major-version or force fix was used.

The preview contains two imported demonstration tasks alongside the earlier local task; these exist only in browser storage. Previous weeks' evidence and documents are preserved. The Word report was rendered and all final pages visually checked; ignored render intermediates are not submission artifacts.

The earlier tab recorded expected Webpack websocket reconnect errors while the server was deliberately stopped for the final clean install. That unedited output is saved separately in browser-errors-during-server-restart.json. After restart, a fresh tab loaded live records; browser-errors.json contains the fresh-tab error capture, which is empty.
