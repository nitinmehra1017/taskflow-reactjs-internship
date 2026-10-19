"""Rebuild the Week 4 report using python-docx from the bundled document runtime."""

from pathlib import Path

from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "ReactJS_Internship_Week4_API_Integration_and_Data_Handling.docx"
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
header.text = "TaskFlow    /    YuvaIntern ReactJS Internship    /    Week 4"
header.runs[0].font.size = Pt(8)
header.runs[0].font.color.rgb = RGBColor(0, 0, 0)
footer = section.footer.paragraphs[0]
footer.alignment = WD_ALIGN_PARAGRAPH.RIGHT
footer.add_run("API integration and data handling    |    ").font.size = Pt(8)
field = OxmlElement("w:fldSimple")
field.set(qn("w:instr"), "PAGE")
footer._p.append(field)

doc.core_properties.title = "TaskFlow ReactJS Internship Week 4 API Integration and Data Handling"
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

EVIDENCE = ROOT / 'evidence' / 'week4'
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
p('TaskFlow Week 4 API Integration and Data Handling', 'Title')
p('Implementation and verification report', 'Subtitle')
p('Week 4 of the six week ReactJS internship')
p('Prepared on 19 October 2026')
p('').paragraph_format.space_after = Pt(25)
h('Project outcome')
p('TaskFlow now includes a Remote Task Explorer that fetches actual JSONPlaceholder todos and users. It supports validated asynchronous requests, cancellation, loading and error feedback, retry, refresh, search, filters, pagination and independent local task imports. The existing task manager and all previous reports remain intact.')
p('The full automated suite passed 66 tests with zero failures. Actual browser checks covered desktop, tablet and mobile layouts, live records, imports and persistence. Transient loading and failure captures use explicitly documented controlled conditions; successful records always come from the live service.')
p('Repository: github.com/nitinmehra1017/taskflow-reactjs-internship')
p('Submission branch: week-4-api-integration')
p('The compatible audit fix updated one instrumentation package. The full graph still reports 26 development dependency advisories; production-only audit reports zero. Three bundle-size warnings remain. The 35 hour allocation is planned effort, not measured attendance.')

page('Introduction objectives and existing application')
h('Existing TaskFlow overview')
p('Week 1 established the React and JavaScript application, custom Webpack 5 and Babel pipeline, linting, formatting, routing and scalable architecture. Week 2 introduced seven reusable UI primitives, SCSS design tokens, an interactive showcase and automated tests. Week 3 added local task CRUD, Context API, reducers, custom hooks, filtering, localStorage and six task-derived dashboard statistics.')
h('Problem statement')
p('A useful remote-data feature must handle uncertain response timing, failures, invalid records and abandoned requests. Fetching inside visual cards would duplicate network logic, and importing remote objects directly would bypass local validation. Remote data also needs clear separation from the user-owned task collection.')
h('Objectives and delivered scope')
bullet('Fetch actual todos and associated users through dedicated native Fetch service modules.')
bullet('Validate HTTP status, JSON payloads, identifiers and todo-to-user relationships.')
bullet('Encapsulate request lifecycle, cancellation, retry, refresh and timeout in useRemoteTasks.')
bullet('Present remote cards with title search, completion/user filters, result counts and eight-item pages.')
bullet('Import independent local copies without duplicate source IDs or false persistence claims.')
bullet('Preserve existing routes, task workflows, visual language, keyboard support and regression tests.')
h('API selection and justification')
p('JSONPlaceholder is a free public demonstration REST API without API keys or paid services. Its todo and user collections are small and predictable enough for client-side filtering and pagination. The live browser returned 200 todos and ten users. It is a learning service, not a production task backend.')
table(['Endpoint', 'Purpose and fields'], [
['GET /todos', 'id, userId, title and completed supply remote task cards'],
['GET /users', 'id, name and username supply owner labels and user filters'],
], [1.65,5.05])
p('Base URL: https://jsonplaceholder.typicode.com. Only GET requests are made. Local edits and imported tasks are never posted back. Official API reference: https://jsonplaceholder.typicode.com/.')

page('Architecture and data flow')
code('''App > TaskProvider > AppLayout > ExplorePage
  useRemoteTasks
    fetchRemoteTasks
      getJson > native Fetch
      validateRemoteData
  RemoteTaskFilters > Input + Select + Button
  RemoteTaskList > RemoteTaskCard > Card + Badge + Button
  RemoteTaskSkeleton + Alert

Import > TaskProvider.importRemoteTask
       > local validation + UUID + timestamps + sourceId
       > taskReducer duplicate guard
       > Tasks and Dashboard
       > existing localStorage effect''')
