# Week 6 Performance and Accessibility

TaskFlow Week 6 preserves the completed Week 1–5 application and reports. It adds measured route splitting, targeted remote-card rendering optimization, contrast fixes, narrow-screen reflow corrections and final internship documentation. Work starts from verified Week 5 commit `7af5394961c7cec85fdb1df4d01ec2423dd0e694` on `week-6-performance-accessibility`. No main merge or deployment is performed.

## Objectives and existing architecture

Reduce unnecessary initial payload and rendering work while keeping task CRUD, Context/reducer state, localStorage recovery, filters, dashboard statistics, seven UI primitives and live remote imports. React 19 and React Router 7 run through the existing custom Webpack 5/Babel pipeline. Pages sit under a persistent AppLayout; TaskProvider remains above all routes. Services validate public API data, hooks own cancellation and derived state, and CSS/SCSS preserve the forest, lime and neutral palette.

## Baseline and Lighthouse methodology

All 24 baseline audits completed before performance source modifications. Production assets were built from Week 5 and served locally at `127.0.0.1:4173`. Lighthouse 13.5.0 ran in headless Chrome 155 with performance and accessibility categories. Three audits per route and preset cover Dashboard, Tasks, Components and Explore, for mobile default simulated throttling and the desktop preset. The optimized phase repeats the same 24 audits against the final build. Each raw JSON contains environment, benchmark, configuration and timing. HTML reports are also retained.

The same preview server negotiates gzip, sets immutable caching for content-hashed assets and no-cache for HTML. Lighthouse resets storage/cache by default. Local tasks start empty. Explore uses the real public API; its response timing is not controlled. Audits run serially, though local tool and CPU activity can introduce noise. Medians summarize three runs; these are lab observations, not field Core Web Vitals or evidence of a statistically significant speedup. Zero denominators have no percentage change rather than an invented infinite improvement.

## Before and after Lighthouse medians

All timing values below are milliseconds; transfer is bytes from network request entries. Scores are on a 0–100 scale.

| Route      | Preset  | Performance | Accessibility | FCP             | LCP             | TBT       | CLS             | Speed Index     | Transfer bytes  | Requests |
| ---------- | ------- | ----------- | ------------- | --------------- | --------------- | --------- | --------------- | --------------- | --------------- | -------- |
| dashboard  | mobile  | 100 → 99    | 95 → 100      | 755.8 → 1360.4  | 1801.9 → 1807.6 | 0.0 → 0.0 | 0.0000 → 0.0000 | 1088.1 → 1360.4 | 105878 → 98081  | 7 → 8    |
| tasks      | mobile  | 100 → 99    | 96 → 100      | 752.3 → 1202.1  | 1803.5 → 1802.3 | 0.0 → 0.0 | 0.0000 → 0.0000 | 752.3 → 1202.1  | 105878 → 104757 | 7 → 10   |
| components | mobile  | 100 → 99    | 96 → 100      | 751.4 → 1504.5  | 1801.7 → 1802.2 | 0.0 → 0.0 | 0.0000 → 0.0000 | 751.4 → 1504.5  | 105878 → 106058 | 7 → 10   |
| explore    | mobile  | 99 → 99     | 97 → 100      | 1508.2 → 1505.1 | 1801.7 → 1802.7 | 0.0 → 0.0 | 0.0160 → 0.0160 | 1508.2 → 1505.1 | 113001 → 112868 | 9 → 12   |
| dashboard  | desktop | 100 → 100   | 95 → 100      | 323.2 → 327.3   | 401.9 → 448.0   | 0.0 → 0.0 | 0.0000 → 0.0000 | 323.2 → 327.3   | 105878 → 98081  | 7 → 8    |
| tasks      | desktop | 100 → 100   | 96 → 100      | 323.6 → 302.0   | 402.4 → 442.3   | 0.0 → 0.0 | 0.0000 → 0.0107 | 323.6 → 302.0   | 105878 → 104757 | 7 → 10   |
| components | desktop | 100 → 100   | 96 → 100      | 201.7 → 302.4   | 402.3 → 442.7   | 0.0 → 0.0 | 0.0000 → 0.0599 | 201.7 → 307.7   | 105878 → 106058 | 7 → 10   |
| explore    | desktop | 100 → 100   | 97 → 100      | 201.8 → 301.8   | 402.6 → 442.2   | 0.0 → 0.0 | 0.0003 → 0.0103 | 201.8 → 301.8   | 112996 → 112867 | 9 → 12   |

