# Week 1 evidence

Evidence collected on **19 October 2026** for TaskFlow. The files in this directory are actual tool/command outputs. No application screenshot, terminal screenshot, or successful browser interaction has been invented.

## Executed verification

| Action | Observed result | Evidence |
| --- | --- | --- |
| Initial npm dependency installation | Succeeded; dependency migration replaced unsupported ESLint 9 | `dependency-install.log` records the migration output |
| `npm ci --cache /private/tmp/taskflow-npm-cache --no-fund --no-audit` | Exit 0; clean lockfile installation, 605 packages | `clean-install.log` |
| `node --version`, `npm --version`, `git --version`, `npm ls --depth=0` | Node 24.19.0, npm 11.21.1, Git 2.50.1; dependency tree resolves | `environment.log` |
| `npm run format` | Exit 0; supported source/docs formatted | `format.log` |
| `npm run lint` | Exit 0; zero warnings | `lint.log` |
| `npm run format:check` | Exit 0; all matched files use Prettier style | `format-check.log` |
| `npm run build` | Exit 0; production output generated with three size/performance warnings | `build.log` |
| `npm start` | Webpack dev server announced http://127.0.0.1:3000/ and compiled successfully | `dev-server.log` |
| Local HTTP request from sandbox | Connection failed; not a successful HTTP verification | Recorded as a limitation below |
| Application browser inspection | Not performed; browser origin permission declined | No application screenshot is supplied |

The initial server attempt hit sandbox `EPERM`; the authorized retry successfully started and compiled. The sandbox HTTP probe could not reach that server. Browser-origin access was then declined, and no alternate browser or HTTP workaround was attempted. Therefore **HTTP response, rendered UI, navigation behavior, responsive appearance, and browser-console health remain unverified**. Source review and successful builds do not substitute for those checks.

The owned development server was stopped after verification. Restart it with `npm start` when ready to capture evidence. `project-structure.txt` is a real Git-generated file inventory, not a screenshot.

## Runtime setup

The shell initially had no node/npm on PATH. A bundled Node runtime was available at `/Users/aditimehra/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node`. npm 11 was installed under `/private/tmp/taskflow-tooling` with the bundled pnpm; project dependencies were installed and locked using npm only.

The temporary authoring PATH was:

```bash
export PATH='/Users/aditimehra/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/private/tmp/taskflow-tooling/node_modules/.bin:'"$PATH"
```

This temporary npm location is environment-specific. A normal Node.js 24 installation provides npm; users should follow the README rather than depend on temporary files. The npm clean-install warning concerns transitive `uuid@8` from the dev-server dependency tree, plus an unapproved optional fsevents install script. These warnings did not prevent installation or compilation. No npm audit was executed, so no vulnerability-free claim is made.

## Screenshots still needed

Browser access to both GitHub and localhost was declined. The native Terminal app was also unavailable to the computer-use tool for safety reasons. As a result, screenshot capabilities were not usable for this task. Text logs are genuine supplementary evidence; they are not screenshots.

Capture these after allowing the necessary local access:

1. `application-desktop.png`: the running Overview route at a desktop viewport, with URL visible.
2. `application-mobile.png`: the running Overview route at approximately 390px wide; check no horizontal overflow.
3. `tasks-and-settings.png`: task preview and setup route, including direct navigation/reload.
4. `terminal-setup.png`: actual Node/npm versions and successful `npm ci` output.
5. `terminal-verification.png`: actual successful lint, format check, and production build output, retaining warnings.
6. `project-structure.png`: the real project tree in an editor or terminal, excluding node_modules/dist.

Also complete keyboard navigation/skip-link checks, route focus/title checks, 200% zoom, unknown-route recovery, and browser-console review. Record observed results, not expectations.

## Report QA

The Word document was rendered as 13 pages with the bundled document renderer. Every page image was inspected; a title-style border and numeric table alignment were corrected, and the document was rendered again. Only pages 1 and 11 changed, and both revised images were inspected. Report page images are ignored internal QA artifacts and are not evidence that the React application ran in a browser. The final report contains a checked work allocation of 4 + 5 + 6 + 5 + 6 + 3 + 6 = 35 planned hours. The submission-description.txt file contains 300 words.
