import { Card, Badge, Button } from '../ui';
export default function RemoteTaskCard({ todo, user, imported, onImport }) {
  return (
    <li>
      <Card
        className="remote-card"
        title={todo.title}
        footer={
          <Button
            size="sm"
            variant={imported ? 'outline' : 'secondary'}
            disabled={imported}
            onClick={() => onImport(todo)}
            aria-label={
              imported
                ? `Imported remote task ${todo.id}`
                : `Import remote task ${todo.id}`
            }
          >
            {imported ? 'Imported' : 'Import local copy'}
          </Button>
        }
      >
        <div className="task-badges">
          <Badge variant="information">REMOTE #{todo.id}</Badge>
          <Badge variant={todo.completed ? 'success' : 'neutral'}>
            {todo.completed ? 'Completed' : 'Pending'}
          </Badge>
        </div>
        <p className="remote-owner">
          {user.name}
          <span>@{user.username}</span>
        </p>
      </Card>
    </li>
  );
}
