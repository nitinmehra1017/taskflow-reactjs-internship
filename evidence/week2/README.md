# Week 2 verification evidence

Collected on 19 October 2026 for the existing TaskFlow repository. All images are genuine browser captures. Logs are actual command output; failures and warnings are retained. Week 1 reports and evidence remain historical records.

## Executed commands

| Command | Observed result | Evidence |
| --- | --- | --- |
| `npm install --save-dev sass sass-loader jest babel-jest jest-environment-jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom --no-fund --no-audit` | Exit 0; dependencies installed | install.log |
| `npm ci --no-fund --no-audit` | Exit 0; 890 packages installed | clean-install.log |
| `npm ls --depth=0` and runtime versions | Exit 0; Node 24.22.0, npm 11.19.1; direct tree resolves | environment.log |
| `npm test -- --json --outputFile=evidence/week2/jest-results.json` | Exit 0; 2 suites, 33 tests passed, 0 failed | tests.log and jest-results.json |
| `npm run lint` | Exit 0; 0 warnings | lint.log |
| `npm run format` | Exit 0 | format.log |
| `npm run format:check` | Exit 0; matched files use Prettier style | format-check.log |
| `npm run build` | Exit 0; 3 Webpack size/performance warnings | build.log |
| `npm start` | Server started on 127.0.0.1:3000; development compilation succeeded | dev-server.log |

The build retains the 250 KiB vendor asset warning and approximately 310 KiB entrypoint warning. These are warnings, not build failures. Dependency installation reported transitive deprecations for uuid, whatwg-encoding and glob, plus notices about optional/native install scripts. Sass and the test suite ran despite those notices. No security audit or vulnerability-free claim is made.

## Automated behavior coverage

The 33 Jest tests use jsdom, React Testing Library and user-event. They cover all Button variants and sizes, keyboard activation, disabled/loading behavior, controlled Input, labels and description/error associations, unique/supplied IDs, required/disabled Select behavior, optional Card regions, every Badge variant, Alert announcement opt-in and dismissal, Modal semantics and both Tab boundaries, Escape, focus restoration, initial focus, programmatic focus containment, backdrop behavior, scroll/inert cleanup, showcase validation and loading, route rendering, active navigation, page titles and route focus.

These tests do not prove visual layout, the full native accessibility tree, native menu implementation, or actual screen-reader announcements. There are no snapshot tests.

## Browser and viewport observations

Tested using the **ChatGPT in-app browser on macOS** through the browser automation tool. A browser engine/version was not collected; Chrome, Firefox, Safari, real iOS and Android compatibility are not claimed.

| Viewport in CSS pixels | Observed page width | Outcome |
| --- | ---: | --- |
| Desktop 1440 × 1000 | 1440 | No horizontal overflow; two-column component layout |
| Tablet 768 × 1024 | 768 | No horizontal overflow; single-column component layout |
| Mobile 390 × 844 | 390 | No horizontal overflow; wrapped navigation and controls |

Some card/select captures use the browser's default 1280 × 720 viewport after a new tab was created. Screenshot dimensions below are read from the saved image files, rather than inferred from a previous viewport setting.

Actual browser checks passed: primary button activation with Enter; loading button disables and becomes enabled after completion; empty-name validation exposes the error and focuses the field; valid input shows feedback; native select updates the chosen priority; disabled controls remain disabled; alert dismissal removes the example and focuses its restore button; restoration displays it again. The modal opens, focuses its close control, wraps Tab and Shift+Tab, closes with Escape, returns focus to the opener, locks scrolling, and marks the background inert. Modal validation and successful confirmation were exercised. The mobile modal fits the viewport. Overview, Tasks, Settings and unknown-route recovery rendered their expected headings, and route navigation moved focus to main.

Final browser error-log query returned an empty array after fixing the WebSocket host mismatch. This is a scoped observation for the tested final tab, not a guarantee about every browser or future session.

## Failures and fixes

1. Initial lint failed with two React Hooks immutability errors because the portal element's dataset was changed after it was placed in React state. Initialization moved into the element creation callback; subsequent lint passed.
2. Reinstalling dependencies while a dev server watched node_modules interrupted that server. A fresh server restart after installation restored compilation. Later application checks used the restarted server.
3. Browser access was initially unavailable, then enabled by the user. An interrupted automation session required reopening the preview. A mobile full-page capture was interrupted; the supplied mobile viewport captures are genuine successful captures.
4. Browser console inspection found `Invalid Host/Origin header` from the hot-reload client connecting through 127.0.0.1 while the page used localhost. `client.webSocketURL: 'auto://0.0.0.0:0/ws'` now derives the socket origin from the page, following the [Webpack documentation](https://webpack.js.org/configuration/dev-server/#websocketurl). Host checks remain enabled. Initial error logs are retained; the final fresh-tab query returned no errors.
5. The native Terminal app was unavailable to computer use. Command-output screenshots are explicitly labeled **browser views of verbatim log files**, not Terminal screenshots. A temporary local HTML view was removed after capture; no evidence viewer was added to the product.

## Screenshot inventory

| File | Actual image dimensions | Contents |
| --- | --- | --- |
| showcase-desktop.jpg | 1440 × 2424 | Full component page |
| showcase-desktop-viewport.jpg | 1440 × 1000 | Desktop page introduction and live controls |
| button-variants.jpg | 1440 × 1000 | Button priorities, sizes and states |
| input-validation.jpg | 1440 × 1000 | Invalid input, helper text and error |
| cards-and-badges.jpg | 1280 × 720 | Modal preview, card compositions and badges |
| selects-and-alerts.jpg | 1280 × 720 | Selected native option and alert variants |
| modal-open-desktop.jpg | 1440 × 1000 | Open dialog on desktop |
| showcase-tablet.jpg | 768 × 3751 | Full tablet layout |
| showcase-mobile.jpg | 390 × 844 | Mobile introduction and navigation |
| mobile-controls.jpg | 390 × 844 | Wrapped controls on mobile |
| modal-open-mobile.jpg | 390 × 844 | Open dialog on mobile |
| dashboard-mobile.jpg | 390 × 844 | Existing dashboard on mobile |
| command-output-summary.jpg | 1440 × 1000 | Browser view of captured lint, formatting and test logs |
| command-output-build.jpg | 1440 × 1000 | Browser view of production-build output |
| command-output-full.jpg | See screenshot-metadata.json | Full browser rendering of recorded command output |

browser-console-errors-initial.json retains the observed development-socket failures. browser-console-errors-final.json contains the final empty error-log result. screenshot-metadata.json records dimensions and hashes for genuine image files.

## Remaining limits

No full WCAG conformance, screen-reader, real-device, cross-browser, 200% zoom, or operating-system reduced-motion preference audit was performed. Reduced-motion behavior is implemented in source. The modal API supports one active dialog at a time; nested dialogs, iframe/shadow-root focus and body siblings inserted while open are documented limitations. Native select menus vary by browser/OS. A native Terminal screenshot remains unavailable; the actual text logs and labeled browser log captures are supplied instead.

The Word report was rendered and reviewed as 10 pages. An image wrap that caused a blank page was corrected; the final modal figure is proportional, and every final page was inspected or confirmed pixel-identical to an inspected page. The work allocation totals 3 + 4 + 6 + 6 + 4 + 4 + 8 = 35 planned hours. The portal description contains 268 words. Report render pages are ignored internal artifacts and are not application screenshots. Publication and commit details are recorded in git-status.txt after finalization.
