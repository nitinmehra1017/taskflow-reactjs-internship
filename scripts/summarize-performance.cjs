const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const evidence = path.join(root, 'evidence/week6');
const median = (values) => values.sort((a, b) => a - b)[Math.floor(values.length / 2)];
const summaries = {};
for (const phase of ['baseline', 'optimized']) {
  const rows = [];
  for (const mode of ['mobile', 'desktop'])
    for (const route of ['dashboard', 'tasks', 'components', 'explore']) {
      const reports = [1, 2, 3].map((run) =>
        JSON.parse(
          fs.readFileSync(
            path.join(evidence, phase, `${route}-${mode}-${run}.report.json`),
          ),
        ),
      );
      if (reports.some((report) => report.runtimeError))
        throw new Error('Lighthouse runtime error in ' + route);
      const metric = (id) =>
        median(reports.map((report) => report.audits[id].numericValue));
      const resources = reports.map(
        (report) => report.audits['network-requests'].details.items,
      );
      rows.push({
        route,
        mode,
        performance: median(
          reports.map((report) => report.categories.performance.score * 100),
        ),
        accessibility: median(
          reports.map((report) => report.categories.accessibility.score * 100),
        ),
        fcpMs: metric('first-contentful-paint'),
        lcpMs: metric('largest-contentful-paint'),
        tbtMs: metric('total-blocking-time'),
        cls: metric('cumulative-layout-shift'),
        speedIndexMs: metric('speed-index'),
        transferredBytes: median(
          resources.map((items) =>
            items.reduce((sum, item) => sum + (item.transferSize || 0), 0),
          ),
        ),
        requests: median(resources.map((items) => items.length)),
        failedAccessibilityAudits: [
          ...new Set(
            reports.flatMap((report) =>
              report.categories.accessibility.auditRefs
                .filter((ref) => report.audits[ref.id].score === 0)
                .map((ref) => ref.id),
            ),
          ),
        ],
      });
    }
  const stats = JSON.parse(
    fs.readFileSync(path.join(evidence, phase, 'webpack-stats.json')),
  );
  const entryAssets = stats.entrypoints.main.assets.map((asset) => asset.name);
  const assets = stats.assets
    .filter((asset) => !asset.name.endsWith('.map'))
    .map(({ name, size }) => ({
      name,
      bytes: size,
      initial: entryAssets.includes(name),
    }));
  summaries[phase] = {
    lighthouse: rows,
    bundle: {
      assets,
      initialJsBytes: assets
        .filter((asset) => asset.initial && asset.name.endsWith('.js'))
        .reduce((sum, asset) => sum + asset.bytes, 0),
      initialCssBytes: assets
        .filter((asset) => asset.initial && asset.name.endsWith('.css'))
        .reduce((sum, asset) => sum + asset.bytes, 0),
      totalJsBytes: assets
        .filter((asset) => asset.name.endsWith('.js'))
        .reduce((sum, asset) => sum + asset.bytes, 0),
      warnings: stats.warningsCount,
    },
  };
}
const percent = (before, after) =>
  before === 0 ? null : Number((((after - before) / before) * 100).toFixed(2));
const comparison = {
  ...summaries,
  changes: {
    initialJsPercent: percent(
      summaries.baseline.bundle.initialJsBytes,
      summaries.optimized.bundle.initialJsBytes,
    ),
    initialCssPercent: percent(
      summaries.baseline.bundle.initialCssBytes,
      summaries.optimized.bundle.initialCssBytes,
    ),
    lighthouse: summaries.baseline.lighthouse.map((before, index) => {
      const after = summaries.optimized.lighthouse[index];
      return {
        route: before.route,
        mode: before.mode,
        fcpPercent: percent(before.fcpMs, after.fcpMs),
        lcpPercent: percent(before.lcpMs, after.lcpMs),
        tbtPercent: percent(before.tbtMs, after.tbtMs),
        clsPercent: percent(before.cls, after.cls),
        speedIndexPercent: percent(before.speedIndexMs, after.speedIndexMs),
        transferredPercent: percent(before.transferredBytes, after.transferredBytes),
      };
    }),
  },
};
fs.writeFileSync(
  path.join(evidence, 'comparison.json'),
  JSON.stringify(comparison, null, 2) + '\n',
);
console.log(
  JSON.stringify(
    {
      baseline: summaries.baseline.bundle,
      optimized: summaries.optimized.bundle,
      changes: comparison.changes,
    },
    null,
    2,
  ),
);
