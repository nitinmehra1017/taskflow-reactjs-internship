# TaskFlow Week 3 State Management and Hooks

## Introduction and objectives

Week 3 extends the existing React and Webpack application into a working task manager. Week 1 setup, Week 2 UI primitives, reports and commits remain intact. The objective is to keep one authoritative collection shared by Tasks and Dashboard, implement a complete task lifecycle, and persist validated data without a backend. All work is on `week-3-state-management`, based on verified Week 2 commit `6a4876e`.

## Architecture and responsibilities

```text
App
└── TaskProvider
    └── Routes / AppLayout
        ├── DashboardPage → StatCard × 6
        ├── TasksPage
        │   ├── TaskFilters → Input, Select, Button
        │   ├── TaskList → memo(TaskCard) → Card, Badge, Button
        │   ├── Modal → TaskForm → Input, Select, Button, Alert
        │   └── Modal → deletion confirmation
        ├── ComponentsPage (Week 2 showcase)
        └── SettingsPage / NotFoundPage
```

| Module                           | Responsibility                                                                    |
| -------------------------------- | --------------------------------------------------------------------------------- |
| context/TaskContext.jsx          | Provider, validated actions, reducer ownership, statistics and persistence effect |
| reducers/taskReducer.js          | Pure add, update, delete and toggle transitions                                   |
| hooks/useTasks.js                | Guarded context consumer and task action contract                                 |
| hooks/useLocalStorage.js         | Lazy validated hydration, stable save callback, storage feedback                  |
| hooks/useTaskFilters.js          | Local filter state and memoized pure search/filter derivation                     |
| services/taskStorage.js          | Versioned serialization, validation, guarded browser access                       |
| utils/taskValidation.js          | Form and persisted-record validation, status labels                               |
| utils/taskStatistics.js          | One-pass counts and rounded completion percentage                                 |
| components/tasks/TaskForm.jsx    | Controlled draft, error display and submit/cancel callbacks                       |
| components/tasks/TaskCard.jsx    | Present one task and request actions by ID                                        |
| components/tasks/TaskList.jsx    | Keyed list and collection/results empty states                                    |
| components/tasks/TaskFilters.jsx | Controlled search, status, priority and reset controls                            |
| styles/tasks.css                 | Responsive task layouts using the existing palette                                |

Data flows from provider state through context into pages and task cards. Events invoke provider actions, which generate IDs/timestamps outside the reducer, validate form values and dispatch. Reducer output rerenders both pages; the persistence effect writes changed task data. Derived statistics and filtered collections are not stored separately.

## State management decisions

`useState` owns form drafts/errors, a single modal mode plus selected ID, feedback and filters. Only the reducer owns task records. Edits replace matching records while preserving ID and creation time; they do not append. Completion toggles to completed; reopening intentionally returns to pending. Deletion removes one ID after a confirmation dialog. Due dates use calendar strings without timezone conversion for display.

`useMemo` caches the linear statistics and search/filter scans while unrelated UI state changes. This is a practical dependency boundary rather than a benchmark claim. Stable provider actions and page edit/delete/toggle callbacks allow memoized TaskCard instances to skip unrelated modal/filter renders when their record is unchanged. The small filter setter and form handlers do not need useCallback.

Context is adequate for this application size. All context consumers still rerender when the shared context value changes; a larger application could split state/actions or use selectors. No external state library is introduced.

## Reducer design

| Action  | Payload                            | Result                                                 |
| ------- | ---------------------------------- | ------------------------------------------------------ |
| add     | task with stable ID and timestamps | Prepend unless ID already exists                       |
| update  | ID, clean changes, timestamp       | Replace matching task; preserve identity and createdAt |
| delete  | ID                                 | Filter matching task out                               |
| toggle  | ID, timestamp                      | Completed → pending; other states → completed          |
| unknown | none                               | Return original state                                  |

Reducers never call storage, clocks or random ID generators. `crypto.randomUUID()` is called in the add action, and ISO timestamps are supplied by action creators. See actual implementation excerpts below.

## Custom hooks

`useTasks()` exposes tasks, addTask, updateTask, deleteTask, toggleTaskStatus, stats and storageError. It throws a clear developer error if used outside TaskProvider. It uses React 19 `use(Context)`, the current context-reading API supported by the installed lint rules.

`useLocalStorage(key)` returns initialTasks, error and save. A lazy state initializer reads synchronously before useReducer receives its initial collection. The save callback skips the exact initial array, so both normal mounting and StrictMode replay avoid writing an empty default over valid saved data. Failed reads retain original bytes and disable automatic writes for that provider session. Users can continue working in memory; recovery/export controls are future work. Failed writes show a warning; a subsequent task change retries when the initial read succeeded.

`useTaskFilters(tasks)` returns filters, filteredTasks, setFilter and resetFilters. It combines exact status/priority checks with case-insensitive title and description search. Whitespace-only queries behave as empty search. Array.filter creates a derived collection without changing the source. Filters reset on leaving Tasks and are not persisted.

