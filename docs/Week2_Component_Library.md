# TaskFlow Week 2 Component Library

Week 2 extends the existing Week 1 React application with seven reusable UI components and a live `/components` route. The existing forest-green, lime, off-white, and neutral palette remains in place. All examples are local previews; they do not create tasks or save workspace settings.

## Install and use

Use Node.js 24 and npm 10 or newer, run `npm ci`, then `npm start`. Open http://localhost:3000/components. `npm test` runs Jest and React Testing Library in jsdom; `npm run test:watch` starts watch mode. Run lint, format:check, and build before committing. Actual results, browser dimensions, screenshots, and limitations are recorded in `evidence/week2/README.md`.

```jsx
import { Button, Input, Modal, Card, Badge, Select, Alert } from './components/ui';
```

Each component lives in `src/components/ui/<Name>/` with its JSX implementation and SCSS stylesheet. This document is the central prop and usage reference. The reusable components use no routing, global task state, or network calls.

## Architecture and hierarchy

```text
BrowserRouter > App > AppLayout
  Sidebar > Components navigation link
  Header > route breadcrumb
  main > ComponentsPage
    PageHeading
    section navigation and feedback Alert
    Button variants, sizes and loading demonstration
    Input > controlled validation form
    Modal > portal in body > Input and Button actions
    Card > optional heading, description, actions, content and footer
    Badge variants and sizes
    Select > controlled native selection
    Alert variants, dismiss and restore controls
```

The page owns demo state. Components expose props and callbacks rather than knowing about the showcase. Form validation belongs to the parent; Input and Select display the supplied error. Card is a general surface, while the existing StatCard and PageHeading keep their distinct responsibilities. Existing components were not duplicated or replaced.

## Styling and design tokens

`src/styles/_tokens.scss` defines colors, font family, three type sizes, six spacing steps, radii, a dialog shadow, and a focus-ring mixin. All new styles use Sass `@use`; the new `.scss` Webpack rule chains the existing development/production style loader, css-loader, and sass-loader. The separate `.css` rule is retained. No CSS framework or gradient was added.

New component selectors have a `ui-` prefix so they do not collide with Week 1's button or panel styles. The showcase uses a two-column grid above 1100px and a single column below it; alerts become one column below 580px. Cards reduce padding below 480px, controls allow wrapping, and the mobile sidebar has a two-by-two navigation grid for four routes. Dialogs use a bounded dynamic viewport height with internal scrolling. Button transition and spinner animation are disabled for reduced-motion preferences. The global Week 1 reduced-motion rule remains active.

## Button

### Purpose and design rationale

A native action control with four visual priorities. Primary uses forest green, secondary uses lime, outline supports quieter actions, and danger signals destructive intent through both color and the supplied text.

### Props and defaults

| Prop        | Type                                      | Default                 | Responsibility                                  |
| ----------- | ----------------------------------------- | ----------------------- | ----------------------------------------------- |
| children    | ReactNode                                 | Required unless loading | Visible action name                             |
| variant     | primary \| secondary \| outline \| danger | primary                 | Visual action priority                          |
| size        | sm \| md \| lg                            | md                      | Padding, text size and height                   |
| disabled    | boolean                                   | false                   | Native disabled behavior                        |
| loading     | boolean                                   | false                   | Disable while work is pending; expose aria-busy |
| loadingText | string                                    | Working…                | Accessible pending label                        |
| type        | button \| submit \| reset                 | button                  | Native form behavior                            |
| className   | string                                    | empty string            | Additional root class                           |
| ...props    | native button props                       | none                    | onClick, ref, form, aria-label, etc.            |

### Usage example

```jsx
<Button variant="primary" onClick={save} loading={saving} loadingText="Saving…">Save changes</Button>
<Button variant="outline" size="sm">Cancel</Button>
```

### Styling and responsive behavior

Uses the shared font, spacing, radii and focus mixin. Small and medium sizes retain a 44px minimum target; large is 52px. Rows wrap without forced minimum widths.

### Accessibility implementation

Native keyboard Enter/Space activation, visible focus, disabled and loading controls excluded from tab order. Loading keeps a readable label; the decorative spinner is hidden from assistive technology.

### Limitations and edge cases

Loading is controlled by the parent and does not itself run asynchronous work. Use a specific action label, not an icon alone. This is a button, not a polymorphic navigation link. Unsupported variant/size strings are outside the documented API.

