const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const phase = process.argv[2];
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const out = `${root}/evidence/week6/${phase}`;
const lh = process.env.LIGHTHOUSE_CLI;
if (!lh || !['baseline', 'optimized'].includes(phase))
  throw new Error(
    'Set LIGHTHOUSE_CLI to the installed Lighthouse CLI and pass baseline or optimized. Use a separate checkout for a new baseline.',
  );
for (const mode of ['mobile', 'desktop'])
  for (const [route, name] of [
    ['/', 'dashboard'],
    ['/tasks', 'tasks'],
    ['/components', 'components'],
    ['/explore', 'explore'],
  ])
    for (let run = 1; run <= 3; run++) {
      const base = `${out}/${name}-${mode}-${run}`;
      const args = [
        lh,
        `http://localhost:4173${route}`,
        '--chrome-flags=--headless',
        '--only-categories=performance,accessibility',
        '--output=json',
        '--output=html',
        `--output-path=${base}`,
        '--quiet',
      ];
      if (mode === 'desktop') args.push('--preset=desktop');
      const p = spawnSync(process.execPath, args, { encoding: 'utf8', timeout: 120000 });
      fs.writeFileSync(base + '.log', p.stdout + '\n' + p.stderr);
      console.log(phase, name, mode, run, 'exit', p.status);
      if (p.status !== 0) process.exit(p.status || 1);
    }
