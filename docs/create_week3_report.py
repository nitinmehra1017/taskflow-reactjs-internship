"""Rebuild the Week 3 report using python-docx from the bundled document runtime."""

from pathlib import Path

from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "ReactJS_Internship_Week3_State_Management_and_Hooks.docx"
doc = Document()
section = doc.sections[0]
section.page_width = Inches(8.27)
section.page_height = Inches(11.69)
section.top_margin = Inches(0.78)
section.bottom_margin = Inches(0.72)
section.left_margin = Inches(0.78)
section.right_margin = Inches(0.78)
section.header_distance = Inches(0.3)
section.footer_distance = Inches(0.3)
section.different_first_page_header_footer = True

for name in ["Normal", "Title", "Subtitle", "Heading 1", "Heading 2", "Heading 3"]:
    style = doc.styles[name]
    style.font.name = "Arial"
    style.font.color.rgb = RGBColor(0, 0, 0)
    style.paragraph_format.space_after = Pt(8)

normal = doc.styles["Normal"]
normal.font.size = Pt(10.5)
normal.paragraph_format.line_spacing = 1.15
normal.paragraph_format.widow_control = True
for name, size in [("Title", 29), ("Heading 1", 21), ("Heading 2", 13), ("Heading 3", 11)]:
    doc.styles[name].font.size = Pt(size)
    doc.styles[name].font.bold = name != "Title"
    doc.styles[name].paragraph_format.keep_with_next = True
doc.styles["Subtitle"].font.size = Pt(13)
doc.styles["Subtitle"].font.italic = False

header = section.header.paragraphs[0]
header.text = "TaskFlow    /    YuvaIntern ReactJS Internship    /    Week 3"
header.runs[0].font.size = Pt(8)
header.runs[0].font.color.rgb = RGBColor(0, 0, 0)
footer = section.footer.paragraphs[0]
footer.alignment = WD_ALIGN_PARAGRAPH.RIGHT
footer.add_run("State management and hooks    |    ").font.size = Pt(8)
field = OxmlElement("w:fldSimple")
field.set(qn("w:instr"), "PAGE")
footer._p.append(field)

doc.core_properties.title = "TaskFlow ReactJS Internship Week 3 State Management and Hooks"
doc.core_properties.subject = "YuvaIntern Junior ReactJS Developer Internship"
doc.core_properties.author = "TaskFlow project workspace"
doc.core_properties.keywords = "ReactJS, Webpack, Week 1, YuvaIntern, TaskFlow"


def p(text, style=None):
    return doc.add_paragraph(text, style=style)


def h(text, level=2):
    return doc.add_heading(text, level=level)


def page(title):
    doc.add_page_break()
    h(title, 1)


def bullet(text):
    par = p("•  " + text)
    par.paragraph_format.left_indent = Inches(0.1)
    par.paragraph_format.first_line_indent = Inches(-0.1)
    return par


def code(text, size=8.7):
    for line in text.strip("\n").splitlines():
        par = p(line or " ")
        par.paragraph_format.space_after = Pt(0)
        par.paragraph_format.line_spacing = 1.02
        par.paragraph_format.left_indent = Inches(0.1)
        par.paragraph_format.right_indent = Inches(0.08)
        par.paragraph_format.keep_with_next = False
        shade = OxmlElement("w:shd")
        shade.set(qn("w:fill"), "F2F4F5")
        par._p.get_or_add_pPr().append(shade)
        for run in par.runs:
            run.font.name = "Courier New"
            run.font.size = Pt(size)
    p("").paragraph_format.space_after = Pt(2)