## Input

### Purpose and design rationale

A labeled native single-line input that keeps validation, helper text and accessible descriptions together. Native attributes remain available rather than hiding platform behavior.

### Props and defaults

| Prop             | Type               | Default      | Responsibility                                                     |
| ---------------- | ------------------ | ------------ | ------------------------------------------------------------------ |
| label            | string             | required     | Persistent accessible label                                        |
| id               | string             | React useId  | Override generated identifier                                      |
| helperText       | string             | undefined    | Additional guidance                                                |
| error            | string             | undefined    | Visible error and aria-invalid                                     |
| required         | boolean            | false        | Native required state and visible marker                           |
| className        | string             | empty string | Additional field wrapper class                                     |
| aria-describedby | string             | undefined    | External description IDs merged with helper/error IDs              |
| ...props         | native input props | none         | value, onChange, placeholder, disabled, type, ref, maxLength, etc. |

### Usage example

```jsx
const [title, setTitle] = useState('');
<Input
  label="Task title"
  value={title}
  onChange={(event) => setTitle(event.target.value)}
  required
  placeholder="What needs doing?"
  helperText="Use a clear title"
  error={error}
/>;
```

### Styling and responsive behavior

Shared field mixin provides a full-width control, comfortable minimum height, consistent border, helper text and explicit error color. Long guidance wraps; the parent grid determines width.

### Accessibility implementation

Every field has a label linked by htmlFor/id. Helper and error IDs are merged into aria-describedby; error sets aria-invalid. Required is conveyed natively as well as visually. Error text is not automatically assertive or repeatedly announced.

### Limitations and edge cases

Parent code validates data and decides when to display errors and move focus. Do not switch between controlled and uncontrolled usage during a field lifetime. Supply one visible text label and do not override its accessible name inconsistently. This component is not a textarea or checkbox wrapper.

## Modal

### Purpose and design rationale

A controlled dialog for one focused task. It renders outside the application root so background content can be made inert while the dialog remains interactive.

### Props and defaults

| Prop            | Type                     | Default   | Responsibility                      |
| --------------- | ------------------------ | --------- | ----------------------------------- |
| open            | boolean                  | false     | Mount or unmount the dialog         |
| title           | string                   | required  | Accessible dialog name              |
| onClose         | function                 | required  | Parent closes controlled open state |
| description     | string                   | undefined | Optional concise dialog description |
| children        | ReactNode                | undefined | Dialog body                         |
| footer          | ReactNode                | undefined | Actions below a separator           |
| size            | sm \| md \| lg           | md        | Maximum widths 400 / 520 / 720px    |
| initialFocusRef | ref to a focusable child | undefined | Override initial close-button focus |
| closeOnBackdrop | boolean                  | false     | Opt in to closing on overlay clicks |

### Usage example

```jsx
const [open, setOpen] = useState(false);
<Button onClick={() => setOpen(true)}>Review changes</Button>
<Modal open={open} title="Review changes" onClose={() => setOpen(false)} footer={<Button onClick={() => setOpen(false)}>Done</Button>}>
  <p>Check your changes before continuing.</p>
</Modal>
```

### Styling and responsive behavior

The fixed overlay centers a bounded-width surface. The surface scrolls within calc(100dvh - available padding); mobile reduces padding. No modal entrance animation is required.

### Accessibility implementation

role=dialog, aria-modal, and generated title/description IDs supply semantics. On mount, the component saves the opener and prior body overflow, mounts its portal, marks other body children inert, locks scroll, and sets initial focus. Tab and Shift+Tab wrap; a focusin guard redirects escaped focus. Escape and the named close button call onClose. Cleanup restores scroll/inert state, removes listeners and portal, and restores a connected opener.

### Limitations and edge cases

Only one modal may be active at a time; stacked/nested modals, iframe focus, shadow-root focus and embedded complex widgets require a more advanced focus manager. Do not autofocus a disabled or hidden initialFocusRef. New body siblings inserted after opening are not observed for inert. The application targets modern browsers with inert support; verify older browser needs separately. Rendering assumes a browser document and is not server-rendering compatible.

## Card

### Purpose and design rationale

A reusable content surface with optional framing elements. It keeps the Week 1 panel visual language while allowing future pages to compose their own content.

### Props and defaults

