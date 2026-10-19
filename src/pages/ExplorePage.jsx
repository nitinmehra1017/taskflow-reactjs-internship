import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeading from '../components/PageHeading';
import { Alert, Badge, Button } from '../components/ui';
import RemoteTaskFilters from '../components/remote/RemoteTaskFilters';
import RemoteTaskList from '../components/remote/RemoteTaskList';
import RemoteTaskSkeleton from '../components/remote/RemoteTaskSkeleton';
import { useRemoteTasks } from '../hooks/useRemoteTasks';
import { useTasks } from '../hooks/useTasks';
import '../styles/tasks.css';
import '../styles/explore.css';
const initialFilters = { search: '', completion: '', userId: '' };
export const PAGE_SIZE = 8;
export default function ExplorePage() {
  const { data, loading, error, refresh } = useRemoteTasks();
  const { tasks, importRemoteTask, storageError } = useTasks();
  const [filters, setFilters] = useState(initialFilters);
  const [page, setPage] = useState(1);
  const localLinkRef = useRef(null);
  const resultHeadingRef = useRef(null);
  const requestStatusRef = useRef(null);
  const [message, setMessage] = useState('');
  const importedIds = useMemo(
    () => new Set(tasks.map((task) => task.sourceId).filter(Boolean)),
    [tasks],
  );
  const usersById = useMemo(
    () => new Map(data?.users.map((user) => [user.id, user]) || []),
    [data],
  );
  const filtered = useMemo(
    () =>
      data?.todos.filter(
        (todo) =>
          (!filters.userId || todo.userId === Number(filters.userId)) &&
          (!filters.completion ||
            todo.completed === (filters.completion === 'completed')) &&
          todo.title.toLowerCase().includes(filters.search.trim().toLowerCase()),
      ) || [],
    [data, filters],
  );
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  function filter(name, value) {
    setFilters((previous) => ({ ...previous, [name]: value }));
    setPage(1);
  }
  function clear() {
    setFilters(initialFilters);
    setPage(1);
  }
  function importTask(todo) {
    importRemoteTask(todo);
    requestAnimationFrame(() => localLinkRef.current?.focus());
    setMessage(
      `Remote task ${todo.id} added as a local copy. Device saving is attempted automatically; check any storage warning below.`,
    );
  }
  return (
    <>
      <div className="heading-row">
        <PageHeading
          eyebrow="A FRESH SOURCE OF INSPIRATION"
          title="Explore possibilities."
        >
          Browse remote tasks. Bring a useful idea into your own flow.
        </PageHeading>
        <Button
          variant="outline"
          loading={loading}
          loadingText={data ? 'Refreshing…' : 'Loading…'}
          onClick={refresh}
        >
          Refresh remote tasks
        </Button>
      </div>
      <section className="remote-intro" aria-label="About remote tasks">
        <div>
          <Badge variant="information">JSONPlaceholder · Remote demo data</Badge>
          <p>
            Imports become independent local copies with medium priority. Changes in
            TaskFlow stay on this device and never update the remote service.
          </p>
        </div>
        <Link ref={localLinkRef} to="/tasks" className="text-link">
          View local tasks →
        </Link>
      </section>
      <p role="status" className="task-feedback">
        {message}
      </p>
      {storageError && (
        <Alert variant="warning" title="Local copy is session only">
          {storageError}
        </Alert>
      )}
      <p
        ref={requestStatusRef}
        tabIndex={-1}
        role="status"
        className="remote-request-status"
      >
        {loading
          ? data
            ? 'Refreshing remote records. Previous results remain available.'
            : 'Loading remote tasks and users…'
          : error
            ? 'Remote request failed.'
            : `${data.todos.length} remote records loaded.`}
      </p>
      {error && (
        <Alert
          variant="error"
          title={
            error.kind === 'http'
              ? 'Remote server error'
              : error.kind === 'validation'
                ? 'Unexpected response'
                : error.kind === 'timeout'
                  ? 'Request timed out'
                  : 'Connection problem'
          }
        >
          <p>{error.message}</p>
          {data && <p>Showing the last successful results.</p>}
          <Button
            variant="outline"
            onClick={() => {
              refresh();
              requestAnimationFrame(() => requestStatusRef.current?.focus());
            }}
          >
            Retry request
          </Button>
        </Alert>
      )}
      {data && (
        <>
          <RemoteTaskFilters
            filters={filters}
            onFilter={filter}
            onClear={clear}
            users={data.users}
          />
          <section aria-labelledby="remote-results-title" aria-busy={loading}>
            <div className="task-results">
              <h2 ref={resultHeadingRef} tabIndex={-1} id="remote-results-title">
                Remote task library
              </h2>
              <p role="status">
                {filtered.length
                  ? `${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(currentPage * PAGE_SIZE, filtered.length)}`
                  : '0'}{' '}
                of {filtered.length} results
              </p>
            </div>
            <RemoteTaskList
              todos={visible}
              usersById={usersById}
              importedIds={importedIds}
              onImport={importTask}
            />
          </section>
          <nav className="remote-pagination" aria-label="Remote task pages">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => {
                setPage(currentPage - 1);
                requestAnimationFrame(() => resultHeadingRef.current?.focus());
              }}
            >
              Previous page
            </Button>
            <p role="status">
              Page {currentPage} of {pages}
            </p>
            <Button
              variant="outline"
              disabled={currentPage === pages}
              onClick={() => {
                setPage(currentPage + 1);
                requestAnimationFrame(() => resultHeadingRef.current?.focus());
              }}
            >
              Next page
            </Button>
          </nav>
        </>
      )}
      {!data && loading && <RemoteTaskSkeleton />}
    </>
  );
}
