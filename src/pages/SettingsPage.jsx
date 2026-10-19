import PageHeading from '../components/PageHeading';
import Icon from '../components/Icon';

const commands = [
  ['npm start', 'Start the development server at localhost:3000'],
  ['npm run build', 'Create an optimized production bundle in dist/'],
  ['npm run lint', 'Check JavaScript, JSX, React, and Hooks rules'],
  ['npm run format', 'Apply the shared formatting conventions'],
  ['npm run format:check', 'Check formatting without changing files'],
  ['npm test', 'Run the component and route behavior tests'],
  ['npm run test:watch', 'Watch and rerun tests while developing'],
];

export default function SettingsPage() {
  return (
    <>
      <PageHeading eyebrow="BUILT TO GROW WITH YOU" title="A thoughtful setup.">
        The development foundation behind your workspace.
      </PageHeading>
      <div className="settings-grid">
        <section className="panel" aria-labelledby="commands-title">
          <div className="panel-heading">
            <h2 id="commands-title">Development commands</h2>
            <Icon name="code" />
          </div>
          <p className="panel-description">Run these from the project directory.</p>
          <dl className="command-list">
            {commands.map(([command, description]) => (
              <div key={command}>
                <dt>
                  <code>{command}</code>
                </dt>
                <dd>{description}</dd>
              </div>
            ))}
          </dl>
        </section>
        <section className="panel stack-panel" aria-labelledby="stack-title">
          <h2 id="stack-title">Under the hood</h2>
          <ul className="stack-list">
            <li>
              <strong>React + JavaScript</strong>
              <span>Reusable interfaces with JSX</span>
            </li>
            <li>
              <strong>Webpack 5 + Babel</strong>
              <span>A custom, transparent build pipeline</span>
            </li>
            <li>
              <strong>React Router</strong>
              <span>A shared shell across four routes</span>
            </li>
            <li>
              <strong>ESLint + Prettier</strong>
              <span>Consistent code from day one</span>
            </li>
          </ul>
          <span className="subtle-badge">PREFERENCES PLANNED FOR WEEK 4</span>
        </section>
      </div>
      <details className="panel setup-details">
        <summary>Before you start</summary>
        <p>
          Use Node.js 24 LTS (or supported Node.js 22.14+) and npm 10 or newer. Install
          dependencies with <code>npm ci</code>, then run <code>npm start</code>. See
          README.md for architecture, troubleshooting, and the six-week plan.
        </p>
      </details>
    </>
  );
}
