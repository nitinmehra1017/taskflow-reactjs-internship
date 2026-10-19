export const statuses = ['pending', 'in-progress', 'completed'];
export const priorities = ['low', 'medium', 'high'];
export const statusLabel = (value) =>
  ({ pending: 'Pending', 'in-progress': 'In progress', completed: 'Completed' })[value];
export function validDate(value) {
  return (
    value === '' ||
    (/^\d{4}-\d{2}-\d{2}$/.test(value) &&
      !Number.isNaN(Date.parse(value)) &&
      new Date(value).toISOString().slice(0, 10) === value)
  );
}
export function validateTask(task) {
  const errors = {};
  if (
    task.sourceId !== undefined &&
    (typeof task.sourceId !== 'string' ||
      !/^jsonplaceholder:todo:[1-9]\d*$/.test(task.sourceId))
  )
    errors.sourceId = 'Invalid remote source.';
  if (typeof task.title !== 'string' || !task.title.trim())
    errors.title = 'Enter a task title.';
  else if (task.title.length > 120) errors.title = 'Use 120 characters or fewer.';
  if (typeof task.description !== 'string' || task.description.length > 2000)
    errors.description = 'Use 2000 characters or fewer.';
  if (!priorities.includes(task.priority)) errors.priority = 'Choose a priority.';
  if (!statuses.includes(task.status)) errors.status = 'Choose a status.';
  if (typeof task.dueDate !== 'string' || !validDate(task.dueDate))
    errors.dueDate = 'Enter a valid date.';
  return errors;
}
export function validTasks(tasks) {
  return (
    Array.isArray(tasks) &&
    new Set(tasks.map((t) => t?.id)).size === tasks.length &&
    new Set(tasks.filter((t) => t?.sourceId).map((t) => t.sourceId)).size ===
      tasks.filter((t) => t?.sourceId).length &&
    tasks.every(
      (t) =>
        t &&
        typeof t.id === 'string' &&
        t.id.length > 0 &&
        !Object.keys(validateTask(t)).length &&
        typeof t.createdAt === 'string' &&
        Number.isFinite(Date.parse(t.createdAt)) &&
        typeof t.updatedAt === 'string' &&
        Number.isFinite(Date.parse(t.updatedAt)),
    )
  );
}
