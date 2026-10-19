const positiveId = (value) => Number.isSafeInteger(value) && value > 0;
export const validRemoteTodo = (todo) =>
  todo &&
  positiveId(todo.id) &&
  positiveId(todo.userId) &&
  typeof todo.title === 'string' &&
  todo.title.trim().length > 0 &&
  todo.title.length <= 120 &&
  typeof todo.completed === 'boolean';
export const remoteSourceId = (id) => `jsonplaceholder:todo:${id}`;
export function validateRemoteData(todos, users) {
  if (
    !Array.isArray(todos) ||
    todos.length > 1000 ||
    !Array.isArray(users) ||
    users.length > 1000
  )
    return false;
  const userIds = new Set(users.map((user) => user?.id));
  return (
    userIds.size === users.length &&
    new Set(todos.map((todo) => todo?.id)).size === todos.length &&
    users.every(
      (user) =>
        user &&
        positiveId(user.id) &&
        typeof user.name === 'string' &&
        user.name.trim().length > 0 &&
        user.name.length <= 120 &&
        typeof user.username === 'string' &&
        user.username.length <= 120,
    ) &&
    todos.every((todo) => validRemoteTodo(todo) && userIds.has(todo.userId))
  );
}
