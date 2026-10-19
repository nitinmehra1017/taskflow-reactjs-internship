import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from '../src/App';
import { TaskProvider } from '../src/context/TaskContext';
import { useTasks } from '../src/hooks/useTasks';
import { useRemoteTasks, REQUEST_TIMEOUT_MS } from '../src/hooks/useRemoteTasks';
import { getJson } from '../src/services/apiClient';
import { fetchRemoteTasks } from '../src/services/remoteTaskService';
import { readTasks, TASK_STORAGE_KEY } from '../src/services/taskStorage';
import { taskReducer } from '../src/reducers/taskReducer';
import { validateRemoteData } from '../src/utils/remoteTaskValidation';
const users = [
  { id: 1, name: 'Ada Example', username: 'ada' },
  { id: 2, name: 'Grace Example', username: 'grace' },
];
const todos = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  userId: i < 6 ? 1 : 2,
  title: `Remote idea ${i + 1}`,
  completed: i % 2 === 0,
}));
const response = (data) => ({ ok: true, status: 200, json: async () => data });
const deferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
};
const originalFetch = global.fetch;
function success() {
  global.fetch.mockImplementation(async (url) =>
    response(url.endsWith('/users') ? users : todos),
  );
}
function renderExplorer() {
  return render(
    <MemoryRouter initialEntries={['/explore']}>
      <App />
    </MemoryRouter>,
  );
}
beforeEach(() => {
  localStorage.clear();
  global.fetch = jest.fn();
  success();
});
afterEach(() => {
  jest.restoreAllMocks();
  global.fetch = originalFetch;
  jest.useRealTimers();
});
test('service fetches both endpoints with signal and retains only used fields', async () => {
  const controller = new AbortController();
  const result = await fetchRemoteTasks({ signal: controller.signal });
  expect(result).toEqual({ todos, users });
  expect(fetch).toHaveBeenCalledWith(
    'https://jsonplaceholder.typicode.com/todos',
    expect.objectContaining({ signal: controller.signal }),
  );
  expect(fetch).toHaveBeenCalledWith(
    'https://jsonplaceholder.typicode.com/users',
    expect.objectContaining({ signal: controller.signal }),
  );
});
test('HTTP errors retain status and kind', async () => {
  fetch.mockResolvedValue({ ok: false, status: 503 });
  await expect(getJson('/todos')).rejects.toMatchObject({
    kind: 'http',
    status: 503,
    message: expect.stringContaining('503'),
  });
});
test('network failures have useful connection feedback', async () => {
  fetch.mockRejectedValue(new TypeError('Failed to fetch'));
  await expect(getJson('/todos')).rejects.toMatchObject({
    kind: 'network',
    message: expect.stringContaining('connection'),
  });
});
test('unreadable JSON is a validation error', async () => {
  fetch.mockResolvedValue({
    ok: true,
    json: async () => {
      throw new SyntaxError('bad');
    },
  });
  await expect(getJson('/todos')).rejects.toMatchObject({ kind: 'validation' });
});
test.each([
  null,
  {},
  [{ id: 1 }],
  [{ ...todos[0], completed: 'yes' }],
  [{ ...todos[0], userId: 999 }],
  [todos[0], todos[0]],
])('service rejects malformed or unjoinable data %p', async (payload) => {
  fetch.mockImplementation(async (url) =>
    response(url.endsWith('/users') ? users : payload),
  );
  await expect(fetchRemoteTasks()).rejects.toMatchObject({ kind: 'validation' });
});
test('validator supports empty valid collections and rejects invalid users and oversized collections', () => {
  expect(validateRemoteData([], [])).toBe(true);
  expect(validateRemoteData(todos, [{ id: 1, name: 7, username: 'bad' }])).toBe(false);
  expect(validateRemoteData(Array(1001).fill(todos[0]), users)).toBe(false);
});
test('loading then loaded state and stable refresh do not fetch on unrelated render', async () => {
  const pending = deferred();
  fetch.mockReturnValue(pending.promise);
  const { result, rerender } = renderHook(useRemoteTasks);
  expect(result.current.loading).toBe(true);
  expect(fetch).toHaveBeenCalledTimes(2);
  const refresh = result.current.refresh;
  rerender();
  expect(fetch).toHaveBeenCalledTimes(2);
  await act(async () => pending.resolve(response([])));
  expect(result.current.loading).toBe(false);
  expect(result.current.data).toEqual({ todos: [], users: [] });
  expect(result.current.refresh).toBe(refresh);
});
test('refresh retains useful data and retry recovers from a failed request', async () => {
  const { result } = renderHook(useRemoteTasks);
  await waitFor(() => expect(result.current.data?.todos).toHaveLength(12));
  const pending = deferred();
  fetch.mockReturnValue(pending.promise);
  act(() => result.current.refresh());
  expect(result.current.loading).toBe(true);
  expect(result.current.data.todos).toHaveLength(12);
  await act(async () => pending.reject(new TypeError('offline')));
  expect(result.current.error.kind).toBe('network');
  expect(result.current.data.todos).toHaveLength(12);
  success();
  act(() => result.current.refresh());
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.error).toBeNull();
});
test('obsolete requests are aborted and late responses cannot replace the latest data', async () => {
  const old = deferred();
  const signals = [];
  fetch.mockImplementation((url, options) => {
    signals.push(options.signal);
    return old.promise;
  });
  const { result } = renderHook(useRemoteTasks);
  success();
  act(() => result.current.refresh());
  await waitFor(() => expect(result.current.data?.todos).toHaveLength(12));
  expect(signals[0].aborted).toBe(true);
  await act(async () => old.resolve(response([])));
  expect(result.current.data.todos).toHaveLength(12);
  expect(result.current.error).toBeNull();
});
test('unmount cancels both endpoint requests and late resolution is ignored', async () => {
  const pending = deferred();
  const signals = [];
  fetch.mockImplementation((url, options) => {
    signals.push(options.signal);
    return pending.promise;
  });
  const { unmount } = renderHook(useRemoteTasks);
  unmount();
  expect(signals).toHaveLength(2);
  expect(signals.every((signal) => signal.aborted)).toBe(true);
  await act(async () => pending.resolve(response([])));
});
test('timeout is reported as a retryable error rather than silent cancellation', async () => {
  jest.useFakeTimers();
  fetch.mockImplementation(
    (url, { signal }) =>
      new Promise((resolve, reject) =>
        signal.addEventListener('abort', () =>
          reject(new DOMException('Aborted', 'AbortError')),
        ),
      ),
  );
  const { result } = renderHook(useRemoteTasks);
  await act(async () => jest.advanceTimersByTime(REQUEST_TIMEOUT_MS));
  expect(result.current.error.kind).toBe('timeout');
  expect(result.current.loading).toBe(false);
});
test('explorer searches, combines filters, resets pagination and reports empty results', async () => {
  const user = userEvent.setup();
  renderExplorer();
  expect(screen.getByText('Loading remote tasks and users…')).toBeInTheDocument();
  await screen.findByRole('heading', { name: 'Remote idea 1', exact: true });
  expect(
    within(screen.getByRole('list', { name: 'Remote tasks' })).getAllByRole('listitem'),
  ).toHaveLength(8);
  await user.click(screen.getByRole('button', { name: 'Next page' }));
  expect(screen.getByText('Page 2 of 2')).toBeInTheDocument();
  expect(
    screen.getByRole('heading', { name: 'Remote idea 9', exact: true }),
  ).toBeInTheDocument();
  await user.selectOptions(screen.getByLabelText('Remote user'), '2');
  expect(screen.getByText('Page 1 of 1')).toBeInTheDocument();
  await user.selectOptions(screen.getByLabelText('Completion status'), 'completed');
  expect(
    within(screen.getByRole('list', { name: 'Remote tasks' })).getAllByRole('listitem'),
  ).toHaveLength(3);
  await user.type(screen.getByLabelText('Search remote tasks'), 'idea 9');
  expect(
    within(screen.getByRole('list', { name: 'Remote tasks' })).getAllByRole('listitem'),
  ).toHaveLength(1);
  await user.type(screen.getByLabelText('Search remote tasks'), 'absent');
  expect(screen.getByText('No remote tasks match')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Clear filters' }));
  expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
  expect(fetch).toHaveBeenCalledTimes(2);
});
test('error UI supports retry to actual loaded state and refresh keeps records visible', async () => {
  fetch.mockResolvedValue({ ok: false, status: 500 });
  const user = userEvent.setup();
  renderExplorer();
  expect(await screen.findByText('Remote server error')).toBeInTheDocument();
  success();
  await user.click(screen.getByRole('button', { name: 'Retry request' }));
  await screen.findByRole('heading', { name: 'Remote idea 1', exact: true });
  const pending = deferred();
  fetch.mockReturnValue(pending.promise);
  await user.click(screen.getByRole('button', { name: 'Refresh remote tasks' }));
  expect(screen.getByRole('button', { name: 'Refreshing…' })).toBeDisabled();
  expect(
    screen.getByRole('heading', { name: 'Remote idea 1', exact: true }),
  ).toBeInTheDocument();
  await act(async () => pending.resolve(response([])));
  expect(screen.getByText('No remote tasks match')).toBeInTheDocument();
});
test('import becomes one persistent local copy and drives dashboard statistics', async () => {
  const user = userEvent.setup();
  const view = renderExplorer();
  const button = await screen.findByRole('button', {
    name: 'Import remote task 1',
    exact: true,
  });
  // Two events within one commit still pass through the reducer source-ID guard.
  act(() => {
    fireEvent.click(button);
    fireEvent.click(button);
  });
  expect(
    screen.getByRole('button', { name: 'Imported remote task 1', exact: true }),
  ).toBeDisabled();
  const saved = readTasks().tasks;
  expect(saved).toHaveLength(1);
  expect(saved[0]).toMatchObject({
    title: todos[0].title,
    status: 'completed',
    priority: 'medium',
    description: '',
    dueDate: '',
    sourceId: 'jsonplaceholder:todo:1',
  });
  expect(saved[0].id).toBeTruthy();
  expect(saved[0].createdAt).toBeTruthy();
  expect(saved[0]).not.toHaveProperty('userId');
  await user.click(screen.getByRole('link', { name: 'Overview', exact: true }));
  const stats = screen.getByRole('region', { name: 'Task statistics' });
  expect(within(stats).getByText('Completed tasks').closest('article')).toHaveTextContent(
    '1',
  );
  view.unmount();
  renderExplorer();
  expect(
    await screen.findByRole('button', { name: 'Imported remote task 1', exact: true }),
  ).toBeDisabled();
  await user.click(screen.getByRole('link', { name: 'Tasks', exact: true }));
  expect(screen.getByText('Imported local copy')).toBeInTheDocument();
});
test('storage failure never claims imported copy is persisted', async () => {
  const set = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('Quota');
  });
  const user = userEvent.setup();
  renderExplorer();
  await user.click(
    await screen.findByRole('button', { name: 'Import remote task 1', exact: true }),
  );
  expect(screen.getByText('Local copy is session only')).toBeInTheDocument();
  expect(screen.getByText(/could not be saved/)).toBeInTheDocument();
  expect(localStorage.getItem(TASK_STORAGE_KEY)).toBeNull();
  set.mockRestore();
});
test('local reducer rejects duplicate source IDs even with different generated IDs', () => {
  const a = { id: 'a', sourceId: 'jsonplaceholder:todo:1' };
  expect(taskReducer([a], { type: 'add', task: { ...a, id: 'b' } })).toEqual([a]);
});
test('import preserves remote status and source after local editing without mutating remote records', () => {
  const wrapper = ({ children }) => <TaskProvider>{children}</TaskProvider>;
  const { result } = renderHook(useTasks, { wrapper });
  const remote = Object.freeze(todos[1]);
  act(() => result.current.importRemoteTask(remote));
  const imported = result.current.tasks[0];
  expect(imported.status).toBe('pending');
  act(() => result.current.updateTask(imported.id, { ...imported, title: 'Local edit' }));
  expect(result.current.tasks[0].sourceId).toBe('jsonplaceholder:todo:2');
  expect(remote.title).toBe('Remote idea 2');
  act(() => result.current.importRemoteTask(remote));
  expect(result.current.tasks).toHaveLength(1);
});
