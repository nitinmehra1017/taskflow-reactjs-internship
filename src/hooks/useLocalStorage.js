import { useCallback, useState } from 'react';
import { readTasks, writeTasks, TASK_STORAGE_KEY } from '../services/taskStorage';
/** A failed read preserves the original bytes and disables automatic writes. */
export function useLocalStorage(key = TASK_STORAGE_KEY) {
  const [initial] = useState(() => readTasks(key));
  const [error, setError] = useState(initial.error);
  const save = useCallback(
    (tasks) => {
      if (tasks === initial.tasks || initial.error) return;
      setError(writeTasks(tasks, key));
    },
    [initial, key],
  );
  return { initialTasks: initial.tasks, error, save };
}