| Prop        | Type             | Default      | Responsibility                    |
| ----------- | ---------------- | ------------ | --------------------------------- |
| title       | string           | undefined    | Optional h3 heading               |
| description | string           | undefined    | Supporting text below the heading |
| actions     | ReactNode        | undefined    | Header actions                    |
| children    | ReactNode        | undefined    | Flexible body content             |
| footer      | ReactNode        | undefined    | Optional separated footer         |
| className   | string           | empty string | Additional root class             |
| ...props    | native div props | none         | id, aria attributes, etc.         |

### Usage example

```jsx
<Card
  title="Today’s focus"
  description="A small, useful step"
  actions={<Badge variant="success">Ready</Badge>}
  footer={<Button variant="outline">View details</Button>}
>
  <p>Your task content goes here.</p>
</Card>
```

### Styling and responsive behavior

White surface, shared radius and spacing, light border, wrapping header/action row, and optional footer divider. Padding reduces on narrow screens and children can shrink in grid layouts.

### Accessibility implementation

The surface is a div and adds no fake interactive role. The default title is h3; place cards below an appropriate page/section heading. Use real buttons or links for actions, not click handlers on the entire card.

### Limitations and edge cases

Heading level is fixed at h3, so compose the surrounding heading order accordingly. Do not nest incompatible interactive elements. Card does not manage layout columns or fetch data; the page owns those concerns.

## Badge

### Purpose and design rationale

A concise textual state label. Soft contextual colors remain secondary to the written label, and badges do not announce static content as notifications.

### Props and defaults

| Prop      | Type                                                  | Default      | Responsibility                   |
| --------- | ----------------------------------------------------- | ------------ | -------------------------------- |
| children  | ReactNode                                             | required     | Textual status or category       |
| variant   | success \| warning \| error \| neutral \| information | neutral      | Contextual color treatment       |
| size      | sm \| md                                              | md           | Compact or regular padding/text  |
| className | string                                                | empty string | Additional root class            |
| ...props  | native span props                                     | none         | id, title, aria attributes, etc. |

### Usage example

```jsx
<Badge variant="success">Complete</Badge>
<Badge variant="warning" size="sm">Due soon</Badge>
```

### Styling and responsive behavior

Pill radius, shared palette, two size scales and wrapping text. Badges fit within parent content and use no fixed width.

### Accessibility implementation

Renders a non-live span with readable text. Meaning is not communicated by color alone. No role=status or alert is added by default.

### Limitations and edge cases

Not a button, counter animation, or live notification. Use Alert for feedback that must be announced. Keep labels concise and explicit. Unsupported variants/sizes are outside the API.

## Select

### Purpose and design rationale

A native single-select with the same label, error and helper conventions as Input. Native behavior is preferable to rebuilding a listbox without a demonstrated requirement.

### Props and defaults

| Prop             | Type                                 | Default      | Responsibility                                           |
| ---------------- | ------------------------------------ | ------------ | -------------------------------------------------------- |
| label            | string                               | required     | Persistent accessible name                               |
| options          | array of { value, label, disabled? } | required     | Unique option values and readable labels                 |
| id               | string                               | React useId  | Override identifier                                      |
| placeholder      | string                               | undefined    | Disabled empty-value option                              |
| helperText       | string                               | undefined    | Supporting guidance                                      |
| error            | string                               | undefined    | Error text and aria-invalid                              |
| required         | boolean                              | false        | Native required state                                    |
| className        | string                               | empty string | Additional wrapper class                                 |
| aria-describedby | string                               | undefined    | External description IDs to merge                        |
| ...props         | native select props                  | none         | value, defaultValue, onChange, disabled, name, ref, etc. |

### Usage example

```jsx
const [priority, setPriority] = useState('');
<Select
  label="Priority"
  placeholder="Choose a priority"
  value={priority}
  onChange={(event) => setPriority(event.target.value)}
  options={[
    { value: 'low', label: 'Low' },
    { value: 'high', label: 'High' },
  ]}
/>;
```

### Styling and responsive behavior

Shared field tokens plus native appearance and space for the platform arrow. Full width within its parent; options use the browser’s native menu.

### Accessibility implementation

Native labels, keyboard selection, disabled controls/options and required behavior remain intact. Error/helper IDs are linked through aria-describedby. A placeholder is a disabled empty option, not a substitute for the persistent label.

### Limitations and edge cases

