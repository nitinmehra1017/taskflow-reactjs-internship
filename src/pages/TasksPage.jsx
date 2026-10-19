import { Link } from 'react-router-dom';
import PageHeading from '../components/PageHeading';
import Icon from '../components/Icon';

export default function TasksPage() {
  return (
    <>
      <PageHeading eyebrow="A LITTLE STRUCTURE GOES A LONG WAY" title="Your task space.">
        A home for everything you want to move forward.
      </PageHeading>
      <section className="panel tasks-empty" aria-labelledby="tasks-empty-title">
        <span className="subtle-badge">WEEK 1 PREVIEW</span>
        <div className="empty-icon large">
          <Icon name="tasks" size={40} />
        </div>
        <h2 id="tasks-empty-title">Great things start with a first task.</h2>
        <p>
          The workspace is ready. Task creation, editing, and completion are planned for
          Week 3. This starter does not store task data yet.
        </p>
        <Link to="/" className="button button-dark">
          Back to overview
          <Icon name="arrow" size={17} />
        </Link>
      </section>
      <section aria-labelledby="planned-title">
        <h2 className="section-title" id="planned-title">
          On the drawing board
        </h2>
        <div className="planned-grid">
          {[
            ['03', 'Task essentials', 'Create, edit, complete, and remove tasks.'],
            ['03', 'State & storage', 'Keep tasks across visits with local storage.'],
            ['04', 'Search & filters', 'Find your focus by status and priority.'],
          ].map(([week, title, description]) => (
            <article className="panel planned-card" key={week}>
              <span className="eyebrow">WEEK {week}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
