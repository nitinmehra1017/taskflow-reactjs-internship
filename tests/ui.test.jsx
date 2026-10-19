import { useRef, useState } from 'react';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Alert, Badge, Button, Card, Input, Modal, Select } from '../src/components/ui';

describe('Button', () => {
  test.each(['primary', 'secondary', 'outline', 'danger'])(
    '%s variant responds to keyboard',
    async (variant) => {
      const user = userEvent.setup();
      const action = jest.fn();
      render(
        <Button variant={variant} onClick={action}>
          Continue
        </Button>,
      );
      const button = screen.getByRole('button', { name: 'Continue' });
      expect(button).toHaveClass(`ui-button--${variant}`);
      await user.tab();
      await user.keyboard('{Enter}');
      await user.keyboard(' ');
      expect(action).toHaveBeenCalledTimes(2);
      expect(button).toHaveAttribute('type', 'button');
    },
  );
  test.each(['sm', 'md', 'lg'])('supports %s size', (size) => {
    render(<Button size={size}>Size</Button>);
    expect(screen.getByRole('button')).toHaveClass(`ui-button--${size}`);
  });
  test('disabled and loading states prevent actions and stay out of tab order', async () => {
    const user = userEvent.setup();
    const action = jest.fn();
    render(
      <>
        <Button disabled onClick={action}>
          Unavailable
        </Button>
        <Button loading onClick={action} loadingText="Saving">
          Save
        </Button>
        <Button>Next</Button>
      </>,
    );
    await user.click(screen.getByRole('button', { name: 'Unavailable' }));
    await user.click(screen.getByRole('button', { name: 'Saving' }));
    expect(screen.getByRole('button', { name: 'Saving' })).toHaveAttribute(
      'aria-busy',
      'true',
    );
    await user.tab();
    expect(screen.getByRole('button', { name: 'Next' })).toHaveFocus();
    expect(action).not.toHaveBeenCalled();
  });
});

describe('Input and Select', () => {
  test('controlled input connects its label, helper, external description, and error', async () => {
    function Field() {
      const [value, setValue] = useState('');
      return (
        <>
          <p id="external">External guidance</p>
          <Input
            label="Task title"
            placeholder="Write a title"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            required
            helperText="Keep it clear"
            error="A title is required"
            aria-describedby="external"
          />
        </>
      );
    }
    const user = userEvent.setup();
    render(<Field />);
    const input = screen.getByRole('textbox', { name: 'Task title' });
    await user.type(input, 'Plan week three');
    expect(input).toHaveValue('Plan week three');
    expect(input).toBeRequired();
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription(
      'External guidance Keep it clear A title is required',
    );
  });
  test('generated IDs are unique and supplied IDs are honored', () => {
    render(
      <>
        <Input label="One" />
        <Input label="Two" />
        <Input label="Three" id="custom" />
      </>,
    );
    const ids = screen.getAllByRole('textbox').map((input) => input.id);
    expect(new Set(ids).size).toBe(3);
    expect(screen.getByLabelText('Three')).toHaveAttribute('id', 'custom');
  });
  test('native select supports changes, placeholder, disabled options, required and errors', async () => {
    const user = userEvent.setup();
    function Field() {
      const [value, setValue] = useState('');
      return (
        <Select
          label="Priority"
          options={[
            { value: 'low', label: 'Low' },
            { value: 'high', label: 'High', disabled: true },
          ]}
          value={value}
          placeholder="Choose"
          required
          error="Select a priority"
          onChange={(event) => setValue(event.target.value)}
        />
      );
    }
    render(<Field />);
    const select = screen.getByRole('combobox', { name: 'Priority' });
    expect(select).toHaveValue('');
    expect(select).toHaveAccessibleDescription('Select a priority');
    expect(select).toBeRequired();
    expect(screen.getByRole('option', { name: 'Choose' })).toBeDisabled();
    await user.selectOptions(select, 'low');
    expect(select).toHaveValue('low');
    await user.selectOptions(select, 'high');
    expect(select).toHaveValue('low');
  });
  test('disabled fields reject typing and selection', async () => {
    const user = userEvent.setup();
    const changed = jest.fn();
    render(
      <>
        <Input label="Disabled input" disabled defaultValue="Original" />
        <Select
          label="Disabled select"
          disabled
          defaultValue="one"
          options={[
            { value: 'one', label: 'One' },
            { value: 'two', label: 'Two' },
          ]}
          onChange={changed}
        />
      </>,
    );
    await user.type(screen.getByLabelText('Disabled input'), 'Change');
    await user.selectOptions(screen.getByLabelText('Disabled select'), 'two');
    expect(screen.getByLabelText('Disabled input')).toHaveValue('Original');
    expect(changed).not.toHaveBeenCalled();
  });
});

