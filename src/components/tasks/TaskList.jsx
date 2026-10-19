import TaskCard from './TaskCard';
import { Card } from '../ui';
export default function TaskList({ tasks, hasTasks, ...actions }) {
  if (!tasks.length)
    return (
      <Card title={hasTasks ? 'No matching tasks' : 'Start with one small step'}>
        <p>
          {hasTasks
            ? 'Try another search or clear your filters.'
            : 'Create your first task and give your plans a place to grow.'}
        </p>
      </Card>
    );
  return (
    <ul className="task-list" aria-label="Tasks">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} {...actions} />
      ))}
    </ul>
  );
}
