import { render, screen } from '@testing-library/react';
import RemoteTaskCard from '../src/components/remote/RemoteTaskCard';
test('remote import visible text is included in its accessible name for speech input', () => {
  const props = {
    todo: { id: 7, userId: 1, title: 'Review naming', completed: false },
    user: { id: 1, name: 'Owner', username: 'owner' },
    onImport: jest.fn(),
  };
  const { rerender } = render(
    <ul>
      <RemoteTaskCard {...props} imported={false} />
    </ul>,
  );
  const button = screen.getByRole('button', {
    name: 'Import remote task 7',
    exact: true,
  });
  expect(button).toHaveTextContent('Import remote task 7');
  rerender(
    <ul>
      <RemoteTaskCard {...props} imported />
    </ul>,
  );
  expect(
    screen.getByRole('button', { name: 'Imported remote task 7', exact: true }),
  ).toHaveTextContent('Imported');
});