This is a single-select API, not a custom searchable or multi-select widget. With a placeholder, initialize controlled value or defaultValue to an empty string; use non-empty unique strings for real options. Do not switch controlled mode. Native popup styling varies by browser/OS.

## Alert

### Purpose and design rationale

Contextual feedback with optional dismissal. Static examples remain quiet on page load; callers explicitly choose announcements for newly generated feedback.

### Props and defaults

| Prop         | Type                                       | Default              | Responsibility                                    |
| ------------ | ------------------------------------------ | -------------------- | ------------------------------------------------- |
| title        | string                                     | undefined            | Optional visible title                            |
| children     | ReactNode                                  | undefined            | Message content                                   |
| variant      | success \| error \| warning \| information | information          | Contextual treatment                              |
| onDismiss    | function                                   | undefined            | Adds a native dismiss button; parent owns removal |
| dismissLabel | string                                     | Dismiss notification | Accessible dismiss-button name                    |
| announce     | boolean                                    | false                | Opt into live status/error semantics              |
| className    | string                                     | empty string         | Additional root class                             |
| ...props     | native div props                           | none                 | id and other compatible attributes                |

### Usage example

```jsx
<Alert
  variant="success"
  title="Saved"
  announce
  onDismiss={() => setVisible(false)}
  dismissLabel="Dismiss save confirmation"
>
  Your changes are ready.
</Alert>
```

### Styling and responsive behavior

Soft contextual background, a decorative symbol, wrapping message content and a 44px dismiss target. Message columns stack with the page layout.

### Accessibility implementation

With announce=false there is no live role. announce=true uses role=status for non-error feedback and role=alert for errors, with atomic content. The symbol is decorative and dismissal has an accessible name. Avoid mounting many announced alerts at once.

### Limitations and edge cases

Parent code removes the alert and manages focus if the dismissed control disappears. onDismiss does not automatically hide the component. Use informative text rather than relying on icons/colors. Do not use Alert as a complete error summary without adding links and form focus handling.

## Reuse in Weeks 3 through 6

The explicit Week 2 UI-library assignment supersedes the original Week 1 estimate that put task essentials in Week 2. The original Week 1 report and roadmap remain preserved as historical planning records.

| Week | Proposed reuse                                                                                                                                                                  |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 3    | TaskForm uses Input, Select and Button; task lists use Card and Badge; Modal supports edit/confirmation flows. Introduce task state and storage as feature requirements settle. |
| 4    | Search/filter controls reuse Input and Select; preferences reuse forms and feedback; dashboard panels reuse Card and real derived badges/statistics.                            |
| 5    | Expand user-visible behavior, storage tests, keyboard/screen-reader checks and browser coverage; refine the existing component contracts instead of duplicating primitives.     |
| 6    | Production acceptance, performance and source-map decisions, responsive polish, final screenshots, deployment and demonstration.                                                |

## Week 2 planned work breakdown

This allocation is a plan, not verified attendance or a claim about this automation session’s elapsed time.

| Work area                                   | Planned hours | Output                                                   |
| ------------------------------------------- | ------------: | -------------------------------------------------------- |
| Review Week 1 and define contracts          |             3 | Existing design audit and component API plan             |
| Sass and token setup                        |             4 | SCSS loaders, tokens, isolated selectors                 |
| Button, Input and Select                    |             6 | Native controls and field states                         |
| Modal focus and lifecycle                   |             6 | Dialog semantics, focus containment and cleanup          |
| Card, Badge and Alert                       |             4 | Composable surfaces and feedback                         |
| Interactive showcase and responsiveness     |             4 | New route and navigation integration                     |
| Testing, evidence, documentation and report |             8 | Executed checks, screenshots, Word report and submission |
| **Total**                                   |        **35** | **Planned Week 2 allocation**                            |

## Validation and evidence

Jest/jsdom tests do not model visual layout, the full accessibility tree, a native select popup, or actual screen-reader announcements. Browser observations and screenshots are recorded separately. The evidence README lists executed commands, actual browser viewport sizes, resolved dependency versions, failures and fixes, and any remaining acceptance gaps. No WCAG or cross-browser compliance claim is made.

Week 1 documents and evidence are preserved. The Week 2 Word report is `docs/ReactJS_Internship_Week2_Component_Library.docx`; the portal description is `submission-week2-description.txt`.
