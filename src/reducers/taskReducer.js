export function taskReducer(tasks, action) {
  switch (action.type) {
    case 'add':
      return tasks.some((t) => t.id === action.task.id) ? tasks : [action.task, ...tasks];
    case 'update':
      return tasks.map((t) =>
        t.id === action.id
          ? {
              ...t,
              ...action.changes,
              id: t.id,
              createdAt: t.createdAt,
              updatedAt: action.timestamp,
            }
          : t,
      );
    case 'delete':
      return tasks.filter((t) => t.id !== action.id);
    case 'toggle':
      return tasks.map((t) =>
        t.id === action.id
          ? {
              ...t,
              status: t.status === 'completed' ? 'pending' : 'completed',
              updatedAt: action.timestamp,
            }
          : t,
      );
    default:
      return tasks;
  }
}