### Actual percentage changes

Negative values mean the numeric metric decreased; positive values mean it increased. A score gain is in points, not timing percent. Do not interpret every small timing difference as a causal effect.

| Route      | Preset  | FCP %  | LCP % | TBT %               | CLS %               | Speed Index % | Transfer % |
| ---------- | ------- | ------ | ----- | ------------------- | ------------------- | ------------- | ---------- |
| dashboard  | mobile  | 80     | 0.32  | N/A (baseline zero) | N/A (baseline zero) | 25.02         | -7.36      |
| tasks      | mobile  | 59.78  | -0.07 | N/A (baseline zero) | N/A (baseline zero) | 59.78         | -1.06      |
| components | mobile  | 100.22 | 0.03  | N/A (baseline zero) | N/A (baseline zero) | 100.22        | 0.17       |
| explore    | mobile  | -0.2   | 0.06  | N/A (baseline zero) | 0                   | -0.2          | -0.12      |
| dashboard  | desktop | 1.26   | 11.46 | N/A (baseline zero) | N/A (baseline zero) | 1.26          | -7.36      |
| tasks      | desktop | -6.67  | 9.9   | N/A (baseline zero) | N/A (baseline zero) | -6.67         | -1.06      |
| components | desktop | 49.93  | 10.03 | N/A (baseline zero) | N/A (baseline zero) | 52.56         | 0.17       |
| explore    | desktop | 49.54  | 9.85  | N/A (baseline zero) | 3787.31             | 49.54         | -0.11      |

The final median Performance score is 99 for every mobile route and 100 for every desktop route. Accessibility reaches 100 in all eight route/preset combinations, from baseline scores of 95–97. Several FCP medians regress, and desktop lazy-route CLS increases (Components reaches approximately 0.060). Mobile LCP is nearly unchanged. Route requests and fallback replacement are real tradeoffs alongside measurement noise; these results support payload/accessibility gains, not a blanket page-speed improvement.

## Webpack bundle analysis

| Build metric                 | Baseline | Optimized | Change                                      |
| ---------------------------- | -------- | --------- | ------------------------------------------- |
| Initial JavaScript bytes     | 306,434  | 279,437   | -8.81%                                      |
| Initial CSS bytes            | 32,041   | 20,576    | -35.78%                                     |
| All emitted JavaScript bytes | 306,434  | 325,190   | Includes deferred code and runtime overhead |
| Webpack warnings             | 3        | 1         | Entry-size warning remains                  |

Sizes above are uncompressed emitted bytes. Network transfers above reflect gzip, response headers, browser behavior and live API requests. Initial assets are the Webpack main entrypoint; a direct visit to a lazy route also downloads its route/shared chunks, so initial-entry reduction is not the whole route transfer reduction. Total emitted JavaScript can increase because splitting adds runtime boundaries; that is reported rather than hidden. Source maps remain enabled and are not normal application requests.

Production mode and React production branches were already enabled. Runtime separation and splitChunks existed in Week 5; Week 6 adds named route chunks and stable React DOM/router cache groups. The previous oversized single vendor asset is split. The original 244 KiB performance budget was not raised or disabled. One combined entrypoint warning remains. No component framework, unnecessary runtime dependency, or bundler replacement is introduced.

## Code splitting and recovery

Dashboard stays eager. Tasks, Components, Explore and Settings use module-scope React.lazy and named dynamic imports. AppLayout keeps navigation outside Suspense, and RouteContent wraps only Outlet. A stable minimum-height loading section supplies an h1, a polite status message and a static decorative placeholder. It avoids animation and reserves space, but cannot guarantee zero shift for every variable-length page. CLS is measured in the reports.

