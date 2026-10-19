# TaskFlow Week 4 API Integration and Data Handling

## Introduction and objectives

Week 4 adds a Remote Task Explorer to the existing React application. It demonstrates actual asynchronous requests, validation, cancellation, lifecycle management, clear loading/error states, client-side organization and remote-to-local import. Weeks 1–3 code, commits, documents and evidence are preserved. The branch `week-4-api-integration` starts from Week 3 commit `227b6b0`; main is not merged or rewritten.

The `/explore` route belongs to the existing TaskFlow shell. Remote records are clearly labeled demo data; local Tasks and Dashboard continue using their existing reducer and persistence. Imported records become independent local copies, never remote mutations.

## API selection and endpoints

[JSONPlaceholder](https://jsonplaceholder.typicode.com/) provides free public demonstration data without keys or signup. It is suitable for practicing asynchronous data handling, not a production task backend. The live browser returned 200 todos and 10 associated users. Successful application requests always fetch real remote responses; no static response file or hardcoded collection is bundled.

| Request                                        | Required fields              | Purpose                         |
| ---------------------------------------------- | ---------------------------- | ------------------------------- |
| GET https://jsonplaceholder.typicode.com/todos | id, userId, title, completed | Remote task collection          |
| GET https://jsonplaceholder.typicode.com/users | id, name, username           | Owner labels and user filtering |

Only GET requests are issued. User fields beyond the displayed name/username are discarded. The explorer does not submit local task information to the service. Fetch uses Accept: application/json and cache: no-store, so Refresh requests a fresh response rather than relying on the browser HTTP cache.

## Architecture and data flow

```text
App > TaskProvider > AppLayout > ExplorePage
  useRemoteTasks > fetchRemoteTasks > getJson > Fetch
                                  > validateRemoteData
  RemoteTaskFilters > Input + Select + Button
  RemoteTaskList > RemoteTaskCard > Card + Badge + Button
  RemoteTaskSkeleton
  Alert for request or local storage feedback

Import action > TaskProvider.importRemoteTask
              > validated local model + UUID + timestamps + sourceId
              > taskReducer duplicate guard
              > shared Tasks / Dashboard
              > existing localStorage effect
```

| File                                     | Responsibility                                                                          |
| ---------------------------------------- | --------------------------------------------------------------------------------------- |
| services/apiClient.js                    | Base URL, Fetch, HTTP status checking, JSON decoding and typed errors                   |
| services/remoteTaskService.js            | Concurrent endpoint requests, response validation and field projection                  |
| utils/remoteTaskValidation.js            | Bounds, field types, unique IDs, user relationships and stable source key               |
| hooks/useRemoteTasks.js                  | Request lifecycle, async state, refresh/retry, timeout, abort and stale-response guards |
| pages/ExplorePage.jsx                    | Temporary search/filter/page state, derived results, import feedback and composition    |
| components/remote/RemoteTaskFilters.jsx  | Controlled labeled filters and clear action                                             |
| components/remote/RemoteTaskCard.jsx     | Remote title, source ID, owner, status and import action                                |
| components/remote/RemoteTaskList.jsx     | Stable keyed list or results-empty state                                                |
| components/remote/RemoteTaskSkeleton.jsx | Static decorative loading placeholders                                                  |
| styles/explore.css                       | Responsive explorer layouts with the established palette                                |
| tests/remote.test.jsx                    | Mocked service, hook and integrated page/import verification                            |

## Request and response lifecycle

1. Mounting useRemoteTasks creates an AbortController, an active-generation flag and a 15-second timeout.
2. An async load function sets loading and clears the previous error while retaining previous successful data.
3. Promise.all fetches todos and users concurrently with the same cancellation signal.
4. getJson awaits Fetch, rejects non-OK HTTP responses, then awaits JSON decoding.
5. The service validates both collections and their relationships before projecting the used fields.
6. Only a still-active, non-aborted request may replace successful state. Failures retain existing results, stop loading and expose a classified message.
7. Finally clears the timeout. Effect cleanup marks the request inactive, clears the timer and aborts both requests.
8. Retry and Refresh increment a revision; effect cleanup cancels the old generation before the new request begins.

This handles StrictMode effect replay and late responses even if a mocked transport ignores abort. Cleanup prevents post-unmount state updates. Ordinary cancellation is not shown as an error; timeout is intentionally a retryable error. If either endpoint fails, the hook also aborts its sibling request. The API client preserves cancellation exceptions rather than converting them to connection failures.

## Validation and error categories

The validator requires arrays with at most 1000 records each, unique positive safe integer IDs, string names/usernames, nonblank titles up to 120 characters and boolean completion values. Each todo userId must resolve to a validated user. Empty arrays are valid, producing an empty-state interface. Invalid records reject the whole snapshot to avoid partial or misleading imports. Unknown fields are projected away.

HTTP failures include the response code. Network failures explain connection/retry options. Unreadable JSON and invalid schema receive validation feedback. Timeout has a separate message after 15 seconds. The validator bounds parsed record counts; it is not a streaming byte-size limiter. JSONPlaceholder controls actual payload size and availability.

## Hook and state decisions

useState owns `{data, loading, error}`, a request revision, filters, requested page and import feedback. The effect depends only on revision: typing, filtering, importing or paging never triggers a new fetch. Refresh is a stable useCallback because it is the hook's reusable public action. There is no automatic retry loop.

useMemo derives a user lookup Map, the imported-source Set and combined filtered records. Their dependencies change only when the relevant collections or filters change. Pagination slices the filtered array into eight records. Page count, current bounded page, result counts and visible records are derived, not redundant state. Changing a filter resets the requested page to one; smaller refreshed results clamp the effective page without an effect.

The user lookup is constant-time per card. Stable remote IDs are React keys. The full small demo dataset is fetched once per mount or explicit refresh; pagination is client-side, not a server request. Navigating away and back fetches again; cross-route remote caching is a future option. No data-fetching library was added.

## Loading refresh and empty states

Initial loading exposes a polite status and static skeletons with reserved space. Skeleton content is aria-hidden; the action button shows Loading and is disabled. Refresh shows Refreshing, keeps prior records useful and marks the results busy. The shared Button respects reduced motion.

Request errors provide a clear message and Retry request. When an earlier successful snapshot exists, it stays visible with an explicit last-successful-results notice. No matching records explains how to change or clear filters. Completion, user and case-insensitive title search combine without mutating remote records. Counts show the visible range and matching total; pagination provides Previous/Next with boundary states.

## Remote to local import

importRemoteTask validates the selected remote todo again. It maps title and completion to the existing local model: medium priority, blank description and due date, completed or pending status. It generates a local UUID and ISO timestamps, and adds `sourceId: jsonplaceholder:todo:<remote ID>`.

The reducer checks both local ID and remote source ID atomically, so rapid events in the same render cannot add two copies. Stored validation also rejects duplicate source IDs and validates the optional source format. Existing Week 3 records without sourceId remain valid. Local editing preserves the source field; deleting an imported task allows it to be imported again. This is duplicate prevention within the current collection, not an import-history ledger.

Remote user details are not copied into local records. The explorer disables already-imported buttons and the local card says Imported local copy. The status feedback says a local copy was added and device saving is attempted; it does not assert persistence. Existing write/read-failure warnings remain visible. If storage is unavailable, imports continue in memory and are labeled session only. Persistence failure was tested with a quota-like exception.

## Accessibility and responsive presentation

The explorer reuses Button, Input, Select, Card, Badge and Alert. Semantic page/results headings, the shared skip link, navigation labels and route focus/title behavior remain. Native controls have visible labels and focus indicators. Source and status appear as text, not just color. A small number of polite live regions report request state, imports, counts and page changes; static cards do not individually announce.

After an import disables its trigger, focus moves to View local tasks. Pagination moves focus to the result heading so keyboard users can discover the new page. Search and filter changes preserve control focus. Static skeletons add no animation, and existing reduced-motion styles remain.

Filters use four, two and one columns across breakpoints; cards use two columns then one below 600px. Text wraps and mobile pagination wraps. In-app browser checks measured document width equal to viewport width at 1440, 768 and 390 pixels. This does not constitute a complete WCAG, assistive-technology or cross-browser audit.

## Actual automated verification

Executed on 19 October 2026, Node 24.22.0 / npm 11.19.1:

| Command                     | Result                                                     |
| --------------------------- | ---------------------------------------------------------- |
| npm ci                      | Exit 0; repeated against final lockfile                    |
| npm test -- --watch=false   | 66 passed, 0 failed, 4 suites                              |
| npm run lint                | Exit 0, no warnings                                        |
| npm run format:check        | Exit 0                                                     |
| npm run build               | Exit 0, three production performance warnings              |
| npm start                   | Served application and explorer at localhost:3000          |
| npm audit fix               | Compatible patch applied; exit 1 because advisories remain |
| npm audit --json            | 26 advisories, 21 moderate and 5 high                      |
| npm audit --omit=dev --json | Exit 0, zero production dependency advisories              |

The 22 new tests mock external requests and exercise service success, HTTP/network/JSON/schema errors, duplicate/invalid user relationships, empty/bounded validation, loading, stable refresh, retained data, retry recovery, timeout, unmount cancellation and late-generation safety. Page tests cover title search, status/user filters, pagination and reset, empty results, refresh/error UI, importing into Context, duplicate events, status/source preservation, dashboard integration, remount persistence and storage failure feedback. All 44 Week 3 and earlier tests pass, including task CRUD and the Week 2 primitives.

## Actual browser verification and evidence conditions

Browser: Codex in-app browser on macOS. Desktop 1440×1000, tablet 768×1000 and mobile 390×1000 overrides were used. Full-page images can be taller than the viewport. Main live checks fetched 200 todos with named users. Desktop checked combined search/status/user filters, empty results, page 2 of 25, a pending task import, dashboard changes and persistence after a real reload. Mobile checked filtering, an Enter-key completed-task import and restored focus. Tablet checked the completion filter and wrapping layout. Dashboard, Tasks, Components and Settings routes all rendered. Final error logs contained no unexpected entries.

Two controlled conditions made transient UI reproducible. A temporary eight-second delay before the real requests exposed initial loading and refreshing with retained real data. A temporary entry wrapper rejected only the initial two requests as simulated network failures; the visible page banner states this clearly. Clicking Retry then fetched the actual 200 remote records. The harness text is saved as evidence, but neither harness nor delay is included in final application source. These screenshots show an intentional simulation, not a real JSONPlaceholder outage. HTTP, timeout, stale-response and malformed-payload failures were verified in automated tests, not induced as actual remote service failures.

Genuine captures in evidence/week4 include desktop records, search/filters, pagination, loading, refreshing, controlled error/retry, imports, dashboard, persistence, empty results and mobile/tablet. Raw logs and before/after audits are retained. No native Terminal screenshot is claimed. The preview retains two imported demonstration tasks alongside the earlier local task; these are browser storage only and are not bundled as starter data.

## Dependency security review

Before and after the compatible npm audit fix, the full graph reports 26 affected package entries (21 moderate, 5 high); these are not 26 distinct underlying flaws. The fix updated babel-plugin-istanbul 8.0.0 to 8.0.2 within its existing range. Production-only audit reports zero. No npm audit fix --force was run.

The high chain involves braces through micromatch/chokidar/http-proxy-middleware and webpack-dev-server. Moderate chains include sprintf-js through argparse/js-yaml and Jest instrumentation, and uuid through SockJS. npm's suggested changes include webpack-dev-server 6.1.0 and a Jest/Babel-Jest 25 downgrade; these cross major versions and were not applied as compatible fixes. Registry inspection found the latest sprintf-js 1.1.3 still included in the reported vulnerable range, so a blind transitive override would not address it.

Development-only does not mean harmless. The dev server remains bound to 127.0.0.1; do not deploy it publicly. Process only trusted repository files and build/test configuration until fixes are reviewed. Follow-up should review upstream patched releases or separately migrate away from affected chains, retest the server and HMR, then rerun both full and production-only audits. Production deployment should serve built static files and exclude development tooling. An audit with zero results is not a security guarantee.

## Challenges solutions and future scope

The two endpoints must resolve to a coherent joined snapshot; validation rejects orphaned user IDs. Obsolete async work needs both transport cancellation and a lifecycle guard. Imports need reducer-level source checking rather than only a disabled UI button. Storage feedback must describe in-memory success separately from durable saving. Fast real responses required explicit test conditions to capture transient states honestly. No test condition survives final validation.

Remaining scope includes third-party availability/CORS dependence, full collection fetching, no cross-route remote cache, no server pagination, no remote writes, no multi-tab synchronization and no backend/authentication. Local data can be lost if storage is unavailable. Three existing bundle-size warnings and development dependency advisories remain. Weeks 5–6 can broaden verification, improve performance, address dependencies and prepare final delivery.

## Planned 35 hour work breakdown

| Work                                                 | Planned hours |
| ---------------------------------------------------- | ------------: |
| Review existing code and design API contracts        |             3 |
| API service, validation and cancellation             |             6 |
| Custom hook and asynchronous states                  |             5 |
| Explorer presentation, filters and pagination        |             6 |
| Local imports and persistence integration            |             4 |
| Automated/browser verification and dependency review |             6 |
| Documentation, report and evidence                   |             5 |
| Total                                                |            35 |

This is a planned allocation, not measured attendance.

## Actual source excerpts

### src/services/apiClient.js

```js
export const API_BASE_URL = 'https://jsonplaceholder.typicode.com';
export class ApiError extends Error {
  constructor(message, kind, status) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = status;
  }
}
export async function getJson(path, { signal } = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      signal,
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
  } catch (error) {
    if (signal?.aborted || error.name === 'AbortError') throw error;
    throw new ApiError(
      'Unable to reach JSONPlaceholder. Check your connection and try again.',
      'network',
    );
  }
  if (!response.ok)
    throw new ApiError(
      `JSONPlaceholder returned HTTP ${response.status}. Please try again.`,
      'http',
      response.status,
    );
  try {
    return await response.json();
  } catch (error) {
    if (signal?.aborted || error.name === 'AbortError') throw error;
    throw new ApiError(
      'JSONPlaceholder returned unreadable JSON. Please try again.',
      'validation',
    );
  }
}
```

### src/services/remoteTaskService.js

```js
import { ApiError, getJson } from './apiClient';
import { validateRemoteData } from '../utils/remoteTaskValidation';
export async function fetchRemoteTasks({ signal } = {}) {
  const [todos, users] = await Promise.all([
    getJson('/todos', { signal }),
    getJson('/users', { signal }),
  ]);
  if (!validateRemoteData(todos, users))
    throw new ApiError(
      'JSONPlaceholder returned unexpected task or user data. Please try again.',
      'validation',
    );
  // Retain only fields the explorer uses; user details never enter local task records.
  return {
    todos: todos.map(({ id, userId, title, completed }) => ({
      id,
      userId,
      title,
      completed,
    })),
    users: users.map(({ id, name, username }) => ({ id, name, username })),
  };
}
```

### src/hooks/useRemoteTasks.js

```js
import { useCallback, useEffect, useState } from 'react';
import { fetchRemoteTasks } from '../services/remoteTaskService';
export const REQUEST_TIMEOUT_MS = 15000;
export function useRemoteTasks() {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [revision, setRevision] = useState(0);
  const refresh = useCallback(() => setRevision((value) => value + 1), []);
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, REQUEST_TIMEOUT_MS);
    async function load() {
      setState((previous) => ({ ...previous, loading: true, error: null }));
      try {
        const data = await fetchRemoteTasks({ signal: controller.signal });
        if (active && !controller.signal.aborted)
          setState({ data, loading: false, error: null });
      } catch (error) {
        if (!active) return;
        if (controller.signal.aborted && !timedOut) return;
        setState((previous) => ({
          ...previous,
          loading: false,
          error: {
            kind: timedOut ? 'timeout' : error.kind || 'network',
            message: timedOut
              ? 'The request took too long. Please try again.'
              : error.message,
          },
        }));
        controller.abort();
      } finally {
        clearTimeout(timer);
      }
    }
    void load();
    return () => {
      active = false;
      clearTimeout(timer);
      controller.abort();
    };
  }, [revision]);
  return { ...state, refresh };
}
```

### src/utils/remoteTaskValidation.js

```js
const positiveId = (value) => Number.isSafeInteger(value) && value > 0;
export const validRemoteTodo = (todo) =>
  todo &&
  positiveId(todo.id) &&
  positiveId(todo.userId) &&
  typeof todo.title === 'string' &&
  todo.title.trim().length > 0 &&
  todo.title.length <= 120 &&
  typeof todo.completed === 'boolean';
export const remoteSourceId = (id) => `jsonplaceholder:todo:${id}`;
export function validateRemoteData(todos, users) {
  if (
    !Array.isArray(todos) ||
    todos.length > 1000 ||
    !Array.isArray(users) ||
    users.length > 1000
  )
    return false;
  const userIds = new Set(users.map((user) => user?.id));
  return (
    userIds.size === users.length &&
    new Set(todos.map((todo) => todo?.id)).size === todos.length &&
    users.every(
      (user) =>
        user &&
        positiveId(user.id) &&
        typeof user.name === 'string' &&
        user.name.trim().length > 0 &&
        user.name.length <= 120 &&
        typeof user.username === 'string' &&
        user.username.length <= 120,
    ) &&
    todos.every((todo) => validRemoteTodo(todo) && userIds.has(todo.userId))
  );
}
```
