# TaskFlow

TaskFlow is a React task management dashboard completed across six weeks of the YuvaIntern Junior ReactJS Developer Internship. The final implementation is on **week-6-performance-accessibility**; the repository default main branch has not been merged.

The application supports local task creation, editing, completion/reopening, confirmed deletion, combined search and filters, six derived dashboard statistics, validated localStorage persistence and remote task imports. It preserves the forest-green, soft-lime and neutral design system and seven reusable components.

## Install and run

Use Node 24 and npm 10 or later. Node 22.14+ is also declared compatible; verification used Node 24.22.0 and npm 11.19.1. Git and a current browser are required. `.nvmrc` selects Node 24.

```bash
git clone --branch week-6-performance-accessibility https://github.com/nitinmehra1017/taskflow-reactjs-internship.git
cd taskflow-reactjs-internship
npm ci
npm start
```

Open [localhost:3000](http://localhost:3000). The development server binds to 127.0.0.1. Stop it with Ctrl+C. No environment secrets or backend are required.

For production verification:

```bash
npm run build
npm run preview
```

Open [localhost:4173](http://localhost:4173). The local preview serves SPA routes with gzip negotiation, immutable content-hashed asset caching and no-cache HTML. It is a verification server, not a hosted production deployment. `PORT=4175 npm run preview` selects another local port.

## Development commands

| Command                     | Purpose                                                |
| --------------------------- | ------------------------------------------------------ |
| `npm start`                 | Webpack development server with hot updates            |
| `npm run build`             | Production assets and source maps in dist/             |
| `npm run preview`           | Serve the built application locally                    |
| `npm run lint`              | ESLint flat configuration with zero warnings allowed   |
| `npm run format`            | Apply Prettier formatting                              |
| `npm run format:check`      | Check formatting without changing files                |
| `npm test -- --watch=false` | Execute Jest serially                                  |
| `npm run test:watch`        | Watch tests during development                         |
| `npm run test:ci`           | Tests with full application source coverage            |
| `npm run test:a11y`         | Existing automated route/primitive accessibility suite |
| `npm audit`                 | Review dependency findings; currently exits nonzero    |

## Features and routes

- `/`: dashboard with statistics derived from actual local task state.
- `/tasks`: validated task CRUD, description/date/priority/status, search, combined filters and persistence feedback.
- `/components`: interactive Button, Input, Modal, Card, Badge, Select and Alert showcase.
- `/explore`: live JSONPlaceholder todos/users, loading and error states, retry/refresh, cancellation, stale-response guards, filters, eight-item pagination and duplicate-safe local imports.
- `/settings`: environment and command guide; preferences are explicitly reserved for future work.

Tasks remain on the current device. Imported records become independent local copies and never modify the public API. Storage failures are surfaced; malformed data is validated. There is no authentication, backend synchronization or multi-device service.

## Architecture

```text
src/
  components/       shared UI, shell, task and remote components
  context/          task provider above all routes
  hooks/            storage, task access, filters, requests, route focus
  layouts/          persistent navigation and page layout
  pages/            dashboard plus lazy Tasks, Components, Explore, Settings
  reducers/         pure immutable task state transitions
  services/         local storage and validated Fetch API services
  utils/            task/remote validation and derived statistics
  styles/           shared CSS and SCSS tokens
  assets/           application mark and static assets
scripts/            production preview and performance evidence utilities
tests/              unit, routed workflow, accessibility and regression tests
docs/               six reports, technical guides and final summary
evidence/           genuine results organized by internship week
```

The custom Webpack 5/Babel pipeline handles JSX, CSS/SCSS, assets, source maps and content-hashed output. React Router keeps the shell mounted. React.lazy and Suspense defer four pages; a route boundary supplies reload recovery. TaskProvider owns reducer state and persistence. Services validate remote data before rendering or importing it. Pure derived state avoids duplicate stored statistics.

Use PascalCase for components, camelCase for hooks/utilities, descriptive accessible names, native controls and stable task IDs. Keep reducers pure and effects cancellable. See [coding standards](docs/coding-standards.md) and [architecture](docs/architecture.md).

## Final measured quality

- 119 tests pass across 13 suites. Coverage: statements 97.86%, branches 96.27%, functions 98.46%, lines 98.68%; all four 80% thresholds pass.
- Initial entry JavaScript: 306,434 → 279,437 bytes (8.81% lower). Initial CSS: 32,041 → 20,576 bytes (35.78% lower).
- React Profiler fixture: eight → one remote card update commits per import. This is development/jsdom instrumentation, not a production CPU timing claim.
- Three-run Lighthouse medians: Performance 99 mobile / 100 desktop; Accessibility 100 for all four audited routes and both presets. Several FCP and desktop CLS medians regress; the guide reports every metric and tradeoff.
- All 35 route/viewport measurements passed without overflow at 320, 375, 390, 768, 1024, 1440 and 1920px. Five routes also fit actual 200% Chrome zoom.
- Lint, formatting and production build pass. One combined entry-size warning remains. GitHub Actions runs installation, lint, formatting, coverage and build on week branches.

These accessibility checks do not establish full WCAG compliance. Independent engines, screen readers, exhaustive contrast/state review, reduced-motion emulation and native select arrow-key verification remain pending. Full audit retains 26 development affected-package entries (21 moderate, five high); production-only audit reports zero. Compatible audit fix was attempted without force. Review upstream tooling migrations before deployment approval.

## Documentation and submission

[Final six-week summary](docs/Final_Internship_Project_Summary.md) links every week's implementation and reports. [Week 6 technical guide](docs/Week6_Performance_and_Accessibility.md) contains methods, metrics, WCAG mapping, fixes and limitations. Submit [the Week 6 Word report](docs/ReactJS_Internship_Week6_Performance_and_Accessibility.docx), [final branch URL](https://github.com/nitinmehra1017/taskflow-reactjs-internship/tree/week-6-performance-accessibility) and [submission description](submission-week6-description.txt).

Earlier guides: [Week 1 architecture](docs/architecture.md), [Week 2 components](docs/Week2_Component_Library.md), [Week 3 state](docs/Week3_State_Management_and_Hooks.md), [Week 4 API](docs/Week4_API_Integration_and_Data_Handling.md), [Week 5 QA](docs/Week5_Testing_and_Code_Quality.md). All six Word reports remain in docs/.

## Troubleshooting and future scope

If installation fails, confirm Node/npm versions and use the committed lockfile with npm ci. If a port is occupied, stop the earlier server or choose another preview PORT. For a blank direct route, use the supplied SPA preview rather than a file URL. A stale chunk error offers Reload this page; preserve old deployed hashed assets during future release transitions. If the public API fails, check the network and use Retry; local tasks continue independently.

Storage restrictions or quota errors can prevent persistence: read the displayed warning and avoid clearing browser data without exporting important tasks. Source maps and coverage output are local build artifacts and ignored by Git. Never commit .env secrets, node_modules or dist.

Future work includes deployment preparation, field performance monitoring, lower entry budgets, compatible dependency migrations, independent-engine and assistive-technology testing, and optional backend synchronization. Those features are not claimed as delivered.