def table(headers, rows, widths, size=9):
    tab = doc.add_table(rows=1, cols=len(headers))
    tab.alignment = WD_TABLE_ALIGNMENT.CENTER
    tab.autofit = False
    for col, width in zip(tab.columns, widths):
        col.width = Inches(width)
    for cell, title, width in zip(tab.rows[0].cells, headers, widths):
        cell.width = Inches(width)
        cell.text = title
    repeat = OxmlElement("w:tblHeader")
    tab.rows[0]._tr.get_or_add_trPr().append(repeat)
    for row in rows:
        for cell, val, width in zip(tab.add_row().cells, row, widths):
            cell.width = Inches(width)
            cell.text = str(val)
    for ri, row in enumerate(tab.rows):
        cant_split = OxmlElement("w:cantSplit")
        row._tr.get_or_add_trPr().append(cant_split)
        for ci, cell in enumerate(row.cells):
            cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
            props = cell._tc.get_or_add_tcPr()
            margins = OxmlElement("w:tcMar")
            for side in ["top", "left", "bottom", "right"]:
                el = OxmlElement("w:" + side)
                el.set(qn("w:w"), "85" if side in ["top", "bottom"] else "95")
                el.set(qn("w:type"), "dxa")
                margins.append(el)
            props.append(margins)
            borders = OxmlElement("w:tcBorders")
            for side in ["top", "left", "bottom", "right"]:
                el = OxmlElement("w:" + side)
                el.set(qn("w:val"), "single")
                el.set(qn("w:sz"), "4")
                el.set(qn("w:color"), "D9D9D9")
                borders.append(el)
            props.append(borders)
            shade = OxmlElement("w:shd")
            shade.set(qn("w:fill"), "243D48" if ri == 0 else ("F0F4F6" if ri % 2 == 0 else "FFFFFF"))
            props.append(shade)
            for par in cell.paragraphs:
                par.paragraph_format.space_after = Pt(0)
                par.paragraph_format.line_spacing = 1.08
                if widths[ci] < 0.8:
                    par.alignment = WD_ALIGN_PARAGRAPH.CENTER
                for run in par.runs:
                    run.font.size = Pt(size)
                    run.font.bold = ri == 0
                    run.font.color.rgb = RGBColor(255, 255, 255) if ri == 0 else RGBColor(0, 0, 0)
    p("").paragraph_format.space_after = Pt(1)
    return tab

EVIDENCE = ROOT / 'evidence' / 'week3'
def picture(filename, width, description):
    par = p('')
    par.alignment = WD_ALIGN_PARAGRAPH.CENTER
    shape = par.add_run().add_picture(str(EVIDENCE / filename), width=Inches(width))
    shape._inline.docPr.set('descr', description)
def caption(text):
    par = p(text)
    for run in par.runs:
        run.font.size = Pt(9)
        run.font.italic = True

p('YuvaIntern Junior ReactJS Developer Internship', 'Subtitle')
p('').paragraph_format.space_after = Pt(36)
p('TaskFlow Week 3 State Management and Hooks', 'Title')
p('Implementation and verification report', 'Subtitle')
p('Week 3 of the six week ReactJS internship')
p('Prepared on 19 October 2026')
p('').paragraph_format.space_after = Pt(28)
h('Project outcome')
p('TaskFlow now provides a functional local task manager with creation, editing, completion, reopening, confirmation-based deletion, search and filtering. Dashboard statistics derive from the same collection. React Hooks, a pure reducer and Context API organize application state, while versioned browser storage preserves valid tasks across refreshes.')
p('The implementation extends the existing project in place and reuses the Week 2 interface library. Week 1 and Week 2 commits, reports and evidence are preserved. The full automated suite passed 44 tests with zero failures. Genuine browser screenshots and command logs support this report.')
p('Repository: github.com/nitinmehra1017/taskflow-reactjs-internship')
p('Submission branch: week-3-state-management')
p('The 35 hour breakdown is a planned allocation, not a statement of measured attendance. Dependency advisories and production size warnings remain documented follow-up items.')