table(['Module', 'Responsibility'], [
['services/apiClient.js', 'Base URL, status checks, JSON decoding and error classification'],
['services/remoteTaskService.js', 'Concurrent endpoint requests, joined validation and field projection'],
['utils/remoteTaskValidation.js', 'Types, bounds, unique IDs, user references and remote source key'],
['hooks/useRemoteTasks.js', 'Async state, lifecycle effect, timeout, abort, retry and stale-result protection'],
['pages/ExplorePage.jsx', 'Filter/page state, derived results, import feedback and composition'],
['components/remote/', 'Card, filters, list and static skeleton presentation'],
['styles/explore.css', 'Responsive layouts using the existing palette and primitives'],
['tests/remote.test.jsx', 'Service, hook and integrated explorer/import behavior tests'],
], [2.45,4.25])
p('The new route is added to Sidebar, Header and route focus/title mapping. The shared layout still hosts Dashboard, Tasks, Components, Settings and the not-found page. Local imported cards identify themselves as local copies. No external fetching or UI dependency was introduced.')
h('Direction of state flow')
p('The request hook owns remote snapshots and request feedback. ExplorePage owns only temporary controls and derives filtered/paged results. Local task state remains in TaskProvider. Import passes one validated remote todo into an explicit mapping action; user objects never enter the local task model.')

page('Fetch async await and response validation')
h('HTTP and decoding boundary')
p('getJson awaits Fetch with a cancellation signal, Accept application/json and cache no-store. Network failures receive connection guidance; non-OK HTTP responses retain the status code. JSON decoding failures are distinguished from transport failures. Abort exceptions propagate so cancellation is not misreported as a network fault.')
code('''response = await fetch(`${API_BASE_URL}${path}`, {
  signal,
  cache: 'no-store',
  headers: { Accept: 'application/json' },
});
if (!response.ok)
  throw new ApiError(
    `JSONPlaceholder returned HTTP ${response.status}. Please try again.`,
    'http', response.status);
return await response.json();''',8)
h('Concurrent service requests')
code('''const [todos, users] = await Promise.all([
  getJson('/todos', { signal }),
  getJson('/users', { signal }),
]);
if (!validateRemoteData(todos, users))
  throw new ApiError(
    'JSONPlaceholder returned unexpected task or user data. Please try again.',
    'validation');''',8)
h('Payload contract')
p('Both values must be arrays with at most 1000 records. Todo IDs and user IDs are positive safe integers and unique. Titles are nonblank strings no longer than 120 characters, completion is boolean, and every userId resolves to a validated user. User names and usernames are bounded strings. Empty valid collections are supported.')
p('Invalid snapshots are rejected as a whole to avoid misleading owner labels and invalid imports. The service projects only the fields used by the explorer; extra user details are discarded. This bounds parsed record counts, not streaming response bytes. The third-party service remains responsible for availability and payload delivery.')

page('Custom hook lifecycle and asynchronous states')
p('useRemoteTasks owns data, loading and error state plus a request revision. A stable refresh callback increments revision. One useEffect owns the complete lifecycle for that generation; search, filters, pagination and imports do not refetch.')
code('''const controller = new AbortController();
let active = true;
let timedOut = false;
const timer = setTimeout(() => {
  timedOut = true;
  controller.abort();
}, REQUEST_TIMEOUT_MS);

const data = await fetchRemoteTasks({ signal: controller.signal });
if (active && !controller.signal.aborted)
  setState({ data, loading: false, error: null });

return () => {
  active = false;
  clearTimeout(timer);
  controller.abort();
};''',8.5)
p('The excerpt shows lifecycle operations from the implemented effect; the await is inside its async load function. Cleanup stops obsolete work and prevents updates after unmount. The active flag also rejects late results from a transport that ignores abort. Finally clears the timer; a failed endpoint aborts its sibling. StrictMode replay follows the same cleanup path.')
table(['State', 'User-facing behavior'], [
['Initial loading', 'Polite loading status, static hidden-from-AT skeleton and disabled Loading button'],
['Refresh', 'Refreshing button, busy results and retained previous successful snapshot'],
['HTTP or network error', 'Meaningful message, Retry action and retained data when available'],
['Validation failure', 'Unexpected-response feedback; invalid data never enters cards or imports'],
['Timeout', '15-second deadline, aborted transport and explicit retryable timeout feedback'],
['Cancellation', 'No false error announcement on route change or newer generation'],
], [1.55,5.15])
p('There is no automatic retry loop or remote cache across route unmounts. These are deliberate limits for a compact learning application; requests occur on mount or explicit Refresh/Retry.')

