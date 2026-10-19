import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Alert, Badge, Button, Card, Input, Modal, Select } from '../src/components/ui';
import { renderApp } from './helpers/renderApp';
import { mockRemoteFetch } from './helpers/fixtures';
expect.extend(toHaveNoViolations);
test.each(['/', '/tasks', '/components', '/settings', '/missing'])(
  'axe checks route %s',
  async (path) => {
    const { container } = renderApp(path);
    expect(await axe(container)).toHaveNoViolations();
  },
);
test('axe checks populated remote results', async () => {
  global.fetch = mockRemoteFetch();
  const { container } = renderApp('/explore');
  await screen.findByRole('heading', { name: 'Remote review' });
  expect(await axe(container)).toHaveNoViolations();
});
test('axe checks create dialog and invalid submission with associated feedback', async () => {
  const { user } = renderApp();
  await user.click(screen.getByRole('button', { name: 'New task' }));
  expect(await axe(document.body)).toHaveNoViolations();
  await user.click(screen.getByRole('button', { name: 'Save task' }));
  expect(screen.getByLabelText(/Task title/)).toHaveAccessibleDescription(
    'Enter a task title.',
  );
  expect(await axe(document.body)).toHaveNoViolations();
});
test('axe checks all seven primitives in semantic context', async () => {
  const { container } = render(
    <main>
      <h1>UI verification</h1>
      <h2>Fields and feedback</h2>
      <Card title="Sample card" description="Details" footer="Footer">
        <Input label="Title" required helperText="Keep it clear" />
        <Select label="Status" options={[{ value: 'pending', label: 'Pending' }]} />
        <Badge>Pending</Badge>
        <Button>Save</Button>
        <Alert variant="warning" title="Check details">
          Review before saving.
        </Alert>
      </Card>
      <Modal open title="Review" onClose={() => {}}>
        <Input label="Dialog field" />
      </Modal>
    </main>,
  );
  expect(await axe(container)).toHaveNoViolations();
  expect(await axe(document.body)).toHaveNoViolations();
});
