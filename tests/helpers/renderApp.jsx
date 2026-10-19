import { act, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from '../../src/App';
export async function renderApp(path = '/tasks') {
  const user = userEvent.setup();
  let view;
  await act(async () => {
    view = render(
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>,
    );
  });
  return { user, ...view };
}