page('Filtering pagination imports and accessibility')
h('Efficient derived presentation')
p('useMemo derives a user lookup Map, imported source-ID Set and combined filtered todos. Search is case-insensitive and title-only; completion and user filters combine. Eight-item pagination slices those records. Page count, visible range and bounded current page are derived rather than duplicated state. Filter changes reset page one; smaller refreshed results clamp it without an effect. Stable remote IDs are list keys.')
h('Remote to local mapping')
p('importRemoteTask validates the selected todo, maps its title and completion into the existing local model, assigns medium priority and blank description/due date, and generates a local UUID and ISO timestamps. It adds sourceId in the form jsonplaceholder:todo:1. No remote user data is copied.')
p('The reducer checks sourceId as well as local ID atomically, so rapid events cannot create duplicates. Existing records without sourceId remain valid. Local editing preserves source metadata; deletion permits reimport. The explorer disables already-imported actions and local cards display Imported local copy. Imports never mutate the remote API.')
p('Feedback states that a local copy was added and saving is attempted. Existing storage errors remain visible; an unavailable storage device is labeled session only. A quota-like failure test verifies that no durable-save claim is made. Refresh/remount tests verify successful persistence.')
h('Accessibility and responsive behavior')
p('Existing Button, Input, Select, Card, Badge and Alert are reused. Native labeled controls, semantic headings, skip navigation, route focus/title updates and visible focus indicators remain. Status/source labels use text rather than color alone. A few polite live regions describe requests, imports, result counts and page changes; skeletons are aria-hidden and static.')
p('After importing disables its trigger, focus moves to View local tasks. Pagination focuses the results heading; filters keep their own focus. Mobile controls and cards stack, while wider screens use two-column cards and multi-column filters. Existing reduced-motion behavior is preserved. No full WCAG or screen-reader certification is claimed.')

page('Live Remote Task Explorer')
p('The genuine desktop capture shows actual JSONPlaceholder records, remote ownership labels, completion badges and local-copy import actions. The running application fetched 200 todos and ten users. Remote tasks remain distinct from the user-owned collection.')
picture('explorer-desktop-1440.jpg',6.6,'Live 1440 pixel Remote Task Explorer with JSONPlaceholder records and labeled filters')
caption('Figure 1  Live remote records in the existing TaskFlow shell at 1440 pixels')
p('Desktop checks exercised combined title search, completion and user filters, the no-results state, page two of 25, pending-task import, dashboard updates and persistence after an actual reload. Tablet checks at 768 pixels verified completion filtering and wrapping layout. Horizontal document width matched viewport width at all three tested widths.')

page('Controlled error and retry verification')
p('This is an actual browser screenshot under an intentional test condition, not evidence of a JSONPlaceholder outage. A temporary entry wrapper rejected only the initial two calls; the visible banner identifies the simulation. Retry then fetched actual remote data. The wrapper is saved as evidence text and removed from final application source.')
picture('error-controlled-failure.jpg',6.6,'Explicitly labeled controlled initial network failure with connection message and retry button')
caption('Figure 2  Controlled network failure with a working Retry request action')
p('A separate temporary eight-second delay before real requests exposed initial skeletons and refreshing with retained live records. The delay was removed before final validation. No hardcoded successful API responses are used in these browser checks. HTTP, malformed data, timeout and late-response conditions are covered with mocked automated tests.')

page('Mobile import and browser verification')
p('At 390 pixels, a completed remote task was imported through keyboard Enter. Its local copy retained completion and updated the dashboard to one completed task out of three existing records. The preview also includes the earlier local task and a pending remote import; none of this demonstration data is bundled as defaults.')
picture('mobile-390-viewport.jpg',2.4,'390 pixel responsive explorer with a matching completed remote task and stacked controls')
caption('Figure 3  Mobile remote task search with responsive controls')
p('Actual browser conditions were Codex in-app browser on macOS at 1440 by 1000, 768 by 1000 and 390 by 1000. Full-page screenshots can be taller than the viewport. Existing Dashboard, Tasks, Components and Settings routes rendered. Browser error output was checked after normal operation. These are representative checks, not a cross-browser or assistive-technology audit.')