## Persistence and lifecycle

The versioned key is `taskflow.tasks.v1`, with `{ version: 1, tasks: [...] }`. Validation checks the version, array shape, unique nonempty IDs, title/description bounds, allowed enums, real dates and valid timestamps. Malformed JSON, invalid schema, blocked storage and quota failures are caught. No credentials, backend data, modal visibility or draft text are stored.

The effect runs after committed task changes. Initialization does not write. Valid data survives a refresh and remount; empty successful initialization writes only after a user action changes the reducer array. If storage is corrupt, the warning makes session-only behavior explicit and leaves recovery possible. Multi-tab synchronization, migrations, cloud sync and backups are outside Week 3. Task deletion is permanent in this local collection; there is no undo or recycle bin.

## Component contracts and accessibility

TaskForm accepts optional task (new-task defaults), onSave(values), onCancel. TaskCard accepts task and onEdit/onDelete/onToggle(ID). TaskList accepts tasks, hasTasks and those callbacks. TaskFilters accepts filters, setFilter(name,value), resetFilters.

All seven Week 2 primitives are reused. Input gained an optional `multiline` prop (false by default) so description fields reuse labels, generated IDs, helper/error associations and disabled semantics. The due-date field also handles native input events; actual browser testing exposed that fill/input paths did not synchronize through change alone.

The form disables native blocking validation to provide associated error messages consistently, announces the error summary and focuses the first invalid field. Title is required and capped at 120 characters; description is capped at 2000. Each action includes the task title in its accessible name. Status and priority are written text rather than color alone. A polite feedback region reports task changes and a result-count region reports filtered counts.

The existing modal traps Tab/Shift+Tab, closes on Escape, makes the background inert and restores a connected opener. Delete initially focuses Keep task; after actual deletion focus moves to New task because the old opener has been removed. One dialog mode prevents concurrent modals. Native form controls and buttons support keyboard interaction. Existing reduced-motion styles remain. This is not a WCAG conformance audit, screen-reader certification or cross-browser guarantee.

## Testing and actual verification

Executed on 19 October 2026 with Node 24.22.0 and npm 11.19.1:

| Command                   | Observed result                                             |
| ------------------------- | ----------------------------------------------------------- |
| npm ci                    | Exit 0; 890 installed packages                              |
| npm test -- --watch=false | 44 passed, 0 failed across 3 suites                         |
| npm run lint              | Exit 0, no warnings                                         |
| npm run format:check      | Exit 0                                                      |
| npm run build             | Exit 0, three Webpack performance warnings                  |
| npm start                 | Development server served the application on localhost:3000 |
| npm audit --json          | Exit 1; 26 advisories (21 moderate, 5 high), no critical    |

The 11 new tests exercise an integrated CRUD and modal lifecycle, invalid title feedback, dashboard sharing, combined UI filters/search/reset, pure immutable reducer transitions, context actions, StrictMode hydration without initial writes, remount persistence, three corrupt-storage cases, restriction/quota failures, filter-hook behavior, statistics and invalid dates. The 33 Week 2 tests pass unchanged. One initial assertion matched both a status badge and select option; it was corrected to query the task list. No snapshot tests are used.

Browser verification used the in-app browser on macOS. At 1440px: creation, blank-title validation, populated edit, status changes, completion/reopening, combined filters, empty results, reset, refresh persistence, due-date editing and dashboard counts. At 768px: task layout and delete cancellation with Escape and focus restoration. At 390px: keyboard Enter opened/saved a task, confirmed deletion worked, and existing Components/Settings routes rendered. The task page had no horizontal overflow at 768px and 390px. These are representative checks across widths, not every workflow repeated at every width. Captured browser error logs were empty. One retained demonstration task remains in the preview browser; new users start with their own empty storage.

## Evidence and limitations

`evidence/week3/` contains real browser captures for creation, edit, populated list, filtering/search, dashboard statistics, refresh persistence, deletion confirmation, mobile and tablet. Command logs are verbatim output, not fabricated terminal screenshots. Screenshots show demonstration data entered during verification. Week 1/2 evidence is preserved.

The existing Webpack production bundle exceeds recommended asset/entry thresholds and emits three warnings. The clean install reports deprecated transitive packages and optional native install-script notices. npm audit reports 26 dependency advisories, including five high findings in the development-server dependency chain; proposed remediation includes a webpack-dev-server major-version upgrade. No force upgrade was applied as part of task-state implementation. Keep development hosting local; dependency migration and bundle splitting remain follow-up work. No backend, authentication, collaboration, notifications, export, undo, storage-recovery UI, multi-tab synchronization or full accessibility audit is included.

## Planned 35 hour allocation

