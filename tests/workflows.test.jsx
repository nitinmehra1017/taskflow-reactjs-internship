import { screen, within, waitFor } from '@testing-library/react';
import { renderApp } from './helpers/renderApp';
import { mockRemoteFetch } from './helpers/fixtures';
import { readTasks } from '../src/services/taskStorage';
async function createTask(user, title, { status = 'pending', priority = 'medium' } = {}) {
  await user.click(screen.getByRole('button', { name: 'New task' }));
  await user.type(screen.getByLabelText(/Task title/), title);
  await user.selectOptions(screen.getByLabelText('Status', { exact: true }), status);
  await user.selectOptions(screen.getByLabelText('Priority', { exact: true }), priority);
  await user.click(screen.getByRole('button', { name: 'Save task' }));
  expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
}
test('Workflow A and C: a created task updates dashboard and survives full application remount', async () => {
  const view = renderApp();
  await createTask(view.user, 'Publish QA findings', { priority: 'high' });
  expect(readTasks().tasks[0]).toMatchObject({
    title: 'Publish QA findings',
    priority: 'high',
  });
  await view.user.click(screen.getByRole('link', { name: 'Overview', exact: true }));
  const stats = screen.getByRole('region', { name: 'Task statistics' });
  expect(within(stats).getByText('Total tasks').closest('article')).toHaveTextContent(
    '1',
  );
  expect(
    within(stats).getByText('High-priority tasks').closest('article'),
  ).toHaveTextContent('1');
  view.unmount();
  renderApp();
  expect(
    screen.getByRole('heading', { name: 'Publish QA findings' }),
  ).toBeInTheDocument();
});
test('Workflow D: multiple created tasks combine title search, status and priority then clear', async () => {
  const { user } = renderApp();
  await createTask(user, 'Write QA report', { priority: 'high' });
  await createTask(user, 'Review QA report', { status: 'completed', priority: 'high' });
  await createTask(user, 'Plan next week', { priority: 'low' });
  await user.type(screen.getByLabelText('Search tasks'), 'QA');
  await user.selectOptions(screen.getByLabelText('Filter by status'), 'completed');
  await user.selectOptions(screen.getByLabelText('Filter by priority'), 'high');
  expect(
    within(screen.getByRole('list', { name: 'Tasks' })).getAllByRole('listitem'),
  ).toHaveLength(1);
  expect(screen.getByRole('heading', { name: 'Review QA report' })).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Clear filters' }));
  expect(
    within(screen.getByRole('list', { name: 'Tasks' })).getAllByRole('listitem'),
  ).toHaveLength(3);
});
test('Workflow E: filter remote records, import, navigate locally, remount and block duplicates', async () => {
  global.fetch = mockRemoteFetch();
  const view = renderApp('/explore');
  await screen.findByRole('heading', { name: 'Remote review' });
  await view.user.type(screen.getByLabelText('Search remote tasks'), 'review');
  await view.user.selectOptions(screen.getByLabelText('Remote user'), '1');
  await view.user.click(
    screen.getByRole('button', { name: 'Import remote task 1', exact: true }),
  );
  await waitFor(() =>
    expect(screen.getByRole('link', { name: 'View local tasks →' })).toHaveFocus(),
  );
  await view.user.keyboard('{Enter}');
  expect(screen.getByRole('heading', { name: 'Remote review' })).toBeInTheDocument();
  view.unmount();
  renderApp('/explore');
  expect(
    await screen.findByRole('button', { name: 'Imported remote task 1', exact: true }),
  ).toBeDisabled();
  expect(readTasks().tasks).toHaveLength(1);
});