describe('Card, Badge, and Alert', () => {
  test('Card composes optional title, description, actions, content and footer', () => {
    render(
      <Card
        title="Project"
        description="A description"
        actions={<Button>Action</Button>}
        footer="Footer"
      >
        <p>Flexible content</p>
      </Card>,
    );
    expect(
      screen.getByRole('heading', { name: 'Project', level: 3 }),
    ).toBeInTheDocument();
    ['A description', 'Flexible content', 'Footer'].forEach((text) =>
      expect(screen.getByText(text)).toBeInTheDocument(),
    );
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
  });
  test('Card renders content without empty optional containers', () => {
    const { container } = render(<Card>Simple</Card>);
    expect(screen.getByText('Simple')).toBeInTheDocument();
    expect(container.querySelector('.ui-card__header')).not.toBeInTheDocument();
    expect(container.querySelector('.ui-card__footer')).not.toBeInTheDocument();
  });
  test.each(['success', 'warning', 'error', 'neutral', 'information'])(
    'Badge %s is textual and non-live',
    (variant) => {
      render(
        <Badge variant={variant} size="sm">
          {variant}
        </Badge>,
      );
      expect(screen.getByText(variant)).toHaveClass(
        `ui-badge--${variant}`,
        'ui-badge--sm',
      );
      expect(screen.getByText(variant)).not.toHaveAttribute('role');
    },
  );
  test('static alerts stay quiet; announcements are explicitly requested', () => {
    const { rerender } = render(
      <Alert variant="error" title="Static error">
        Check the field
      </Alert>,
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    rerender(
      <Alert variant="error" announce title="New error">
        Try again
      </Alert>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Try again');
    rerender(
      <Alert variant="success" announce>
        Saved
      </Alert>,
    );
    expect(screen.getByRole('status')).toHaveTextContent('Saved');
  });
  test('alert dismiss uses a named native button and callback', async () => {
    const user = userEvent.setup();
    const dismissed = jest.fn();
    render(
      <Alert title="Saved" onDismiss={dismissed} dismissLabel="Dismiss save message">
        Success
      </Alert>,
    );
    await user.click(screen.getByRole('button', { name: 'Dismiss save message' }));
    expect(dismissed).toHaveBeenCalledTimes(1);
  });
});

function DialogHarness({ closeOnBackdrop = false, initialFocus = false }) {
  const [open, setOpen] = useState(false);
  const fieldRef = useRef(null);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Launch</Button>
      <Modal
        open={open}
        title="Review changes"
        description="A focused decision"
        onClose={() => setOpen(false)}
        closeOnBackdrop={closeOnBackdrop}
        initialFocusRef={initialFocus ? fieldRef : undefined}
        footer={<Button onClick={() => setOpen(false)}>Confirm</Button>}
      >
        <Input label="Inside dialog" ref={fieldRef} />
      </Modal>
    </>
  );
}

describe('Modal', () => {
  test('Tab boundaries exclude negative tab indices, hidden ancestors and disabled fieldsets', async () => {
    const user = userEvent.setup();
    render(
      <Modal
        open
        title="Focus edges"
        onClose={() => {}}
        footer={
          <>
            <div style={{ display: 'none' }}>
              <Button>Hidden</Button>
            </div>
            <fieldset disabled>
              <Button>Disabled by fieldset</Button>
            </fieldset>
            <Button tabIndex={-1}>Programmatic only</Button>
          </>
        }
      >
        <Input label="Visible field" />
      </Modal>,
    );
    await user.tab({ shift: true });
    expect(screen.getByRole('textbox', { name: 'Visible field' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Close dialog' })).toHaveFocus();
  });
  test('opens with semantics, traps Tab in both directions, closes with Escape and restores focus', async () => {
    const user = userEvent.setup();
    const { container } = render(<DialogHarness />);
    const launch = screen.getByRole('button', { name: 'Launch' });
    await user.click(launch);
    const dialog = screen.getByRole('dialog', { name: 'Review changes' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAccessibleDescription('A focused decision');
    expect(document.body.style.overflow).toBe('hidden');
    expect(container).toHaveAttribute('inert');
    expect(within(dialog).getByRole('button', { name: 'Close dialog' })).toHaveFocus();
    await user.tab({ shift: true });
    expect(within(dialog).getByRole('button', { name: 'Confirm' })).toHaveFocus();
    await user.tab();
    expect(within(dialog).getByRole('button', { name: 'Close dialog' })).toHaveFocus();
    await user.tab();
    expect(within(dialog).getByRole('textbox')).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(launch).toHaveFocus();
    expect(document.body.style.overflow).toBe('');
    expect(container).not.toHaveAttribute('inert');
  });
  test('initialFocusRef is honored and programmatic focus cannot escape', async () => {
    const user = userEvent.setup();
    render(<DialogHarness initialFocus />);
    const launch = screen.getByRole('button', { name: 'Launch' });
    await user.click(launch);
    expect(screen.getByRole('textbox', { name: 'Inside dialog' })).toHaveFocus();
    act(() => launch.focus());
    expect(screen.getByRole('button', { name: 'Close dialog' })).toHaveFocus();
    await user.click(screen.getByRole('button', { name: 'Close dialog' }));
    expect(launch).toHaveFocus();
  });
  test('backdrop is safe by default and optionally closes the dialog', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<DialogHarness />);
    await user.click(screen.getByRole('button', { name: 'Launch' }));
    fireEvent.click(screen.getByRole('dialog').parentElement);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    rerender(<DialogHarness closeOnBackdrop />);
    fireEvent.click(screen.getByRole('dialog').parentElement);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
  test('unmount restores prior scroll and inert state and removes portal', () => {
    document.body.style.overflow = 'clip';
    const background = document.createElement('div');
    background.setAttribute('inert', '');
    document.body.append(background);
    const { unmount } = render(
      <Modal open title="Cleanup" onClose={() => {}}>
        Content
      </Modal>,
    );
    expect(document.body.style.overflow).toBe('hidden');
    unmount();
    expect(document.body.style.overflow).toBe('clip');
    expect(background).toHaveAttribute('inert');
    expect(document.querySelector('[data-taskflow-modal]')).toBeNull();
    background.remove();
    document.body.style.overflow = '';
  });
});
