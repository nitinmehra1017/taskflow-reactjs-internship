import { createContext, useCallback, useEffect, useMemo, useReducer } from 'react';
import { taskReducer } from '../reducers/taskReducer';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { taskStatistics } from '../utils/taskStatistics';
import { validateTask } from '../utils/taskValidation';
export const TaskContext = createContext(null);
function clean(values) {
  if (Object.keys(validateTask(values)).length) throw new Error('Invalid task');
  return {
    title: values.title.trim(),
    description: values.description.trim(),
    priority: values.priority,
    status: values.status,
    dueDate: values.dueDate,
  };
}
export function TaskProvider({ children }) {
  const { initialTasks, error, save } = useLocalStorage();
  const [tasks, dispatch] = useReducer(taskReducer, initialTasks);
  useEffect(() => {
    save(tasks);
  }, [tasks, save]);
  const addTask = useCallback((values) => {
    const timestamp = new Date().toISOString();
    dispatch({
      type: 'add',
      task: {
        ...clean(values),
        id: crypto.randomUUID(),
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    });
  }, []);
  const updateTask = useCallback(
    (id, values) =>
      dispatch({
        type: 'update',
        id,
        changes: clean(values),
        timestamp: new Date().toISOString(),
      }),
    [],
  );
  const deleteTask = useCallback((id) => dispatch({ type: 'delete', id }), []);
  const toggleTaskStatus = useCallback(
    (id) => dispatch({ type: 'toggle', id, timestamp: new Date().toISOString() }),
    [],
  );
  const stats = useMemo(() => taskStatistics(tasks), [tasks]);
  const value = useMemo(
    () => ({
      tasks,
      stats,
      storageError: error,
      addTask,
      updateTask,
      deleteTask,
      toggleTaskStatus,
    }),
    [tasks, stats, error, addTask, updateTask, deleteTask, toggleTaskStatus],
  );
  return <TaskContext value={value}>{children}</TaskContext>;
}