page('Introduction objectives and proposed solution')
h('Existing project and problem statement')
p('Week 1 established React, JavaScript and JSX, custom Webpack 5 builds, Babel, linting, formatting and routing. Week 2 added Button, Input, Modal, Card, Badge, Select and Alert, shared Sass tokens, an interactive showcase and 33 regression tests. The Tasks page was still a placeholder and the dashboard displayed structural project metrics rather than task progress.')
p('Week 3 needed a single reliable source of task data. Duplicating task arrays in individual pages would create inconsistent counts and lost changes. Persisting initial defaults too early could overwrite valid saved data, while unguarded storage access could break the application in restricted browsers.')
h('Objectives and scope')
bullet('Implement the full local task lifecycle with validated controlled forms and stable identities.')
bullet('Share task records and actions between Tasks and Dashboard through Context and a pure reducer.')
bullet('Separate storage, filtering, statistics and validation into meaningful reusable modules.')
bullet('Preserve the existing forest green, lime and neutral interface and accessible keyboard interactions.')
bullet('Verify real behavior through Jest, React Testing Library and browser checks across three widths.')
h('Proposed and implemented solution')
p('TaskProvider wraps the route tree and owns useReducer state. Pages consume useTasks; TaskForm owns only a draft. Actions validate and normalize values, assign IDs and timestamps, then dispatch pure transitions. Statistics and filters are derived values. A post-commit effect synchronizes changed task records to validated versioned localStorage. Dialogs provide focused editing and deletion confirmation.')
table(['Technology', 'Reason for use'], [
['React 19 and JavaScript JSX', 'Existing component model, Hooks and Context; no additional state library'],
['React Router', 'Preserved shared layout and Overview, Tasks, Components and Settings routes'],
['Webpack 5 and Babel', 'Existing custom compilation, asset handling and production build'],
['CSS and SCSS tokens', 'Reuse established surfaces, focus styles and responsive design'],
['Jest and React Testing Library', 'Pure logic tests and user-oriented component integration tests'],
['ESLint and Prettier', 'Hooks rules, zero-warning lint and consistent formatting'],
], [2.0,4.7])

page('State architecture and directory structure')
p('There is one authoritative task collection. TaskProvider sends records and stable actions through Context. TasksPage composes filters, list and a single dialog mode. DashboardPage consumes the same memoized statistics. Reducer transitions cause React to render current data before the storage effect runs.')
code('''src/
  context/TaskContext.jsx
  reducers/taskReducer.js
  hooks/useTasks.js
  hooks/useLocalStorage.js
  hooks/useTaskFilters.js
  services/taskStorage.js
  utils/taskValidation.js
  utils/taskStatistics.js
  components/tasks/
    TaskForm.jsx
    TaskCard.jsx
    TaskList.jsx
    TaskFilters.jsx
  pages/TasksPage.jsx
  pages/DashboardPage.jsx
  styles/tasks.css
tests/tasks.test.jsx
evidence/week3/
docs/Week3_State_Management_and_Hooks.md''')
h('Component hierarchy')
code('''App > TaskProvider > Routes > AppLayout
  DashboardPage > StatCard x 6
  TasksPage
    TaskFilters > Input + Select + Button
    TaskList > memo TaskCard > Card + Badge + Button
    Modal > TaskForm > Input + Select + Button + Alert
    Modal > deletion confirmation
  ComponentsPage + SettingsPage + NotFoundPage''')
p('TaskCard receives task and onEdit, onDelete and onToggle callbacks by ID. TaskList renders keyed cards or an appropriate empty state. TaskFilters receives controlled filters, a setter and reset action. TaskForm receives an optional existing task, onSave(values) and onCancel. Shared UI primitives remain independent of task business rules.')
p('Naming follows the existing project: PascalCase for components and context, use-prefixed camelCase hooks and camelCase utility functions. Pure modules avoid browser dependencies except the explicit storage service. Historical reports and placeholder directory READMEs remain available.')

page('React Hooks and Context implementation')
h('Local state with useState')
p('TaskForm initializes a controlled draft from the selected task. Errors are local to that form. TasksPage owns dialog mode and feedback. The filter hook owns temporary search, status and priority state. None of these temporary values are persisted.')
code('''const [values, setValues] = useState(() => ({ ...task }));
const [errors, setErrors] = useState({});
const [dialog, setDialog] = useState(null);''')
h('Reducer ownership and controlled effects')
p('The provider receives initialTasks from a lazy storage read before initializing useReducer. Storage synchronization is the only task-persistence side effect; no reducer or render function writes to storage.')
code('''const { initialTasks, error, save } = useLocalStorage();
const [tasks, dispatch] = useReducer(taskReducer, initialTasks);
useEffect(() => {
  save(tasks);
}, [tasks, save]);''')
h('Context and reusable actions')
p('useTasks reads TaskContext using the React 19 use API and rejects use outside the provider with a clear developer error. Its contract exposes tasks, stats, storageError, addTask, updateTask, deleteTask and toggleTaskStatus. All task actions use stable useCallback identities. Their clocks and crypto.randomUUID calls run outside the reducer.')
code('''const stats = useMemo(() => taskStatistics(tasks), [tasks]);
const toggleTaskStatus = useCallback(
  (id) => dispatch({ type: 'toggle', id,
    timestamp: new Date().toISOString() }), []);
const context = use(TaskContext);''')
h('Memoization tradeoffs')
p('Statistics and filters each scan the collection and are memoized against relevant dependencies. TaskCard is memoized; stable action callbacks and unchanged record references help it skip unrelated modal or filter renders. Small form handlers and filter setters remain simple functions. All Context consumers still rerender on shared changes; selector-based subscriptions would be a future scaling option.')

