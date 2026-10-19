# TaskFlow architecture and component contracts

## Design approach

The application separates routing, shared layout, reusable presentation, and page composition. It uses functional React components and JavaScript with JSX. Props flow down; future task events will flow up through explicit callbacks. Local state stays local unless multiple routes need it. No global provider or storage abstraction is implemented before its requirements exist.

```text
StrictMode
└── BrowserRouter
    └── App
        └── Routes
            └── AppLayout
                ├── Sidebar
                │   ├── NavLink × 3
                │   └── Icon
                ├── Header
                │   └── Link / Icon
                ├── main > Outlet
                │   ├── DashboardPage
                │   │   ├── PageHeading
                │   │   ├── StatCard × 3 > Icon
                │   │   └── foundation / preview / roadmap sections
                │   ├── TasksPage > PageHeading / planned empty state
                │   ├── SettingsPage > PageHeading / command reference
                │   └── NotFoundPage > PageHeading / recovery link
                └── footer
```

## Implemented contracts

| Component or hook | Props or return value                                              | Responsibility                                                                                              |
| ----------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| `App`             | None                                                               | Declare nested routes and wildcard recovery.                                                                |
| `AppLayout`       | None                                                               | Compose Sidebar, Header, semantic main, Outlet, and footer.                                                 |
| `Sidebar`         | None                                                               | Render brand, three route links, and current-week context. NavLink owns active state.                       |
| `Header`          | None                                                               | Resolve the route breadcrumb and link to setup guidance.                                                    |
| `PageHeading`     | `eyebrow: string`, `title: string`, `children: ReactNode`          | Provide consistent page introduction and a single h1.                                                       |
| `StatCard`        | `label: string`, `value: string`, `detail: string`, `icon: string` | Present an honest structural metric with supporting context.                                                |
| `Icon`            | `name: string`, `size: number = 20`                                | Render a decorative SVG from the local icon map; fallback is tasks. The parent supplies accessible meaning. |
| `DashboardPage`   | None                                                               | Compose foundation overview and the static six-week roadmap.                                                |
| `TasksPage`       | None                                                               | Explain the task feature boundary and upcoming milestones.                                                  |
| `SettingsPage`    | None                                                               | Present commands, stack, and a native setup disclosure.                                                     |
| `NotFoundPage`    | None                                                               | Explain invalid routes and provide an Overview link.                                                        |
| `useRouteFocus`   | Returns `RefObject`                                                | Update document title and focus main on pathname changes.                                                   |

JavaScript prop contracts use JSDoc and this table. Components are private to the application; runtime prop validation can be added at an external API boundary if one is introduced.

## Planned components and data flow

These are design contracts, **not Week 1 implementations**.

| Future component | Proposed props                                        | Responsibility                                                                     |
| ---------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `TaskForm`       | `initialValues`, `onSubmit(values)`, `onCancel()`     | Accessible labels, controlled input, field validation, and create/edit submission. |
| `TaskList`       | `tasks`, `onToggle(id)`, `onEdit(id)`, `onDelete(id)` | Stable-key task rendering and empty-state selection.                               |
| `TaskCard`       | `task`, `onToggle`, `onEdit`, `onDelete`              | Task summary and explicit native action controls.                                  |
| `EmptyState`     | `title`, `description`, optional `action`             | Reusable contextual no-data feedback.                                              |
| `FilterBar`      | `filters`, `onChange(nextFilters)`                    | Labeled search, status, priority, and sort controls.                               |
| `TaskProvider`   | `children`                                            | Own reducer state; coordinate the persistence boundary in Week 3.                  |

Proposed task model: `{ id, title, description, status, priority, dueDate, createdAt, updatedAt }`. Validate user input and stored JSON. Status and priority values will be documented when CRUD is implemented. Prefer derived filtered views over duplicate task state. The service layer will contain a browser-storage adapter; UI components must not parse local storage directly.

## Folder ownership

- `components/`: reusable UI that is independent of a complete route.
- `layouts/`: shared page structure and routing outlets.
- `pages/`: route entry points and page composition.
- `hooks/`: reusable behavior; prefix custom hooks with `use`.
- `context/`: future cross-route state only when needed.
- `services/`: future persistence/network boundaries and serialization.
- `utils/`: future pure transformations and validation helpers.
- `styles/`: shared tokens and organized shell/page CSS; add local CSS Modules if component style ownership becomes difficult.
- `assets/`: owned static assets imported by Webpack.

Avoid barrel files until they simplify actual imports. Use relative imports consistently in this small starter. Add a feature folder only when a coherent task feature needs multiple files; do not duplicate the same component between page and feature folders.