Rejected route code reaches RouteErrorBoundary, which offers an ordinary same-path link for a full-document reload. This can recover stale deployment chunks without automatic reload loops. The boundary is keyed by path, so navigation to a different route can recover. TaskProvider stays mounted above it. Deferred and rejected module tests exercise the actual fallback and error UI. Tests await real lazy imports; no production lazy routes are mocked away.

```jsx
import { lazy } from 'react';
const ExplorePage = lazy(
  () => import(/* webpackChunkName: 'explore' */ './pages/ExplorePage'),
);
import { TaskProvider } from './context/TaskContext';
import { Route, Routes } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import DashboardPage from './pages/DashboardPage';
const TasksPage = lazy(() => import(/* webpackChunkName: 'tasks' */ './pages/TasksPage'));
const SettingsPage = lazy(
  () => import(/* webpackChunkName: 'settings' */ './pages/SettingsPage'),
);
import NotFoundPage from './pages/NotFoundPage';
const ComponentsPage = lazy(
  () => import(/* webpackChunkName: 'components' */ './pages/ComponentsPage'),
);

export default function App() {
  return (
    <TaskProvider>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="explore" element={<ExplorePage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="components" element={<ComponentsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </TaskProvider>
  );
}
```

## React Profiler findings and rendering optimization

The actual React Profiler experiment wraps the real Card component through a test-only wrapper, renders eight deterministic remote records and imports record 1. Before optimization all eight visible remote cards committed updates. After memoizing RemoteTaskCard and stabilizing its onImport callback, only the changed card committed: 8 to 1, an 87.5% reduction in card update commits for this fixture. The regression test now requires exactly that single card update. Raw Profiler entries include actual/base durations, but jsdom development timings are not presented as a production CPU speedup.

TaskCard already uses memo with stable task action callbacks; TaskProvider already memoizes statistics and its context value. useTaskFilters already memoizes combined filters. Those mechanisms were retained instead of adding indiscriminate memoization. Shared state changes still rerender relevant consumers; there is no claim that all context updates have been eliminated.

```jsx
import { memo } from 'react';
import { Card, Badge, Button } from '../ui';
function RemoteTaskCard({ todo, user, imported, onImport }) {
  // Existing card UI is preserved.
}
export default memo(RemoteTaskCard);
```

## API performance evaluation

The service already requests todos and users concurrently, validates their association and retains only used fields. Hook effects depend on explicit refresh revision, not filters; tests confirm search/filter/page interactions leave fetch count at two endpoint calls. AbortController cleanup, a 15 second timeout, stale-response guards and retained results during refresh were preserved and retested. Navigating away aborts active work; revisiting Explore intentionally refetches current remote data. No global cache or changed freshness promise is introduced just to improve a benchmark.

Week 6 normalizes the search query once per filter calculation rather than once per remote row. Remote cards now skip unrelated import-feedback updates while imported state remains a per-card boolean. Pagination stays at eight records. Loading skeletons and request status remain; a route-loading state is separate from API loading. Live external timing may dominate Explore LCP, so its timing cannot be attributed only to the local code change.

## Responsive changes and actual results

All five major routes were checked at 320, 375, 390, 768, 1024, 1440 and 1920 CSS pixels: 35 final route/viewport measurements with no horizontal overflow. Correct route headings were awaited before measurement. Initial investigation found Settings at 320 had scrollWidth 365; a grid item minimum and a nonwrapping preferences badge caused the overflow. After permitting grid shrinkage, wrapping command text and allowing the badge to wrap, scrollWidth is 320. An intermediate attempt still measured 339 and was corrected before final results.

The narrow dashboard uses two statistic columns below 400px, giving labels more room. Sidebar content can scroll within short desktop viewports. Long headings and commands wrap without hiding content. The 320 by 700 task dialog measured left/top 12 and right/bottom 308/688, with internal scrolling for its content. Native Chrome AX confirmed actual 200% zoom; all five routes fit the effective 735 CSS pixel viewport. Zoom was restored to 100% and viewport overrides reset after checks.

## Accessibility methodology and WCAG mapping

