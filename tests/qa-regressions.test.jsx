import { screen, waitFor } from '@testing-library/react';
import { renderApp } from './helpers/renderApp';
import { makeTask, mockRemoteFetch } from './helpers/fixtures';
import { writeTasks } from '../src/services/taskStorage';
const originalFetch = global.fetch;
beforeEach(() => localStorage.clear());
afterEach(() => {
  global.fetch = originalFetch;
});
test('QA-001 completing a task hidden by the current filter moves focus to task results', async () => {
  writeTasks([makeTask()]);
  const { user } = await renderApp();
  await user.selectOptions(screen.getByLabelText('Filter by status'), 'pending');
  await user.click(screen.getByRole('button', { name: 'Complete Prepare review' }));
  expect(
    screen.queryByRole('button', { name: 'Reopen Prepare review' }),
  ).not.toBeInTheDocument();
  await waitFor(() =>
    expect(screen.getByRole('heading', { name: 'My tasks' })).toHaveFocus(),
  );
});
test('QA-001 editing a task out of the active filter restores focus to task results', async () => {
  writeTasks([makeTask()]);
  const { user } = await renderApp();
  await user.selectOptions(screen.getByLabelText('Filter by priority'), 'medium');
  await user.click(screen.getByRole('button', { name: 'Edit Prepare review' }));
  await user.selectOptions(screen.getByLabelText('Priority', { exact: true }), 'high');
  await user.click(screen.getByRole('button', { name: 'Save task' }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  await waitFor(() =>
    expect(screen.getByRole('heading', { name: 'My tasks' })).toHaveFocus(),
  );
});
test('QA-002 retrying a remote failure retains keyboard focus in request feedback', async () => {
  global.fetch = jest.fn().mockRejectedValue(new TypeError('offline'));
  const { user } = await renderApp('/explore');
  await screen.findByText('Connection problem');
  global.fetch = mockRemoteFetch();
  await user.click(screen.getByRole('button', { name: 'Retry request' }));
  await screen.findByRole('heading', { name: 'Remote review' });
  await waitFor(() => expect(screen.getByText('1 remote records loaded.')).toHaveFocus());
});
