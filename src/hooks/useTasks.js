import { use } from 'react';
import { TaskContext } from '../context/TaskContext';
export function useTasks() {
  const context = use(TaskContext);
  if (!context) throw new Error('useTasks requires TaskProvider');
  return context;
}