Lighthouse uses real browser axe checks, including contrast unavailable in jsdom. The full Jest suite retains eight existing jest-axe cases and adds automated fallback/error semantic assertions. Manual browser checks cover keyboard activation, dialogs, validation and focus. No full WCAG conformance statement is made.

| WCAG 2.2 criterion                               | Evidence and outcome                                                              | Scope or remaining limit                                                                              |
| ------------------------------------------------ | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 1.3.1 Info and Relationships                     | Automated route, primitive and dialog checks passed                               | Screen-reader interpretation not fully audited                                                        |
| 1.4.1 Use of Color                               | Task status/priority are written out; preserved tests                             | Full visual perception audit pending                                                                  |
| 1.4.3 Contrast Minimum                           | Baseline Lighthouse found text failures; final route audits retested              | Scores cover measured states, not every possible color combination                                    |
| 1.4.4 Resize Text                                | Actual 200% Chrome zoom checked on five routes                                    | Other browser/OS font settings unverified                                                             |
| 1.4.10 Reflow                                    | Settings overflow fixed; all 35 width checks passed                               | User-generated extreme content beyond fixtures not exhaustive                                         |
| 1.4.11 Non-text Contrast                         | Sidebar focus ring changed from 2.41:1 to 9.11:1 against forest                   | All interaction states not exhaustively audited                                                       |
| 2.1.1 Keyboard and 2.1.2 No Keyboard Trap        | Creation/edit/status/delete, Tab/Shift+Tab, Escape and showcase checks passed     | Native select arrow selection did not change value through automation and remains manually unverified |
| 2.4.1 Bypass Blocks                              | Existing skip link and main landmark retained                                     | Assistive technology audit pending                                                                    |
| 2.4.3 Focus Order and 2.4.7 Focus Visible        | Modal restoration, main navigation, result heading and focus color verified       | Native platform combinations unverified                                                               |
| 2.4.11 Focus Not Obscured Minimum                | Small dialog bounds and internal scroll checked                                   | Exhaustive sticky/scroll combinations unverified                                                      |
| 2.5.3 Label in Name                              | Import button visible and accessible names aligned; regression and browser audit  | Speech-recognition software not directly tested                                                       |
| 2.5.8 Target Size Minimum                        | Existing 44px buttons/fields retained; browser target-size audit recorded         | Not a universal touch-device certification                                                            |
| 3.3.1 Error Identification and 3.3.2 Labels      | Invalid task submission focuses title and associates error                        | Screen-reader announcement quality pending                                                            |
| 4.1.2 Name Role Value and 4.1.3 Status Messages  | Existing controls and new route fallback/error regions tested                     | Speech output not manually verified                                                                   |
| 2.3.3 Animation from Interactions (AAA advisory) | Static route placeholder; existing reduced-motion CSS disables spinner/transition | Preference emulation not completed; no AAA compliance claim                                           |

## Genuine accessibility issues and fixes

**A11Y-01 Text contrast (1.4.3).** Reproduce with baseline Lighthouse on any main route; breadcrumbs, eyebrow text and footer fail 4.5:1, with additional Dashboard welcome/roadmap copy. Root cause is light muted colors on pale surfaces. Colors were darkened within the existing palette. The retained baseline findings contain exact selectors and browser explanations. New contrast ratios and final browser audits verify the fix.

**A11Y-02 Settings reflow (1.4.10).** At 320px open Settings and compare document width. Grid content and the reserved-preferences badge extended beyond the viewport. Grid children now use min-width zero, commands can wrap, and the badge permits multiline content. Actual before/intermediate/final measurements document recovery to 320px.

**A11Y-04 Sidebar focus visibility (1.4.11 and 2.4.7).** Tab through desktop sidebar links. The shared green ring has only 2.41:1 contrast against the forest sidebar. A contextual lime ring provides 9.11:1; computed browser styles confirm a 3px lime outline. The normal content focus ring remains in place.

**A11Y-03 Label in Name (2.5.3).** Real-browser axe found Import local copy visible text missing from the Import remote task accessible name. The visible import label now reads Import remote task plus its ID, matching its accessible name. A dedicated regression checks visible and accessible naming before and after import. The intermediate failing audit is retained; final audits retest it.

