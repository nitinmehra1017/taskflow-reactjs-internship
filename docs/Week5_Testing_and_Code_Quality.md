# Week 5 Testing and Code Quality

TaskFlow now has 111 passing tests across 10 suites, compared with the verified Week 4 baseline of 66 tests. Week 5 adds 45 tests, deterministic test helpers, complete source coverage collection, two keyboard focus fixes and a working GitHub Actions pipeline. Previous functionality and reports are preserved. The branch starts from Week 4 commit `549332fc20664d0250bb774ac461910e4ca08059`.

## Objectives and strategy

Protect the seven UI primitives, local task lifecycle, persisted state and remote imports through observable behavior. The testing pyramid places validation, reducers, storage and services at its base; rendered component and provider tests in the middle; complete routed workflows above them; and a smaller set of actual browser checks at the top. Jest/jsdom tests are not browser engine tests.

Jest provides deterministic execution and coverage. React Testing Library and user-event exercise accessible names, keyboard interactions and real provider behavior. jest-dom supplies DOM assertions. jest-axe 11 adds automated semantic checks. Existing Babel and jsdom configuration is retained. No deployment or Week 6 feature work is introduced.

## Test isolation and units

`tests/setup.js` clears localStorage before each test and rejects unexpected fetch calls. Mock restoration and real timer restoration prevent leakage. `tests/helpers/fixtures.js` supplies fixed task timestamps, remote records, deferred promises and JSON responses. `tests/helpers/renderApp.jsx` wraps the real application in MemoryRouter and returns a user-event instance.

Button variants, sizes, disabled/loading behavior and keyboard actions; Input labels, controlled changes and error associations; Modal Escape, focus trapping/restoration and background restrictions; Card content/actions/footer; Badge variants/sizes; Select values, disabled/error states and keyboard/form behavior; and Alert variants, urgency and dismissal are covered. Reducer immutability, IDs, validation, statistics and combined filters are exercised. Custom-hook tests include missing providers, malformed storage, restricted reads and failed writes with recovery.

## Integration and API strategy

Workflows A and C create a task, check dashboard statistics and remount to verify persistence. Workflow B is the existing task lifecycle integration in `tasks.test.jsx`: create, edit, complete, reopen and confirmed deletion. Workflow D creates multiple tasks and combines search, status and priority filters before clearing them. Workflow E renders remote fixtures, filters, imports, visits local tasks, remounts and prevents duplicate imports.

Routine API tests never depend on JSONPlaceholder uptime. Fetch is mocked at the service boundary while real hooks, providers and UI run. Deferred promises expose loading, request cancellation and stale response races. Tests cover HTTP/network errors, malformed payloads, retries, refresh, pagination, filtering and imports. Actual browser retry recovery uses the live API after a clearly labelled temporary failure harness; that harness was restored out of application source before final validation.

## Accessibility and browser checks

Eight jest-axe tests passed, covering five routes, populated remote content, the create dialog with validation, and all seven primitives. No axe rules were disabled. jsdom does not provide a full contrast/layout audit. Keyboard checks include modal Tab/Shift+Tab wrapping, Escape and trigger restoration, validation focus, filtered task removal and retry feedback. Focus styles and reduced-motion CSS were inspected; reduced-motion emulation and assistive-technology testing remain future checks.

Actual Chrome browser checks covered Dashboard, Tasks, Components, Explore and Settings at 1440, 768 and 390 CSS pixels. All 15 recorded measurements show document scroll width equal to viewport width. A mobile dialog was opened with Enter and closed with Escape, restoring the trigger. Additional in-app browser checks verified validation, filtered completion/edit focus, task cleanup and tablet layout. These are two browser surfaces; independent engine coverage was not established. Safari/native browser access timed out, so no independent Safari or Firefox result is claimed. Measurements and genuine screenshots are in `evidence/week5/`.

## Coverage configuration

The exact Jest configuration follows. All executable application JavaScript/JSX, including bootstrap and barrel modules, is collected. There are no source-file exclusions added to improve percentages. Static assets, styles and test code are outside the application JavaScript glob.

```js
module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['<rootDir>/tests/**/*.test.jsx'],
  transform: { '^.+\\.[jt]sx?$': 'babel-jest' },
  moduleNameMapper: {
    '\\.(css|scss)$': '<rootDir>/tests/styleMock.cjs',
    '\\.(svg|png)$': '<rootDir>/tests/assetMock.cjs',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  clearMocks: true,
  restoreMocks: true,
  collectCoverageFrom: ['src/**/*.{js,jsx}'],
  coverageReporters: ['text', 'html', 'lcov', 'json', 'json-summary'],
  coverageThreshold: {
    global: { statements: 80, branches: 80, functions: 80, lines: 80 },
  },
};
```