page('Reducer task lifecycle and custom hooks')
p('The reducer accepts complete action payloads and returns new arrays or changed record objects. It never mutates an input task, generates an ID, reads a clock or touches browser storage. Unknown actions return the original state. Adding a duplicate ID is ignored.')
table(['Action', 'Transition'], [
['add', 'Prepend a new task if its stable ID does not already exist'],
['update', 'Replace one record; preserve id and createdAt, set updatedAt'],
['toggle', 'Completed becomes pending; pending or in progress becomes completed'],
['delete', 'Filter the matching ID out of the collection'],
], [1.3,5.4])
code('''case 'toggle':
  return tasks.map((t) =>
    t.id === action.id
      ? { ...t,
          status: t.status === 'completed'
            ? 'pending' : 'completed',
          updatedAt: action.timestamp }
      : t);''')
h('Custom hook responsibilities')
table(['Hook', 'Purpose and contract'], [
['useTasks', 'Guarded access to shared task state, actions and statistics; pages do not implement their own task stores'],
['useLocalStorage', 'Lazy validated hydration; stable save callback; readable storage warnings; protects original corrupt data'],
['useTaskFilters', 'Temporary filters plus memoized case-insensitive search across title and description; combined priority/status checks and reset'],
], [1.65,5.05])
h('User task lifecycle')
p('New task opens an empty draft with medium priority and pending status. Save validates a trimmed nonempty title, supported enums, description length and a real calendar date. A valid action assigns a UUID and ISO creation/update timestamps. Edit opens populated fields and updates that ID without appending a duplicate. Complete and Reopen update status and statistics immediately. Delete asks for confirmation; cancelling leaves the collection untouched.')
p('Search, priority and status filters combine on the current collection without mutation. No matching results is distinct from an entirely empty collection. Dashboard shows total, completed, pending, in-progress, high-priority and completion percentage; an empty collection yields zero percent.')

page('Persistence validation and accessibility')
h('Storage strategy and initialization safety')
p('The versioned key taskflow.tasks.v1 stores an object containing version 1 and the task array. The service validates schema, unique nonempty IDs, enum membership, required title and bounds, optional valid dates and parseable timestamps. JSON parsing and storage access are protected by try/catch.')
code('''const [initial] = useState(() => readTasks(key));
const save = useCallback((tasks) => {
  if (tasks === initial.tasks || initial.error) return;
  setError(writeTasks(tasks, key));
}, [initial, key]);''')
p('Skipping the initial array avoids any startup write, including StrictMode effect replay. Corrupt or unreadable initial storage is preserved and automatic writes are disabled for that session. The UI explicitly warns that changes remain in memory. If a later write fails, the application keeps working and retries on another task change when initialization succeeded. Export, recovery controls, migrations and multi-tab synchronization remain future work.')
h('Accessible form and dialog behavior')
p('All fields have visible labels; errors are linked through aria-describedby and aria-invalid. Invalid submission announces an error summary and focuses the first invalid field. The optional description uses Input multiline mode to reuse field semantics. Native input events also synchronize the date field, following a browser-discovered issue with change-only handling.')
p('Buttons include task titles in their accessible names. Badges state priority and status in text. Polite status regions communicate action feedback and result counts. Delete initially focuses Keep task, Escape cancels, and the existing modal contains keyboard focus while making background content inert. Closing restores a connected opener; deletion moves focus to New task because its opener was removed.')
p('The task grid uses two columns on wider layouts and one below 600px. Filters use four, two or one columns across breakpoints. Controls wrap, descriptions preserve line breaks and long titles wrap. Existing reduced-motion behavior is preserved. Browser checks are representative; no full WCAG or assistive-technology certification is claimed.')

