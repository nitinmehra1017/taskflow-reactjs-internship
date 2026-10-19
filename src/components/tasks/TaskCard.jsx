import { memo } from 'react';
import { Card, Badge, Button } from '../ui';
import { statusLabel } from '../../utils/taskValidation';
function TaskCard({ task, onEdit, onDelete, onToggle }) {
  return (
    <li>
      <Card
        title={task.title}
        className="task-card"
        footer={
          <div className="task-actions">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onToggle(task.id)}
              aria-label={`${task.status === 'completed' ? 'Reopen' : 'Complete'} ${task.title}`}
            >
              {task.status === 'completed' ? 'Reopen' : 'Complete'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(task.id)}
              aria-label={`Edit ${task.title}`}
            >
              Edit
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => onDelete(task.id)}
              aria-label={`Delete ${task.title}`}
            >
              Delete
            </Button>
          </div>
        }
      >
        <div className="task-badges">
          {task.sourceId && <Badge variant="information">Imported local copy</Badge>}
          <Badge variant={task.status === 'completed' ? 'success' : 'neutral'}>
            {statusLabel(task.status)}
          </Badge>
          <Badge variant={task.priority === 'high' ? 'warning' : 'information'}>
            {task.priority} priority
          </Badge>
        </div>
        {task.description && <p className="task-description">{task.description}</p>}
        {task.dueDate && (
          <p className="task-date">
            Due <time dateTime={task.dueDate}>{task.dueDate}</time>
          </p>
        )}
      </Card>
    </li>
  );
}
export default memo(TaskCard);