| Metric     | Covered / total | Actual | Required |
| ---------- | --------------- | ------ | -------- |
| Statements | 486 / 497       | 97.78% | 80%      |
| Branches   | 411 / 427       | 96.25% | 80%      |
| Functions  | 185 / 188       | 98.40% | 80%      |
| Lines      | 434 / 440       | 98.63% | 80%      |

Baseline coverage was 95.02% statements, 93.82% branches, 95.10% functions and 96.72% lines. Some defensive paths and callback combinations remain uncovered. Coverage demonstrates execution, not correctness of every possible interaction. The HTML report is regenerated in ignored `coverage/`; JSON and LCOV evidence are retained.

## Debugging and regression

Three newly written assertions failed against the original source and passed after two genuine fixes. QA-001 covers completion and editing that remove the focused card under active filters. QA-002 covers retry replacing the focused error button. Both now move focus to a logical persistent destination. See `Week5_Debugging_Log.md` for exact reproduction, root causes and test names. A separate ambiguous test query was corrected by scoping to its named feedback region; it was not an application defect.

## Continuous integration

The exact workflow is committed at `.github/workflows/ci.yml`:

```yaml
name: TaskFlow quality checks
on:
  push:
    branches: [main, 'week-*', 'codex/**']
  pull_request:
    branches: [main, 'week-*', 'codex/**']
  workflow_dispatch:
permissions:
  contents: read
concurrency:
  group: taskflow-ci-${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
jobs:
  quality:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with:
          node-version: '24'
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run format:check
      - run: npm run test:ci
      - run: npm run build
      - name: Upload coverage reports
        if: always()
        uses: actions/upload-artifact@v6
        with:
          name: taskflow-coverage
          path: coverage/
          if-no-files-found: warn
```

The source commit `cac61a271297b08b0c87d00c5a3e98d8be5aa946` completed a real successful GitHub Actions run: https://github.com/nitinmehra1017/taskflow-reactjs-internship/actions/runs/39291464514 . Saved REST run/job responses identify the executed commit. CI installs the lockfile on Node 24, runs lint, formatting, coverage tests and the production build, and uploads coverage. It requires no secrets and performs no deployment.

## Dependency audit and build

`npm audit fix` was attempted without force; it found no compatible update that cleared the remaining advisories. The full graph reports 26 affected package entries: 21 moderate and 5 high, zero critical. Production-only audit reports zero vulnerabilities. Remaining findings affect development/build tooling, including the Webpack development server chain and Jest transitive packages. Proposed breaking changes were not forced into this internship branch. Keep the development server local and review upstream updates before deployment tooling changes. An audit finding is not equivalent to a demonstrated production exploit.

The production build passes with three bundle/performance warnings, recorded in `build.log`. These warnings remain for planned bundle optimization. ESLint and formatting pass. The npm audit command exits nonzero because advisories remain; it is not reported as a clean audit.

## Challenges and future scope

Asynchronous focus changes required waiting until React removed a filtered card before testing whether its trigger still existed. Deterministic deferred requests were needed to test races without network timing. An initially broad status query matched two legitimate live regions; scoping the assertion resolved the test defect. Browser access supported useful responsive and keyboard checks but did not establish independent rendering engines.

Week 6 should address a real assistive-technology and contrast audit, independent browser engines, production bundle optimization, dependency migration review and deployment preparation. No deployment, main-branch merge or new future-week feature is included here.

## Reproduction

Use Node 24 and the committed lockfile. Run `npm ci`, `npm test -- --watch=false --coverage`, `npm run lint`, `npm run format:check`, `npm run build` and `npm audit`. Start the app with `npm start`, then open http://localhost:3000 . `npm run test:a11y` runs the eight automated accessibility tests. See evidence README for logs, screenshots and known limitations.

## Actual regression test example

This test exercises the real task page and state provider; it fails before the focus fix.

```jsx
import { screen, waitFor } from '@testing-library/react';
import { renderApp } from './helpers/renderApp';
import { makeTask, mockRemoteFetch } from './helpers/fixtures';
import { writeTasks } from '../src/services/taskStorage';
const originalFetch = global.fetch;
beforeEach(() => localStorage.clear());
afterEach(() => {
  global.fetch = originalFetch;
});
test('QA-001 completing a task hidden by the current filter moves focus to task results', async () => {
  writeTasks([makeTask()]);
  const { user } = renderApp();
  await user.selectOptions(screen.getByLabelText('Filter by status'), 'pending');
  await user.click(screen.getByRole('button', { name: 'Complete Prepare review' }));
  expect(
    screen.queryByRole('button', { name: 'Reopen Prepare review' }),
  ).not.toBeInTheDocument();
  await waitFor(() =>
    expect(screen.getByRole('heading', { name: 'My tasks' })).toHaveFocus(),
  );
});
```
