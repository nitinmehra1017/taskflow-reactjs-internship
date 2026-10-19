import { act, renderHook } from '@testing-library/react';
import { TaskProvider } from '../src/context/TaskContext';
import { useTasks } from '../src/hooks/useTasks';
import { useLocalStorage } from '../src/hooks/useLocalStorage';
import { useTaskFilters } from '../src/hooks/useTaskFilters';
import { validateTask, validDate, validTasks } from '../src/utils/taskValidation';
import { taskReducer } from '../src/reducers/taskReducer';
import { readTasks, writeTasks, TASK_STORAGE_KEY } from '../src/services/taskStorage';
import { makeTask } from './helpers/fixtures';
const wrapper = ({ children }) => <TaskProvider>{children}</TaskProvider>;
test.each([
  ['title', ' ', 'Enter a task title.'],
  ['title', 'x'.repeat(121), 'Use 120 characters or fewer.'],
  ['title', 7, 'Enter a task title.'],
  ['description', 'x'.repeat(2001), 'Use 2000 characters or fewer.'],
  ['description', null, 'Use 2000 characters or fewer.'],
  ['priority', 'urgent', 'Choose a priority.'],
  ['status', 'archived', 'Choose a status.'],
  ['dueDate', '2026-02-30', 'Enter a valid date.'],
  ['dueDate', null, 'Enter a valid date.'],
  ['sourceId', 'another:1', 'Invalid remote source.'],
])('rejects invalid %s value %p with actionable feedback', (field, value, message) => {
  expect(validateTask(makeTask({ [field]: value }))[field]).toBe(message);
});
test('calendar validation handles optional dates, leap years and invalid months', () => {
  expect(validDate('')).toBe(true);
  expect(validDate('2028-02-29')).toBe(true);
  expect(validDate('2027-02-29')).toBe(false);
  expect(validDate('2026-13-01')).toBe(false);
});
test('storage validates unique local and source identities while accepting older local tasks', () => {
  const local = makeTask();
  const imported = makeTask({ id: 'other', sourceId: 'jsonplaceholder:todo:1' });
  expect(validTasks([local, imported])).toBe(true);
  expect(validTasks([local, local])).toBe(false);
  expect(validTasks([imported, { ...imported, id: 'third' }])).toBe(false);
  expect(validTasks([makeTask({ createdAt: 'invalid' })])).toBe(false);
  expect(writeTasks([makeTask({ title: 4 })])).toMatch(/could not be saved/);
  expect(localStorage.getItem(TASK_STORAGE_KEY)).toBeNull();
});
test.each([
  'null',
  '42',
  '[]',
  JSON.stringify({ version: 1, tasks: [makeTask({ updatedAt: 'invalid' })] }),
])('stored invalid envelope %s never crashes or overwrites original data', (raw) => {
  localStorage.setItem(TASK_STORAGE_KEY, raw);
  expect(readTasks().error).toMatch(/could not be read/);
  expect(localStorage.getItem(TASK_STORAGE_KEY)).toBe(raw);
});
test('useLocalStorage exposes write failure then retries on a later save', () => {
  const { result } = renderHook(() => useLocalStorage('taskflow.test.v1'));
  expect(result.current.initialTasks).toEqual([]);
  const set = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('Quota');
  });
  act(() => result.current.save([makeTask()]));
  expect(result.current.error).toMatch(/could not be saved/);
  set.mockRestore();
  act(() => result.current.save([makeTask()]));
  expect(result.current.error).toBe('');
  expect(JSON.parse(localStorage.getItem('taskflow.test.v1')).tasks[0].id).toBe(
    'local-1',
  );
});
test('useLocalStorage restricted reads disable automatic writes for that session', () => {
  const get = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('Denied');
  });
  const { result } = renderHook(useLocalStorage);
  get.mockRestore();
  const set = jest.spyOn(Storage.prototype, 'setItem');
  act(() => result.current.save([makeTask()]));
  expect(result.current.error).toMatch(/could not be read/);
  expect(set).not.toHaveBeenCalled();
});
test('provider rejects invalid actions and assigns unique stable IDs across edits', () => {
  const { result } = renderHook(useTasks, { wrapper });
  expect(() => result.current.addTask(makeTask({ title: ' ' }))).toThrow('Invalid task');
  expect(() => result.current.importRemoteTask({ id: 0 })).toThrow('Invalid remote task');
  act(() => {
    result.current.addTask(makeTask());
    result.current.addTask(makeTask());
  });
  const [first, second] = result.current.tasks;
  expect(first.id).not.toBe(second.id);
  expect(Number.isFinite(Date.parse(first.createdAt))).toBe(true);
  act(() => result.current.updateTask(first.id, { ...first, title: 'New title' }));
  expect(result.current.tasks[0]).toMatchObject({
    id: first.id,
    createdAt: first.createdAt,
    title: 'New title',
  });
  expect(result.current.tasks).toHaveLength(2);
});
test('useTasks reports a missing provider as a developer error', () => {
  const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
  expect(() => renderHook(useTasks)).toThrow('useTasks requires TaskProvider');
  spy.mockRestore();
});
test('filters combine whitespace-insensitive search and all status/priority combinations', () => {
  const tasks = [
    makeTask(),
    makeTask({ id: '2', title: 'Ship release', status: 'completed', priority: 'high' }),
  ];
  const { result } = renderHook(() => useTaskFilters(tasks));
  act(() => {
    result.current.setFilter('search', '  ACCESSIBLE  ');
    result.current.setFilter('status', 'pending');
    result.current.setFilter('priority', 'medium');
  });
  expect(result.current.filteredTasks.map((t) => t.id)).toEqual(['local-1']);
  act(() => result.current.setFilter('search', '   '));
  expect(result.current.filteredTasks).toHaveLength(1);
  act(() => result.current.resetFilters());
  expect(result.current.filteredTasks).toEqual(tasks);
});
test('unknown task IDs never alter existing records', () => {
  const task = Object.freeze(makeTask());
  const state = Object.freeze([task]);
  for (const action of [
    { type: 'update', id: 'missing', changes: { title: 'wrong' } },
    { type: 'toggle', id: 'missing', timestamp: 'later' },
    { type: 'delete', id: 'missing' },
  ])
    expect(taskReducer(state, action)).toEqual([task]);
});
