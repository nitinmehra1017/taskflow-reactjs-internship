import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from '../src/App';

async function renderRoute(path = '/components') {
  let view;
  await act(async () => {
    view = render(
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>,
    );
  });
  return view;
}

test('showcase validates input, changes select, dismisses/restores alert and confirms modal', async () => {
  const user = userEvent.setup();
  await renderRoute();
  await user.click(screen.getByRole('button', { name: 'Validate name' }));
  const input = screen.getByRole('textbox', { name: 'Workspace name' });
  expect(input).toHaveFocus();
  expect(input).toHaveAttribute('aria-invalid', 'true');
  expect(input).toHaveAccessibleDescription(
    expect.stringContaining('Enter at least 3 characters'),
  );
  await user.type(input, 'Focused workspace');
  await user.click(screen.getByRole('button', { name: 'Validate name' }));
  expect(input).not.toHaveAttribute('aria-invalid');
  expect(screen.getByText(/looks good/)).toBeInTheDocument();
  await user.selectOptions(
    screen.getByRole('combobox', { name: 'Preview priority' }),
    'high',
  );
  expect(screen.getByText(/Selected: high/)).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Dismiss success example' }));
  expect(screen.queryByText('All set')).not.toBeInTheDocument();
  const restore = screen.getByRole('button', { name: 'Restore success example' });
  expect(restore).toHaveFocus();
  await user.click(restore);
  expect(screen.getByText('All set')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Open dialog' }));
  const dialog = screen.getByRole('dialog');
  const dialogInput = within(dialog).getByRole('textbox');
  await user.clear(dialogInput);
  await user.click(within(dialog).getByRole('button', { name: 'Use this label' }));
  expect(dialogInput).toHaveAttribute('aria-invalid', 'true');
  expect(dialogInput).toHaveFocus();
  await user.type(dialogInput, 'A calm space');
  await user.click(within(dialog).getByRole('button', { name: 'Use this label' }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.getByText(/Dialog confirmed for/)).toBeInTheDocument();
});

test('loading demonstration resolves and enables its button again', async () => {
  const user = userEvent.setup();
  await renderRoute();
  await user.click(screen.getByRole('button', { name: 'Try loading state' }));
  expect(screen.getByRole('button', { name: 'Previewing…' })).toBeDisabled();
  expect(
    await screen.findByText(
      'Loading preview finished. No data was saved.',
      {},
      { timeout: 2500 },
    ),
  ).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Try loading state' })).toBeEnabled();
});

test.each([
  ['/', 'Make room for good work.'],
  ['/tasks', 'Your task space.'],
  ['/settings', 'A thoughtful setup.'],
  ['/missing', 'Let’s get back in flow.'],
])('existing route %s renders its heading', async (path, heading) => {
  await renderRoute(path);
  expect(screen.getByRole('heading', { level: 1, name: heading })).toBeInTheDocument();
});

test('navigation updates active links, title and main focus', async () => {
  const user = userEvent.setup();
  await renderRoute('/');
  await user.click(
    within(screen.getByRole('navigation', { name: 'Main navigation' })).getByRole(
      'link',
      { name: 'Components' },
    ),
  );
  expect(
    screen.getByRole('heading', { level: 1, name: 'Small pieces. Better together.' }),
  ).toBeInTheDocument();
  expect(document.title).toBe('Components · TaskFlow');
  expect(screen.getByRole('main')).toHaveFocus();
  expect(
    screen.getByRole('link', { name: 'Components', current: 'page' }),
  ).toBeInTheDocument();
  await user.click(screen.getByRole('link', { name: 'Tasks' }));
  expect(document.title).toBe('Tasks · TaskFlow');
});
