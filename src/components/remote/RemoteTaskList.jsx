import { Card } from '../ui';
import RemoteTaskCard from './RemoteTaskCard';
import { remoteSourceId } from '../../utils/remoteTaskValidation';
export default function RemoteTaskList({ todos, usersById, importedIds, onImport }) {
  if (!todos.length)
    return (
      <Card title="No remote tasks match">
        <p>Try another search or use Clear filters to see all remote tasks.</p>
      </Card>
    );
  return (
    <ul className="task-list remote-list" aria-label="Remote tasks">
      {todos.map((todo) => (
        <RemoteTaskCard
          key={todo.id}
          todo={todo}
          user={usersById.get(todo.userId)}
          imported={importedIds.has(remoteSourceId(todo.id))}
          onImport={onImport}
        />
      ))}
    </ul>
  );
}
