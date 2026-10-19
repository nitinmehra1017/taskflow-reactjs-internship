import { createRoot } from 'react-dom/client';
jest.mock('react-dom/client', () => ({
  createRoot: jest.fn(() => ({ render: jest.fn() })),
}));
test('application entry mounts the React tree into the root element', () => {
  const root = document.createElement('div');
  root.id = 'root';
  document.body.append(root);
  require('../src/index');
  expect(createRoot).toHaveBeenCalledWith(root);
  expect(createRoot.mock.results[0].value.render).toHaveBeenCalledTimes(1);
  root.remove();
});
