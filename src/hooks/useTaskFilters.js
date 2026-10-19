import { useMemo, useState } from 'react';
const empty = { status: '', priority: '', search: '' };
export function useTaskFilters(tasks) {
  const [filters, setFilters] = useState(empty);
  const filteredTasks = useMemo(() => {
    const query = filters.search.trim().toLocaleLowerCase();
    return tasks.filter(
      (task) =>
        (!filters.status || task.status === filters.status) &&
        (!filters.priority || task.priority === filters.priority) &&
        `${task.title} ${task.description}`.toLocaleLowerCase().includes(query),
    );
  }, [tasks, filters]);
  return {
    filters,
    filteredTasks,
    setFilter: (name, value) =>
      setFilters((previous) => ({ ...previous, [name]: value })),
    resetFilters: () => setFilters(empty),
  };
}
