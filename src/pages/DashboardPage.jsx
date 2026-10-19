import { useTasks } from '../hooks/useTasks';
import { Alert } from '../components/ui';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon';
import PageHeading from '../components/PageHeading';
import StatCard from '../components/StatCard';

const foundations = [
  ['React application', 'Components, JSX, and a shared layout'],
  ['Development workflow', 'Webpack, Babel, ESLint, and Prettier'],
  ['Room to grow', 'Routes and a documented architecture'],
];
const roadmap = [
  'Foundation',
  'UI components',
  'Tasks & storage',
  'Remote API',
  'Testing & polish',
  'Final delivery',
];

export default function DashboardPage() {
  const { stats, storageError } = useTasks();
  return (
    <>
      <div className="heading-row">
        <PageHeading eyebrow="YOUR WORKSPACE, IN FLOW" title="Make room for good work.">
          One place to organize what matters. Let’s start with a solid foundation.
        </PageHeading>
        <span className="week-pill">
          <span className="status-dot" />
          Week 04 of 06
        </span>
      </div>
      <section className="welcome-card" aria-labelledby="welcome-title">
        <div className="welcome-content">
          <span className="tag">THE START OF SOMETHING ORGANIZED</span>
          <h2 id="welcome-title">
            Less scattered.
            <br />
            More in flow.
          </h2>
          <p>
            Your task workspace is taking shape. The foundation is ready for the ideas,
            plans, and progress ahead.
          </p>
          <Link className="button button-dark" to="/tasks">
            Explore task space
            <Icon name="arrow" size={18} />
          </Link>
        </div>
        <div className="flow-art" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="floating-card card-back">
            <span className="art-circle" />
            <span className="art-line" />
          </div>
          <div className="floating-card card-front">
            <span className="art-check">
              <Icon name="check" size={26} />
            </span>
            <div>
              <span className="art-line long" />
              <span className="art-line short" />
            </div>
          </div>
          <span className="art-spark spark-one">✦</span>
          <span className="art-spark spark-two">✦</span>
          <span className="art-dots">···</span>
        </div>
      </section>
      {storageError && (
        <Alert variant="warning" title="Device storage unavailable">
          {storageError}
        </Alert>
      )}
      <section aria-label="Task statistics" className="stats-grid">
        {[
          ['Total tasks', stats.total],
          ['Completed tasks', stats.completed],
          ['Pending tasks', stats.pending],
          ['In-progress tasks', stats.inProgress],
          ['High-priority tasks', stats.highPriority],
          ['Completion', `${stats.completion}%`],
        ].map(([label, value]) => (
          <StatCard
            key={label}
            label={label}
            value={String(value)}
            detail="From your saved task collection"
            icon="tasks"
          />
        ))}
      </section>
      <div className="content-grid">
        <section className="panel foundation-panel" aria-labelledby="foundation-title">
          <div className="panel-heading">
            <h2 id="foundation-title">A strong starting point</h2>
            <span className="subtle-badge">WEEK 1</span>
          </div>
          <p className="panel-description">
            The essentials are in place. Here’s what’s inside.
          </p>
          <ul className="foundation-list">
            {foundations.map(([title, detail]) => (
              <li key={title}>
                <span className="check-circle">
                  <Icon name="check" size={15} />
                </span>
                <div>
                  <h3>{title}</h3>
                  <p>{detail}</p>
                </div>
              </li>
            ))}
          </ul>
          <Link to="/settings" className="text-link">
            See the development setup
            <Icon name="arrow" size={17} />
          </Link>
        </section>
        <section className="panel task-preview" aria-labelledby="task-preview-title">
          <div className="panel-heading">
            <h2 id="task-preview-title">Your focus today</h2>
            <span className="subtle-badge">WEEK 3</span>
          </div>
          <div className="empty-icon">
            <Icon name="tasks" size={30} />
          </div>
          <h3>A clear space. A fresh start.</h3>
          <p>
            Create tasks, set priorities, and track completion. Your changes stay on this
            device when storage is available.
          </p>
          <Link to="/tasks" className="text-link">
            Manage your tasks
            <Icon name="arrow" size={17} />
          </Link>
        </section>
      </div>
      <section className="roadmap-panel" aria-labelledby="roadmap-title">
        <div className="panel-heading">
          <h2 id="roadmap-title">Small steps. Steady progress.</h2>
          <span className="roadmap-caption">THE SIX-WEEK JOURNEY</span>
        </div>
        <ol className="roadmap-list">
          {roadmap.map((label, index) => (
            <li key={label} className={index === 3 ? 'current-step' : ''}>
              <span className="step-number">0{index + 1}</span>
              <span>{label}</span>
              {index === 3 && <small>Current week</small>}
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
