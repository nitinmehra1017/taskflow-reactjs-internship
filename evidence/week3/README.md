# Week 3 verification evidence

All JPEG files are genuine captures of the running TaskFlow application or a browser presentation of verbatim command logs. Screenshot dimensions and SHA-256 hashes are recorded in screenshot-metadata.json. No terminal window was fabricated. command-output-browser-view.jpg is explicitly a browser log viewer, not a native Terminal screenshot; its temporary HTML file was removed after capture.

- creation-form.jpg: first task draft and required-title validation feedback.
- edit-task.jpg: populated edit dialog including saved due date.
- populated-list-desktop.jpg: 1440px task list after editing and reopening.
- filters-search.jpg: description search combined with high-priority filter.
- persistence-after-refresh.jpg: saved task and due date after an actual reload.
- dashboard-statistics.jpg: six live statistics from the retained demonstration task.
- delete-confirmation.jpg: 768px delete confirmation with Keep task focused.
- tablet-768.jpg: tablet task layout.
- mobile-390.jpg: task layout after keyboard creation of a disposable mobile test task, subsequently deleted through the confirmation dialog.
- command-output-browser-view.jpg: verbatim command output presentation from the verification run.
- browser-errors.json: captured browser error entries; empty at capture.
- npm-ci.log, tests.log, lint.log, format-check.log, build.log, start.log: actual command output.
- audit.json: actual npm audit result, exit 1 with 26 advisories (21 moderate, 5 high).

Browser checks were representative across 1440, 768 and 390 pixels, not every workflow at every width. The task page document width matched each viewport. These captures do not establish full WCAG conformance or cross-browser compatibility. The current preview retains one task entered for verification; no task data is bundled as application defaults.

The Word report was rendered and every page visually inspected. Render intermediates stay in ignored docs/.rendered and are not submission artifacts. Historical Week 1 and Week 2 evidence remains intact.
