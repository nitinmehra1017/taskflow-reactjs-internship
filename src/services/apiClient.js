export const API_BASE_URL = 'https://jsonplaceholder.typicode.com';
export class ApiError extends Error {
  constructor(message, kind, status) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = status;
  }
}
export async function getJson(path, { signal } = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      signal,
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
  } catch (error) {
    if (signal?.aborted || error.name === 'AbortError') throw error;
    throw new ApiError(
      'Unable to reach JSONPlaceholder. Check your connection and try again.',
      'network',
    );
  }
  if (!response.ok)
    throw new ApiError(
      `JSONPlaceholder returned HTTP ${response.status}. Please try again.`,
      'http',
      response.status,
    );
  try {
    return await response.json();
  } catch (error) {
    if (signal?.aborted || error.name === 'AbortError') throw error;
    throw new ApiError(
      'JSONPlaceholder returned unreadable JSON. Please try again.',
      'validation',
    );
  }
}
