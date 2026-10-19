import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from '../../src/App';
export function renderApp(path = '/tasks') {
  const user = userEvent.setup();
  return {
    user,
    ...render(
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>,
    ),
  };
}
