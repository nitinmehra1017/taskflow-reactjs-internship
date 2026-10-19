# TaskFlow

**A calmer workspace for focused work.** A real ReactJS starter for Week 1 of the YuvaIntern Junior ReactJS Developer Internship.

TaskFlow will become a personal task management dashboard over six weeks. This submission establishes the development environment, reusable shell, routing, standards, and implementation plan. Task CRUD, persistence, filters, and automated feature tests are deliberately scheduled for later weeks.

## Quick start

Prerequisites: **Node.js 24 LTS** recommended, or maintained Node.js 22.14+, **npm 10+**, Git, and a current browser. `.nvmrc` selects Node 24. If using nvm, run `nvm install && nvm use` first. The lockfile records the exact dependency tree; use `npm ci` for a fresh checkout.

```bash
cd taskflow-reactjs-internship
npm ci
npm start
```

Open [http://localhost:3000](http://localhost:3000). Press Ctrl+C in the server terminal to stop it. The server binds to `127.0.0.1`; it is intended for local development.

This project lives in its own subdirectory and Git repository because the parent workspace already contained an unrelated Expo application. Do not install or run TaskFlow commands from the parent directory.

## Commands

| Command                | Purpose                                                                     |
| ---------------------- | --------------------------------------------------------------------------- |
| `npm start`            | Webpack development server, hot reload, source maps, SPA fallback           |
| `npm run build`        | Optimized, hashed JavaScript and extracted CSS in `dist/`                   |
| `npm run lint`         | ESLint flat configuration with React and Hooks rules; zero warnings allowed |
| `npm run format`       | Apply Prettier to supported project files                                   |
| `npm run format:check` | Verify formatting without rewriting files                                   |

`npm install` was used to resolve the initial lockfile. `npm ci` is recommended for subsequent clean installs. Jest and React Testing Library are **planned, not installed or executed**; there is intentionally no misleading test script.

## Week 1 application

- `/` — overview with foundation cards and a six-week roadmap.
- `/tasks` — an honest empty-state preview describing the coming task features.
- `/settings` — development commands, stack reference, and setup guidance.
- Unknown paths display an accessible 404 page.
- The shell implements navigation links, setup details, route titles, focus management, and mobile layout. Browser acceptance is outstanding. Dashboard numbers describe project structure, not fabricated user activity.

The responsive shell uses a forest-green navigation area, warm neutral background, lime accents, custom CSS illustration, and system fonts. It has no external image or font dependency.

## Architecture

```text
taskflow-reactjs-internship/
├── public/index.html
├── src/
│   ├── index.jsx                 # React root and BrowserRouter
│   ├── App.jsx                   # Route definitions
│   ├── assets/                   # Owned SVG brand mark
│   ├── components/               # Sidebar, Header, Icon, StatCard, PageHeading
│   ├── layouts/AppLayout.jsx     # Shared shell and Outlet
│   ├── pages/                    # Dashboard, Tasks, Settings, NotFound
│   ├── hooks/useRouteFocus.js    # Route title and focus behavior
│   ├── context/                  # Documented future state boundary
│   ├── services/                 # Documented future storage boundary
│   ├── utils/                    # Documented future pure helper boundary
│   └── styles/                   # Global tokens, shell, page styles
├── docs/                         # Architecture, standards, roadmap, Word report
├── evidence/                     # Real logs and screenshots
├── babel.config.cjs
├── webpack.config.cjs
├── eslint.config.mjs
├── .prettierrc.json
├── package.json
├── package-lock.json
└── submission-description.txt
```

See [component contracts and architecture](docs/architecture.md), [coding standards](docs/coding-standards.md), and [development roadmap](docs/roadmap.md). Empty future areas contain READMEs rather than speculative providers, API clients, or unused abstractions.

Webpack 5 compiles `.js`/`.jsx` through Babel, loads organized plain CSS through `style-loader` in development, extracts CSS in production, and emits images/fonts through asset modules. HTMLWebpackPlugin generates the HTML entry. Content hashes support caching; `publicPath: '/'` supports root deployment and direct routes. Production source maps are emitted for debugging; choose whether to publish them when planning production deployment in Week 6. Babel uses the automatic JSX runtime and targets supported browsers. ESLint 10 flat configuration uses React X and official React Hooks rules; Prettier owns formatting.

## Accessibility and quality

Use semantic landmarks, one h1 per page, native links and details controls, descriptive navigation, visible keyboard focus, an exposed-on-focus skip link, `aria-current` from NavLink, and decorative SVGs hidden from assistive technology. Route changes update the document title and move focus to main. Layout adapts to narrow screens, and transitions respect reduced-motion preferences. No full WCAG conformance claim is made; the testing strategy includes keyboard, zoom, contrast, screen-reader, and automated audits in later weeks.

Before each commit:

```bash
npm run lint
npm run format:check
npm run build
```

Never commit secrets. Browser code cannot keep secrets, even when environment variables are used. `.gitignore` excludes `.env*` except a deliberate `.env.example`, dependencies, build outputs, coverage, and render intermediates.

## Git and GitHub

The local repository starts on `codex/week-1` with separate implementation and documentation commits. Use short branches such as `codex/task-form`, clear commit messages, and pull requests for future changes. Review the diff and run all checks before merging. Do not force push shared branches.

See [GitHub publishing instructions](docs/github-setup.md) for the exact commands and current publishing status. The parent repository and Expo files must remain separate from this submission.

## Verification and evidence

[evidence/README.md](evidence/README.md) identifies executed checks, genuine output files, browser observations, and screenshot provenance. The Word report is [ReactJS_Internship_Week1_Project_Plan.docx](docs/ReactJS_Internship_Week1_Project_Plan.docx). The submission text is [submission-description.txt](submission-description.txt).

## Troubleshooting

| Symptom                                                   | Resolution                                                                                                                                                                |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `node` or `npm` not found                                 | Install maintained Node.js 24 from the official distribution, then reopen the terminal. The authoring environment used a bundled runtime and temporary npm; see evidence. |
| Engine or syntax error                                    | Check `node --version` and `npm --version`; switch to Node 24 and reinstall with `npm ci`.                                                                                |
| Port 3000 already in use                                  | Stop the other server, or run `npm start -- --port 3001`.                                                                                                                 |
| Direct `/tasks` or `/settings` gives 404 after deployment | Configure the static host to rewrite unknown application routes to `/index.html`. Webpack dev server already does this.                                                   |
| Broken assets below a subpath                             | This build targets the origin root. Before subpath deployment, update Webpack `publicPath` and BrowserRouter `basename` together.                                         |
| Registry/DNS failure                                      | Confirm network access and registry settings; retry the install when connectivity is available. Do not disable TLS.                                                       |
| Prettier check fails                                      | Run `npm run format`, review the diff, and rerun `npm run format:check`.                                                                                                  |
| Changed dependency tree                                   | Commit package.json and package-lock.json together; avoid mixing npm and pnpm lockfiles in this project.                                                                  |

## Six-week roadmap

1. **Foundation:** working setup, shell, architecture, standards, documentation, and evidence.
2. **Task essentials:** reusable task form, cards/list, validation, create/edit/complete/delete behavior.
3. **State and storage:** task context/reducer and a versioned local-storage service with failure handling.
4. **Search and filters:** status/priority filters, sort/search, and basic workspace preferences.
5. **Testing and polish:** Jest, React Testing Library, integration tests, keyboard and accessibility audits.
6. **Final delivery:** performance review, production hosting, acceptance checks, documentation, and demonstration.

TaskFlow is an internship learning project. The current starter has no backend, authentication, collaboration, or durable task data.

## Primary technical references

- [Node.js release support](https://nodejs.org/en/about/previous-releases)
- [Webpack getting started](https://webpack.js.org/guides/getting-started/)
- [ESLint flat configuration](https://eslint.org/docs/latest/use/configure/configuration-files)
- [React documentation](https://react.dev/learn)
- [React Router documentation](https://reactrouter.com/start/declarative/installation)
