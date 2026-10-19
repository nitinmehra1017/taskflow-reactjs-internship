import { Input, Select, Button } from '../ui';
export default function RemoteTaskFilters({ filters, onFilter, onClear, users }) {
  return (
    <section className="remote-filters panel" aria-label="Filter remote tasks">
      <Input
        label="Search remote tasks"
        type="search"
        placeholder="Find a task title"
        value={filters.search}
        onChange={(event) => onFilter('search', event.target.value)}
      />
      <Select
        label="Completion status"
        value={filters.completion}
        onChange={(event) => onFilter('completion', event.target.value)}
        options={[
          { value: '', label: 'All statuses' },
          { value: 'pending', label: 'Pending' },
          { value: 'completed', label: 'Completed' },
        ]}
      />
      <Select
        label="Remote user"
        value={filters.userId}
        onChange={(event) => onFilter('userId', event.target.value)}
        options={[
          { value: '', label: 'All users' },
          ...users.map((user) => ({ value: String(user.id), label: user.name })),
        ]}
      />
      <Button variant="outline" onClick={onClear}>
        Clear filters
      </Button>
    </section>
  );
}