page('Task workflows in the running application')
p('The following figures are genuine captures from the in-app browser. Demonstration tasks were entered through the interface. These are running application screenshots, not design mockups.')
picture('edit-task.jpg',6.6,'Populated edit dialog with title, description, priority, status and persisted due date')
caption('Figure 1  Populated editing form at 1440 pixels with the saved due date')
page('Task list and saved task details')
p('The saved record retains its edited title, description, high priority and optional due date. Completion and reopening update its badge immediately; reopening intentionally returns the task to pending. The browser also verified that refreshing retains this record.')
picture('populated-list-desktop.jpg',6.6,'Desktop task list with saved task, status and priority badges and complete edit delete actions')
caption('Figure 2  Desktop list after editing and reopening a task')

page('Responsive browser verification')
p('At 1440px the browser verified required-title feedback, creation, populated editing, due date, status changes, completion/reopening, combined filters, empty results, reset, refresh persistence and dashboard counts. At 768px it verified layout, delete cancellation, Escape and focus restoration. At 390px it verified keyboard creation, confirmed deletion and preserved Components and Settings routes. Horizontal document width matched the 1440px, 768px and 390px viewports on Tasks. These are representative checks rather than every workflow repeated at every width.')
picture('mobile-390.jpg',2.65,'390 pixel mobile task layout with responsive navigation, filters and created task')
caption('Figure 3  Mobile layout after keyboard task creation')
p('A subsequent refresh retained the edited desktop task and due date. Captured browser error logs were empty. Desktop, tablet, mobile, filters, delete confirmation, creation, dashboard and persistence images are saved separately in evidence/week3. A browser presentation of verbatim command logs is also included; it is explicitly not a native Terminal capture.')

page('Testing verification challenges and future scope')
table(['Actual command', 'Observed result'], [
['npm ci', 'Exit 0; 890 installed packages; audit and deprecation notices'],
['npm test -- --watch=false', '44 passed, 0 failed, 3 suites; includes all 33 Week 2 tests'],
['npm run lint', 'Exit 0, no warnings'],
['npm run format:check', 'Exit 0; all matched files use Prettier style'],
['npm run build', 'Exit 0; three performance warnings'],
['npm start', 'Application served at localhost:3000; actual browser used'],
['npm audit --json', 'Exit 1; 21 moderate and 5 high advisories; zero critical'],
], [2.3,4.4])
p('New tests cover the integrated task lifecycle, required title and due-date input, modal confirmation and cancellation, dashboard sharing, combined filters, immutable reducer actions, Context actions, StrictMode initialization safety, remount persistence, malformed/schema-invalid storage, restriction/quota failures, filter-hook reset, statistics and invalid dates. A first test assertion matched both a badge and select option; scoping the query to the task list resolved it.')
h('Challenges and solutions')
p('Initialization safety required a lazy read before reducer creation and an explicit initial-array guard. Corrupt data recovery required preserving original bytes while warning about session-only changes. Browser testing exposed date input synchronization; handling native input events fixed the saved due date and a regression assertion now verifies it. Removed delete triggers required an explicit New task focus fallback.')
p('Three production warnings remain for asset/entry size and code-splitting recommendations. The existing dependency graph reports 26 advisories, including five high development-server-chain findings. Proposed remediation includes a major webpack-dev-server upgrade; no force update was applied. Deprecated transitive packages and optional native-script notices are retained in the installation evidence. Dependency migration and bundle optimization remain follow-up work.')
page('Planned work and conclusion')
p('The following allocation describes approximately one internship week of planned effort. It is not a record of measured attendance. The total is 35 hours.')
h('Planned work breakdown')
table(['Work item', 'Hours'], [
['Review Week 2 and state contracts',3], ['Reducer, validation and statistics',4],
['Context, custom hooks and persistence',6], ['Task forms, cards and CRUD dialogs',7],
['Filters and dashboard integration',4], ['Automated and browser verification',6],
['Documentation, report and evidence',5], ['Total planned hours',35],
], [5.9,0.8])
p('Week 3 delivers the local task workflow on the preserved foundation. Weeks 4 to 6 can refine organization and preferences, broaden accessibility/browser testing, address dependencies and bundle size, and prepare final delivery. No backend, authentication, collaboration, multi-tab synchronization, export or undo is included. The Markdown companion contains complete implementation excerpts and module responsibilities.')

for element in [doc.element, doc.styles.element]:
    for border in element.xpath('.//w:pBdr'):
        border.getparent().remove(border)
doc.save(OUT)
print(OUT)
