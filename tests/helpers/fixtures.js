export function makeTask(overrides = {}) {
  return {
    id: 'local-1',
    title: 'Prepare review',
    description: 'Discuss accessible navigation',
    priority: 'medium',
    status: 'pending',
    dueDate: '',
    createdAt: '2026-10-19T10:00:00.000Z',
    updatedAt: '2026-10-19T10:00:00.000Z',
    ...overrides,
  };
}
export const remoteUsers = [{ id: 1, name: 'Example owner', username: 'example' }];
export const remoteTodos = [
  { id: 1, userId: 1, title: 'Remote review', completed: false },
];
export const jsonResponse = (data) => ({ ok: true, status: 200, json: async () => data });
export function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}
export function mockRemoteFetch(todos = remoteTodos, users = remoteUsers) {
  return jest.fn(async (url) => jsonResponse(url.endsWith('/users') ? users : todos));
}
