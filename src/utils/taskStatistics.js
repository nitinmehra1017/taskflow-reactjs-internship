export function taskStatistics(tasks) {
  const stats = {
    total: tasks.length,
    completed: 0,
    pending: 0,
    inProgress: 0,
    highPriority: 0,
  };
  for (const task of tasks) {
    if (task.status === 'in-progress') stats.inProgress++;
    else stats[task.status]++;
    if (task.priority === 'high') stats.highPriority++;
  }
  return {
    ...stats,
    completion: tasks.length ? Math.round((stats.completed / tasks.length) * 100) : 0,
  };
}
