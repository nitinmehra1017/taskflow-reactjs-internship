import { Input, Select, Button } from '../ui';
import { priorities, statuses, statusLabel } from '../../utils/taskValidation';
export default function TaskFilters({ filters, setFilter, resetFilters }) {
  return (
    <section className="task-filters panel" aria-label="Filter tasks">
      <Input
        label="Search tasks"
        type="search"
        value={filters.search}
        onChange={(e) => setFilter('search', e.target.value)}
        placeholder="Title or description"
      />
      <Select
        label="Filter by status"
        value={filters.status}
        onChange={(e) => setFilter('status', e.target.value)}
        options={[
          { value: '', label: 'All statuses' },
          ...statuses.map((value) => ({ value, label: statusLabel(value) })),
        ]}
      />
      <Select
        label="Filter by priority"
        value={filters.priority}
        onChange={(e) => setFilter('priority', e.target.value)}
        options={[
          { value: '', label: 'All priorities' },
          ...priorities.map((value) => ({
            value,
            label: value[0].toUpperCase() + value.slice(1),
          })),
        ]}
      />
      <Button variant="outline" onClick={resetFilters}>
        Clear filters
      </Button>
    </section>
  );
}