## Keyboard verification

The actual browser lifecycle created a QA task, submitted an empty form, typed task details, edited the title, used Space to complete and Enter to reopen, searched, cleared filters, confirmed deletion with Tab/Return and restored New task focus. The QA task was removed afterward. Modal Shift+Tab wrapped from Close to Cancel; Escape closed both task and showcase dialogs and restored triggers. Explorer keyboard search, clear and Next page moved focus to the results heading. See `evidence/week6/keyboard-checks.md` for the native-select limitation and precise outcomes. Tests continue to verify combined select filters and task persistence.

## Automated regression results

119 tests passed, zero failed, across 13 suites. All 111 earlier tests remain; helpers now await real lazy imports, and the API loading assertion uses a deferred request so it still checks an actual pending state. No existing behavior assertion was removed to hide a regression.

| Coverage   | Actual | Threshold |
| ---------- | ------ | --------- |
| Statements | 97.86% | 80%       |
| Branches   | 96.27% | 80%       |
| Functions  | 98.46% | 80%       |
| Lines      | 98.68% | 80%       |

New tests cover pending and rejected lazy code, recovery links, real split routes, keyboard navigation with retained task state and the Profiler commit regression. Source-wide coverage remains configured as `src/**/*.{js,jsx}`. CSS layout is verified in the browser rather than claimed from jsdom. ESLint, Prettier and production build passed; npm audit exits nonzero because findings remain. Existing CI runs lockfile installation, lint, format, coverage and build for week branches.

## Dependency security review

The full audit before and after compatible `npm audit fix` reports 26 development affected-package entries: 21 moderate, 5 high, zero critical. Production-only audit reports zero. No compatible dependency changes cleared the remaining chains; package lock changes only record application version 0.6.0. Breaking force fixes were not used. Findings remain in the Webpack development server and Jest transitive tooling chains. Keep preview/development servers local; review upstream compatibility and deployment exposure before treating this as production release approval.

## Challenges and solutions

Lazy imports made earlier synchronous test setup inappropriate; asynchronous act resolves the real modules while keeping assertions intact. Immediate successful mocks could hide the original loading state, so that scenario now explicitly controls a deferred request. Settings needed a second fix for its nonwrapping badge after grid shrinkage alone still left overflow. Final audits were restarted against the corrected build to avoid mixing production versions. Lab timing noise and the live public API require cautious interpretation; timing regressions are included in the comparison instead of omitted.

## Limitations and future scope

Independent browser engines, screen-reader testing, exhaustive contrast across every transient/user state, reduced-motion preference emulation and native select arrow-key verification remain outstanding. Automated accessibility scores do not establish full WCAG 2.2 AA compliance. One Webpack entry-size warning and 26 development advisory entries remain. The preview server is a local verification server, not a hosted deployment. Public API data and timing may change. Future work should add field monitoring, deployment cache/header validation, compatible tooling migration and wider manual accessibility testing.

## Reproduction and evidence

Run `npm ci`, `npm test -- --watch=false`, `npm test -- --watch=false --coverage`, `npm run lint`, `npm run format:check`, `npm run build` and `npm audit`. Use `npm run preview` for production verification at localhost:4173 or `npm start` for development at localhost:3000. Lighthouse is intentionally installed outside application dependencies: `npm install --prefix /tmp/taskflow-lighthouse lighthouse@13.5.0`. Set LIGHTHOUSE_CLI to that installation's `node_modules/lighthouse/cli/index.js` and run `node scripts/run-lighthouse.cjs optimized`. Run new baseline audits from a separate Week 5 checkout; do not overwrite the retained evidence. `node scripts/summarize-performance.cjs` regenerates the numeric comparison.

Sources: [React lazy](https://react.dev/reference/react/lazy), [React Suspense](https://react.dev/reference/react/Suspense), [Lighthouse headless CLI](https://github.com/GoogleChrome/lighthouse/blob/main/docs/headless-chrome.md), [WCAG reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), [WCAG target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum).
