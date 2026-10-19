import { lazy, Suspense } from 'react';
import { act, render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { RouteLoading, RouteErrorBoundary } from '../src/components/RouteContent';
import { deferred } from './helpers/fixtures';
import { renderApp } from './helpers/renderApp';
expect.extend(toHaveNoViolations);
test('Suspense announces pending code, preserves surrounding navigation and renders its resolved page', async () => {
  const pending = deferred();
  const Page = lazy(() => pending.promise);
  const { container } = render(
    <main>
      <nav aria-label="Persistent navigation">
        <a href="/">Overview</a>
      </nav>
      <RouteErrorBoundary path="/tasks">
        <Suspense fallback={<RouteLoading />}>
          <Page />
        </Suspense>
      </RouteErrorBoundary>
    </main>,
  );
  expect(screen.getByRole('status')).toHaveTextContent('Loading this page');
  expect(screen.getByRole('link', { name: 'Overview' })).toBeInTheDocument();
  expect(await axe(container)).toHaveNoViolations();
  await act(async () => pending.resolve({ default: () => <h1>Loaded page</h1> }));
  expect(screen.getByRole('heading', { name: 'Loaded page' })).toBeInTheDocument();
  expect(
    screen.queryByText('Loading this page.', { exact: false }),
  ).not.toBeInTheDocument();
});
test('rejected lazy code offers an accessible full-document reload recovery', async () => {
  const error = jest.spyOn(console, 'error').mockImplementation(() => {});
  const Page = lazy(() => Promise.reject(new Error('Chunk unavailable')));
  const { container } = await act(async () =>
    render(
      <main>
        <RouteErrorBoundary path="/components">
          <Suspense fallback={<RouteLoading />}>
            <Page />
          </Suspense>
        </RouteErrorBoundary>
      </main>,
    ),
  );
  expect(screen.getByRole('alert')).toHaveTextContent('Check your connection');
  expect(screen.getByRole('link', { name: 'Reload this page' })).toHaveAttribute(
    'href',
    '/components',
  );
  expect(await axe(container)).toHaveNoViolations();
  error.mockRestore();
});
test.each([
  ['/tasks', 'Your task space.'],
  ['/components', 'Small pieces. Better together.'],
  ['/settings', 'A thoughtful setup.'],
])(
  'actual lazy route %s resolves with navigation and its accessible heading',
  async (path, title) => {
    await renderApp(path);
    expect(
      await screen.findByRole('heading', { level: 1, name: title }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('navigation', { name: 'Main navigation' }),
    ).toBeInTheDocument();
  },
);
test('keyboard navigation resolves a split route while preserving local task state', async () => {
  const { user } = await renderApp('/tasks');
  await user.click(screen.getByRole('button', { name: 'New task' }));
  await user.type(screen.getByLabelText(/Task title/), 'Split route persistence');
  await user.click(screen.getByRole('button', { name: 'Save task' }));
  const components = screen.getByRole('link', { name: 'Components', exact: true });
  components.focus();
  await user.keyboard('{Enter}');
  await screen.findByRole('heading', {
    name: 'Small pieces. Better together.',
    exact: true,
  });
  expect(screen.getByRole('main')).toHaveFocus();
  await user.click(screen.getByRole('link', { name: 'Tasks', exact: true }));
  expect(
    await screen.findByRole('heading', { name: 'Split route persistence' }),
  ).toBeInTheDocument();
});