page('Automated testing and dependency review')
table(['Executed command', 'Observed result'], [
['npm ci', 'Exit 0; final lockfile installed successfully'],
['npm test -- --watch=false', '66 passed, 0 failed across four suites'],
['npm run lint', 'Exit 0, no warnings'],
['npm run format:check', 'Exit 0'],
['npm run build', 'Exit 0, three Webpack performance warnings'],
['npm start', 'Application and /explore served at localhost:3000'],
['npm audit fix', 'Compatible instrumentation patch; advisories remain'],
['npm audit --json', '26 affected package entries: 21 moderate, five high'],
['npm audit --omit=dev --json', 'Exit 0, zero production dependency advisories'],
], [2.45,4.25])
p('Twenty-two new tests cover service success, HTTP/network/JSON/schema failures, validation bounds and user joins, loading, stable refresh, retry, retained snapshots, timeout, unmount cancellation and stale-generation safety. Integrated tests cover search, filters, pagination/reset, empty state, imports, duplicate events, status/source preservation, dashboard changes, remount persistence and quota-like storage failure. All 44 prior tests pass, including local CRUD and the Week 2 component suite.')
h('Security review and mitigation')
p('The compatible fix updated babel-plugin-istanbul from 8.0.0 to 8.0.2. Full audit counts remained 26 before and after; these are affected package entries, not 26 distinct underlying flaws. Production-only audit reports zero. No force fix was used.')
p('High findings propagate through braces, micromatch, chokidar, http-proxy-middleware and webpack-dev-server. Moderate chains include sprintf-js through argparse/js-yaml and Jest instrumentation, plus uuid through SockJS. Suggested resolutions cross major versions, including webpack-dev-server 6.1.0 and a Jest/Babel-Jest 25 downgrade. Latest registry sprintf-js 1.1.3 is still within the reported affected range, so a blind override is not a fix.')
p('The server remains bound to 127.0.0.1. Development tools should not be deployed publicly or run on untrusted inputs. Follow-up should review upstream patches or separately migrate affected tooling, then retest HMR, build and the full suite. Static production hosting should exclude development dependencies. A zero production audit is not a security guarantee.')

page('Challenges planned work and conclusion')
h('Challenges and solutions')
p('Joining two endpoint snapshots required coherent validation before rendering. Cancellation needed both AbortController and an active-generation guard. Duplicate imports required a reducer-level check, and saving feedback needed to distinguish an in-memory copy from durable storage. Fast requests required transparent controlled conditions for transient-state screenshots. All temporary browser test code was removed before final verification.')
h('Planned work breakdown')
table(['Work item', 'Hours'], [
['Review existing code and API contracts',3], ['API service, validation and cancellation',6],
['Custom hook and asynchronous states',5], ['Explorer, filters and pagination',6],
['Local imports and persistence integration',4], ['Tests, browser checks and dependency review',6],
['Documentation, report and evidence',5], ['Total planned hours',35],
], [5.9,0.8])
p('This is a planned allocation rather than measured attendance. It provides a reviewable 35 hour internship work breakdown.')
h('Conclusion and future improvements')
p('Week 4 connects a real public API to the existing TaskFlow application while preserving local ownership and earlier functionality. The delivered service boundaries, lifecycle hook, validation and reducer import guard support predictable behavior under failures and repeated interactions. Documentation and genuine evidence accompany a passing regression suite.')
p('Remaining limits include third-party availability and CORS dependence, full small-collection fetching, no server pagination, no remote cache across routes, no remote writes, no backend/authentication and no multi-tab synchronization. Local storage can fail. Three bundle-size warnings and development dependency advisories remain. Weeks 5 and 6 can address performance and dependencies, broaden accessibility/browser verification and prepare final delivery.')
p('The Markdown companion contains full implemented source excerpts, module responsibilities, verification details and evidence conditions. Weeks 1 to 3 reports and commits remain unchanged; the Week 4 branch is published without force-pushing or merging main.')

for element in [doc.element, doc.styles.element]:
    for border in element.xpath('.//w:pBdr'):
        border.getparent().remove(border)
doc.save(OUT)
print(OUT)