| Work item                                     | Planned hours |
| --------------------------------------------- | ------------: |
| Review Week 2 and design state contracts      |             3 |
| Pure reducer, model validation and statistics |             4 |
| Context, custom hooks and persistence         |             6 |
| Forms, task cards and CRUD dialogs            |             7 |
| Search, filters and dashboard integration     |             4 |
| Automated regression tests and browser checks |             6 |
| Documentation, report and submission evidence |             5 |
| Total                                         |            35 |

This is a planning allocation, not measured attendance. Weeks 4–6 can refine organization/preferences, broaden testing and performance, then prepare final delivery. Week 3 delivers a working local task manager while preserving the prior foundations.

## Actual implementation excerpts

### src/reducers/taskReducer.js

```jsx
export function taskReducer(tasks, action) {
  switch (action.type) {
    case 'add':
      return tasks.some((t) => t.id === action.task.id) ? tasks : [action.task, ...tasks];
    case 'update':
      return tasks.map((t) =>
        t.id === action.id
          ? {
              ...t,
              ...action.changes,
              id: t.id,
              createdAt: t.createdAt,
              updatedAt: action.timestamp,
            }
          : t,
      );
    case 'delete':
      return tasks.filter((t) => t.id !== action.id);
    case 'toggle':
      return tasks.map((t) =>
        t.id === action.id
          ? {
              ...t,
              status: t.status === 'completed' ? 'pending' : 'completed',
              updatedAt: action.timestamp,
            }
          : t,
      );
    default:
      return tasks;
  }
}
```

### src/hooks/useLocalStorage.js

```jsx
import { useCallback, useState } from 'react';
import { readTasks, writeTasks, TASK_STORAGE_KEY } from '../services/taskStorage';
/** A failed read preserves the original bytes and disables automatic writes. */
export function useLocalStorage(key = TASK_STORAGE_KEY) {
  const [initial] = useState(() => readTasks(key));
  const [error, setError] = useState(initial.error);
  const save = useCallback(
    (tasks) => {
      if (tasks === initial.tasks || initial.error) return;
      setError(writeTasks(tasks, key));
    },
    [initial, key],
  );
  return { initialTasks: initial.tasks, error, save };
}
```

### src/hooks/useTaskFilters.js

```jsx
import { useMemo, useState } from 'react';
const empty = { status: '', priority: '', search: '' };
export function useTaskFilters(tasks) {
  const [filters, setFilters] = useState(empty);
  const filteredTasks = useMemo(() => {
    const query = filters.search.trim().toLocaleLowerCase();
    return tasks.filter(
      (task) =>
        (!filters.status || task.status === filters.status) &&
        (!filters.priority || task.priority === filters.priority) &&
        `${task.title} ${task.description}`.toLocaleLowerCase().includes(query),
    );
  }, [tasks, filters]);
  return {
    filters,
    filteredTasks,
    setFilter: (name, value) =>
      setFilters((previous) => ({ ...previous, [name]: value })),
    resetFilters: () => setFilters(empty),
  };
}
```

### src/context/TaskContext.jsx

```jsx
import { createContext, useCallback, useEffect, useMemo, useReducer } from 'react';
import { taskReducer } from '../reducers/taskReducer';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { taskStatistics } from '../utils/taskStatistics';
import { validateTask } from '../utils/taskValidation';
export const TaskContext = createContext(null);
function clean(values) {
  if (Object.keys(validateTask(values)).length) throw new Error('Invalid task');
  return {
    title: values.title.trim(),
    description: values.description.trim(),
    priority: values.priority,
    status: values.status,
    dueDate: values.dueDate,
  };
}
export function TaskProvider({ children }) {
  const { initialTasks, error, save } = useLocalStorage();
  const [tasks, dispatch] = useReducer(taskReducer, initialTasks);
  useEffect(() => {
    save(tasks);
  }, [tasks, save]);
  const addTask = useCallback((values) => {
    const timestamp = new Date().toISOString();
    dispatch({
      type: 'add',
      task: {
        ...clean(values),
        id: crypto.randomUUID(),
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    });
  }, []);
  const updateTask = useCallback(
    (id, values) =>
      dispatch({
        type: 'update',
        id,
        changes: clean(values),
        timestamp: new Date().toISOString(),
      }),
    [],
  );
  const deleteTask = useCallback((id) => dispatch({ type: 'delete', id }), []);
  const toggleTaskStatus = useCallback(
    (id) => dispatch({ type: 'toggle', id, timestamp: new Date().toISOString() }),
    [],
  );
  const stats = useMemo(() => taskStatistics(tasks), [tasks]);
  const value = useMemo(
    () => ({
      tasks,
      stats,
      storageError: error,
      addTask,
      updateTask,
      deleteTask,
      toggleTaskStatus,
    }),
    [tasks, stats, error, addTask, updateTask, deleteTask, toggleTaskStatus],
  );
  return <TaskContext value={value}>{children}</TaskContext>;
}
```

### Local draft and controlled side effect

From TaskForm and TaskContext:

```jsx
const [values, setValues] = useState(() => ({ ...task }));
useEffect(() => {
  save(tasks);
}, [tasks, save]);
```
