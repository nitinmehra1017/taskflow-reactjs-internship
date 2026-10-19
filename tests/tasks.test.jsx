import {
  render,
  screen,
  within,
  renderHook,
  act,
  fireEvent,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { StrictMode } from 'react';
import App from '../src/App';
import { TaskProvider } from '../src/context/TaskContext';
import { useTasks } from '../src/hooks/useTasks';
import { useTaskFilters } from '../src/hooks/useTaskFilters';
import { taskReducer } from '../src/reducers/taskReducer';
import { readTasks, writeTasks, TASK_STORAGE_KEY } from '../src/services/taskStorage';
import { taskStatistics } from '../src/utils/taskStatistics';
import { validateTask } from '../src/utils/taskValidation';
const values = {
  title: 'Plan launch',
  description: 'Write the brief',
  priority: 'high',
  status: 'pending',
  dueDate: '2026-11-01',
};
const task = {
  ...values,
  id: 'one',
  createdAt: '2026-10-19T10:00:00.000Z',
  updatedAt: '2026-10-19T10:00:00.000Z',
};
beforeEach(() => localStorage.clear());
async function app() {
  let view;
  await act(async () => {
    view = render(
      <MemoryRouter initialEntries={['/tasks']}>
        <App />
      </MemoryRouter>,
    );
  });
  return view;
}
const wrapper = ({ children }) => (
  <StrictMode>
    <TaskProvider>{children}</TaskProvider>
  </StrictMode>
);
test('complete task lifecycle, validation, accessible dialogs and shared dashboard statistics', async () => {
  const user = userEvent.setup();
  await app();
  await user.click(screen.getByRole('button', { name: 'New task' }));
  await user.click(screen.getByRole('button', { name: 'Save task' }));
  expect(screen.getByLabelText(/Task title/)).toHaveFocus();
  expect(screen.getByLabelText(/Task title/)).toHaveAttribute('aria-invalid', 'true');
  await user.type(screen.getByLabelText(/Task title/), values.title);
  await user.type(screen.getByLabelText('Description'), values.description);
  await user.selectOptions(screen.getByLabelText('Priority'), 'high');
  fireEvent.input(screen.getByLabelText('Due date'), { target: { value: '2026-11-01' } });
  await user.click(screen.getByRole('button', { name: 'Save task' }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.getByText('2026-11-01')).toBeInTheDocument();
  expect(JSON.parse(localStorage.getItem(TASK_STORAGE_KEY)).tasks).toHaveLength(1);
  await user.click(screen.getByRole('button', { name: 'Edit Plan launch' }));
  expect(screen.getByLabelText(/Task title/)).toHaveValue(values.title);
  await user.clear(screen.getByLabelText(/Task title/));
  await user.type(screen.getByLabelText(/Task title/), 'Ship launch');
  await user.click(screen.getByRole('button', { name: 'Save task' }));
  expect(screen.getAllByRole('heading', { name: 'Ship launch' })).toHaveLength(1);
  await user.click(screen.getByRole('button', { name: 'Complete Ship launch' }));
  expect(
    within(screen.getByRole('list', { name: 'Tasks' })).getByText('Completed'),
  ).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Reopen Ship launch' }));
  expect(
    within(screen.getByRole('list', { name: 'Tasks' })).getByText('Pending'),
  ).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Delete Ship launch' }));
  expect(screen.getByRole('button', { name: 'Keep task' })).toHaveFocus();
  await user.keyboard('{Escape}');
  expect(screen.getByRole('button', { name: 'Delete Ship launch' })).toHaveFocus();
  await user.click(screen.getByRole('link', { name: 'Overview' }));
  const stats = screen.getByRole('region', { name: 'Task statistics' });
  expect(within(stats).getByText('Total tasks').closest('article')).toHaveTextContent(
    '1',
  );
  expect(
    within(stats).getByText('High-priority tasks').closest('article'),
  ).toHaveTextContent('1');
  await user.click(screen.getByRole('link', { name: 'Tasks' }));
  await user.click(screen.getByRole('button', { name: 'Delete Ship launch' }));
  await user.click(screen.getByRole('button', { name: 'Delete permanently' }));
  expect(screen.queryByRole('heading', { name: 'Ship launch' })).not.toBeInTheDocument();
});
test('UI filters combine status, priority and description search and reset', async () => {
  writeTasks([
    task,
    {
      ...task,
      id: 'two',
      title: 'Design',
      description: 'Visual work',
      priority: 'low',
      status: 'completed',
    },
  ]);
  const user = userEvent.setup();
  await app();
  await user.type(screen.getByLabelText('Search tasks'), 'brief');
  expect(screen.queryByRole('heading', { name: 'Design' })).not.toBeInTheDocument();
  await user.selectOptions(screen.getByLabelText('Filter by status'), 'completed');
  expect(screen.getByText('No matching tasks')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Clear filters' }));
  await user.selectOptions(screen.getByLabelText('Filter by priority'), 'low');
  expect(screen.getByRole('heading', { name: 'Design' })).toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: values.title })).not.toBeInTheDocument();
});
test('reducer immutable operations preserve identity and timestamps', () => {
  const frozen = Object.freeze([Object.freeze(task)]);
  const changed = taskReducer(frozen, {
    type: 'update',
    id: 'one',
    changes: { title: 'Updated', id: 'bad', createdAt: 'bad' },
    timestamp: 'later',
  });
  expect(changed[0]).toMatchObject({
    id: 'one',
    title: 'Updated',
    createdAt: task.createdAt,
    updatedAt: 'later',
  });
  expect(frozen[0].title).toBe(values.title);
  expect(taskReducer(frozen, { type: 'add', task })).toBe(frozen);
  expect(taskReducer([], { type: 'add', task })).toEqual([task]);
  const completed = taskReducer(frozen, {
    type: 'toggle',
    id: 'one',
    timestamp: 'later',
  });
  expect(completed[0].status).toBe('completed');
  expect(
    taskReducer(completed, { type: 'toggle', id: 'one', timestamp: 'later' })[0].status,
  ).toBe('pending');
  expect(taskReducer(frozen, { type: 'delete', id: 'one' })).toEqual([]);
  expect(taskReducer(frozen, { type: 'unknown' })).toBe(frozen);
});
test('context actions and storage hydrate before writing even in StrictMode', () => {
  writeTasks([task]);
  const spy = jest.spyOn(Storage.prototype, 'setItem');
  const { result, unmount } = renderHook(useTasks, { wrapper });
  expect(result.current.tasks).toEqual([task]);
  expect(spy).not.toHaveBeenCalled();
  act(() => result.current.addTask({ ...values, title: 'Second' }));
  const id = result.current.tasks[0].id;
  act(() => result.current.updateTask(id, { ...values, title: 'Edited' }));
  act(() => result.current.toggleTaskStatus(id));
  expect(result.current.stats.completed).toBe(1);
  act(() => result.current.deleteTask('one'));
  expect(JSON.parse(localStorage.getItem(TASK_STORAGE_KEY)).tasks).toHaveLength(1);
  unmount();
  const reloaded = renderHook(useTasks, { wrapper });
  expect(reloaded.result.current.tasks[0].title).toBe('Edited');
  spy.mockRestore();
});
test.each([
  'broken',
  JSON.stringify({ version: 2, tasks: [task] }),
  JSON.stringify({ version: 1, tasks: [{ id: 'invalid' }] }),
])('corrupt storage %s remains intact while session continues', (raw) => {
  localStorage.setItem(TASK_STORAGE_KEY, raw);
  const { result } = renderHook(useTasks, { wrapper });
  expect(result.current.storageError).toMatch(/could not be read/);
  act(() => result.current.addTask(values));
  expect(result.current.tasks).toHaveLength(1);
  expect(localStorage.getItem(TASK_STORAGE_KEY)).toBe(raw);
});
test('storage restriction and quota failures return useful errors', () => {
  const get = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('Denied');
  });
  expect(readTasks().error).toMatch(/could not be read/);
  get.mockRestore();
  const set = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('Quota');
  });
  expect(writeTasks([task])).toMatch(/could not be saved/);
  set.mockRestore();
});
test('filter hook uses immutable source and resets combined filters', () => {
  const source = Object.freeze([Object.freeze(task)]);
  const { result } = renderHook(() => useTaskFilters(source));
  act(() => result.current.setFilter('search', 'BRIEF'));
  expect(result.current.filteredTasks).toEqual(source);
  act(() => result.current.setFilter('priority', 'low'));
  expect(result.current.filteredTasks).toEqual([]);
  act(() => result.current.resetFilters());
  expect(result.current.filteredTasks).toEqual(source);
});
test('statistics handle every status and an empty collection', () => {
  expect(taskStatistics([])).toEqual({
    total: 0,
    completed: 0,
    pending: 0,
    inProgress: 0,
    highPriority: 0,
    completion: 0,
  });
  expect(
    taskStatistics([
      task,
      { ...task, status: 'completed' },
      { ...task, status: 'in-progress' },
    ]),
  ).toEqual({
    total: 3,
    completed: 1,
    pending: 1,
    inProgress: 1,
    highPriority: 3,
    completion: 33,
  });
});
test('validation rejects impossible dates and whitespace titles', () => {
  expect(validateTask({ ...values, title: '  ', dueDate: '2026-02-30' })).toEqual({
    title: 'Enter a task title.',
    dueDate: 'Enter a valid date.',
  });
  expect(validateTask(values)).toEqual({});
});
