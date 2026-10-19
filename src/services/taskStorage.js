import { validTasks } from '../utils/taskValidation';
export const TASK_STORAGE_KEY = 'taskflow.tasks.v1';
export function readTasks(key = TASK_STORAGE_KEY) {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return { tasks: [], error: '' };
    const data = JSON.parse(raw);
    if (data.version !== 1 || !validTasks(data.tasks))
      throw new Error('Invalid task data');
    return { tasks: data.tasks, error: '' };
  } catch {
    return {
      tasks: [],
      error:
        'Saved tasks could not be read. Your original storage has been left untouched. Changes stay in memory; automatic saving is disabled for this session.',
    };
  }
}
export function writeTasks(tasks, key = TASK_STORAGE_KEY) {
  try {
    if (!validTasks(tasks)) throw new Error('Invalid tasks');
    window.localStorage.setItem(key, JSON.stringify({ version: 1, tasks }));
    return '';
  } catch {
    return 'Tasks could not be saved on this device. Keep this tab open to retain your changes.';
  }
}
