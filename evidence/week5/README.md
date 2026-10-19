# Week 5 Evidence

These files retain actual executed results. Final validation logs have the `final` suffix where rerun; historical failures are intentionally preserved.

- `regressions-before-fix.log`: three failed assertions before two focus fixes.
- `regressions-after-fix.log`: the same three assertions passing afterward.
- `initial-query-failure.log`: a separate test-query ambiguity, not an application defect.
- `jest-results.json`, `tests-coverage.log`, `coverage-summary.json`, `coverage-final.json`, `lcov.info`: actual 111-test run and coverage.
- `accessibility.log`: eight executed jest-axe tests.
- `npm-ci-final.log`, `lint-final.log`, `format-check-final.log`, `build-final.log`, `tests-coverage-final.log`, `audit-final.log`: final command outputs.
- `ci-run.json` and `ci-jobs.json`: successful real source-commit GitHub Actions execution, run 39291464514.
- `chrome-responsive-measurements.json`: five routes at 1440, 768 and 390 pixels; expected headings awaited before measurement.
- JPEG files: genuine browser captures. Settings captures show three widths; filtered action captures show fixed focus destinations; mobile capture shows the dialog.
- `browser-failure-harness.txt`: temporary explicit controlled network failure used only for retry evidence. It is not shipped in application source. Successful retry loads the actual remote API.
- `browser-limitations.txt`: access limitations. Chrome and in-app browser surfaces were used; independent rendering engines were not established.

No terminal screenshots are fabricated. Command output is retained as text logs. No screen-reader, independent Safari/Firefox engine, or complete contrast audit is claimed. Hashes in `screenshot-manifest.json` identify captured JPEGs. Reports describe 35 planned hours, not measured attendance.
