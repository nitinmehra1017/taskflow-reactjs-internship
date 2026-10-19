# Six-week development roadmap

| Week | Focus                      | Deliverables and acceptance boundary                                                                                                                                        |
| ---- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Project setup and planning | Custom Webpack/Babel build, React shell, three routes, flat ESLint, Prettier, architecture, Word report, evidence, and local Git commits.                                   |
| 2    | Task essentials            | Task form, task list/card, create/edit/delete/complete behavior, validation, stable task IDs, and user-visible empty/error states.                                          |
| 3    | State and persistence      | Task context/reducer, versioned local-storage service, startup hydration, parse failure recovery, and persistence across reloads.                                           |
| 4    | Search and organization    | Search, status/priority filtering, sorting, optional due dates, basic workspace preferences, and useful derived dashboard statistics.                                       |
| 5    | Tests and accessibility    | Install/configure Jest, jsdom, babel-jest, Testing Library, user-event, and jest-dom; test behaviors, storage boundaries, keyboard flows, and accessible names; fix issues. |
| 6    | Final delivery             | Production-host SPA rewrites, performance review, browser checks, final documentation, deployment, acceptance walkthrough, and demonstration.                               |

## Week 1 allocation

This is a **planned 35-hour work breakdown**, not a claim that the automation session or student attendance lasted 35 hours. Replace or supplement it with the intern's actual time log if required by YuvaIntern.

| Activity                                             | Planned hours | Output                                                        |
| ---------------------------------------------------- | ------------: | ------------------------------------------------------------- |
| Requirements and scope analysis                      |             4 | Week boundaries, acceptance checklist, feature inventory      |
| Environment and dependency setup                     |             5 | Node/npm/Git preparation and lockfile                         |
| Webpack and Babel configuration                      |             6 | Development server, production bundle, CSS/assets/source maps |
| Architecture and component planning                  |             5 | Folder structure, component contracts, future data flow       |
| Responsive shell and routing                         |             6 | Header, navigation, overview, task preview, setup page        |
| Standards, linting, and formatting                   |             3 | Flat ESLint configuration, Prettier, naming and review rules  |
| Verification, evidence, and submission documentation |             6 | Executed checks, screenshots, Word report, submission text    |
| **Total**                                            |        **35** | **Week 1 plan**                                               |

## Testing strategy for later weeks

Use Jest with babel-jest and the existing Babel presets for JSX. Add jsdom, jest-dom, React Testing Library, and user-event; configure CSS and asset mocks in tests. Start with user-visible behavior: form validation, creating/editing/completing/removing a task, navigation, filtering, persistence, and recovery from corrupt stored data. Test pure validation/filtering helpers separately. Prefer role and label queries over implementation details or broad snapshots.

Keep storage tests isolated with a fresh adapter/state per test. Add tests alongside the feature they protect; do not gate this Week 1 submission on tests that have not been implemented. Later CI should use Node 24, `npm ci`, lint, format check, build, and the eventual test script. Manually review keyboard navigation, focus order, 200% zoom, mobile reflow, contrast, and one screen reader. Add automated accessibility checks without claiming they replace manual review.
