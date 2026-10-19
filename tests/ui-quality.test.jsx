import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Alert, Badge, Button, Input, Select } from '../src/components/ui';
import { renderApp } from './helpers/renderApp';
test.each(['success', 'warning', 'error', 'information'])(
  'Alert %s announces with the correct urgency and exposes dismissal',
  async (variant) => {
    const user = userEvent.setup();
    const dismissed = jest.fn();
    render(
      <Alert variant={variant} announce title="Update" onDismiss={dismissed}>
        Review details
      </Alert>,
    );
    const feedback = screen.getByRole(variant === 'error' ? 'alert' : 'status');
    expect(feedback).toHaveTextContent('Review details');
    expect(feedback).toHaveAttribute('aria-atomic', 'true');
    await user.click(screen.getByRole('button', { name: 'Dismiss notification' }));
    expect(dismissed).toHaveBeenCalledTimes(1);
  },
);
test('Badge defaults to a medium neutral textual span', () => {
  render(<Badge>Not started</Badge>);
  const badge = screen.getByText('Not started');
  expect(badge.tagName).toBe('SPAN');
  expect(badge).toHaveClass('ui-badge--neutral', 'ui-badge--md');
  expect(badge).not.toHaveAttribute('aria-live');
});
test('multiline Input preserves labeling, help, error and disabled semantics', async () => {
  const user = userEvent.setup();
  render(
    <Input
      multiline
      label="Notes"
      disabled
      defaultValue="Original"
      helperText="Optional notes"
      error="Check the length"
    />,
  );
  const field = screen.getByRole('textbox', { name: 'Notes' });
  expect(field.tagName).toBe('TEXTAREA');
  expect(field).toHaveAccessibleDescription('Optional notes Check the length');
  await user.type(field, 'Changed');
  expect(field).toHaveValue('Original');
});
test('native Select is keyboard reachable and preserves external helper/error descriptions', async () => {
  const user = userEvent.setup();
  const submit = jest.fn((e) => e.preventDefault());
  render(
    <>
      <p id="outside">Choose thoughtfully</p>
      <form onSubmit={submit}>
        <Select
          label="Review status"
          required
          helperText="One choice"
          error="Select a valid option"
          aria-describedby="outside"
          options={[
            { value: 'pending', label: 'Pending' },
            { value: 'completed', label: 'Completed' },
          ]}
        />
        <Button type="submit">Confirm selection</Button>
      </form>
    </>,
  );
  await user.tab();
  const select = screen.getByRole('combobox');
  expect(select).toHaveFocus();
  expect(select).toHaveAccessibleDescription(
    'Choose thoughtfully One choice Select a valid option',
  );
  await user.selectOptions(select, 'completed');
  await user.tab();
  await user.keyboard('{Enter}');
  expect(submit).toHaveBeenCalledTimes(1);
});
test('showcase actions communicate feedback and modal Cancel restores its opener', async () => {
  const { user } = await renderApp('/components');
  for (const name of [
    'Primary',
    'Secondary',
    'Outline',
    'Danger',
    'Small',
    'Medium',
    'Large',
  ]) {
    await user.click(screen.getByRole('button', { name, exact: true }));
    expect(
      within(screen.getByLabelText('Demo feedback')).getByRole('status'),
    ).toHaveTextContent(`${name} button activated.`);
  }
  await user.click(screen.getByRole('button', { name: 'Explore card action' }));
  expect(
    within(screen.getByLabelText('Demo feedback')).getByRole('status'),
  ).toHaveTextContent('Card footer action activated.');
  const trigger = screen.getByRole('button', { name: 'Open dialog' });
  await user.click(trigger);
  await user.click(screen.getByRole('button', { name: 'Cancel', exact: true }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();
});
