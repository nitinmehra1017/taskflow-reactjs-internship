import { ApiError, getJson } from './apiClient';
import { validateRemoteData } from '../utils/remoteTaskValidation';
export async function fetchRemoteTasks({ signal } = {}) {
  const [todos, users] = await Promise.all([
    getJson('/todos', { signal }),
    getJson('/users', { signal }),
  ]);
  if (!validateRemoteData(todos, users))
    throw new ApiError(
      'JSONPlaceholder returned unexpected task or user data. Please try again.',
      'validation',
    );
  // Retain only fields the explorer uses; user details never enter local task records.
  return {
    todos: todos.map(({ id, userId, title, completed }) => ({
      id,
      userId,
      title,
      completed,
    })),
    users: users.map(({ id, name, username }) => ({ id, name, username })),
  };
}
