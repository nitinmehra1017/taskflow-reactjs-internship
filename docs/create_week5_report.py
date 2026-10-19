"""Rebuild the Week 5 report using python-docx from the bundled document runtime."""

from pathlib import Path

from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "ReactJS_Internship_Week5_Testing_and_Code_Quality.docx"
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
header.text = "TaskFlow    /    YuvaIntern ReactJS Internship    /    Week 5"
header.runs[0].font.size = Pt(8)
header.runs[0].font.color.rgb = RGBColor(0, 0, 0)
footer = section.footer.paragraphs[0]
footer.alignment = WD_ALIGN_PARAGRAPH.RIGHT
footer.add_run("Testing and code quality    |    ").font.size = Pt(8)
field = OxmlElement("w:fldSimple")
field.set(qn("w:instr"), "PAGE")
footer._p.append(field)

doc.core_properties.title = "TaskFlow ReactJS Internship Week 5 Testing and Code Quality"
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


EVIDENCE = ROOT / 'evidence/week5'
def picture(filename, width, description):
    par = p('')
    par.alignment = WD_ALIGN_PARAGRAPH.CENTER
    shape = par.add_run().add_picture(str(EVIDENCE / filename), width=Inches(width))
    shape._inline.docPr.set('descr', description)
def caption(text):
    par=p(text)
    for run in par.runs:
        run.font.size=Pt(9)
        run.font.italic=True

p('YuvaIntern Junior ReactJS Developer Internship', 'Subtitle')
p('').paragraph_format.space_after=Pt(32)
p('TaskFlow Week 5 Testing and Code Quality', 'Title')
p('Implementation and verification report', 'Subtitle')
p('Week 5 of the six week ReactJS internship')
p('Prepared 19 October 2026')
h('Outcome')
p('TaskFlow now has 111 passing automated tests across 10 suites, with zero failures in the final run. Coverage exceeds every enforced 80 percent threshold. Two reproduced keyboard focus defects were fixed and protected by three regression assertions. A real GitHub Actions run passed installation, lint, formatting, coverage tests and production build.')
p('This report presents the testing approach, actual results, debugging evidence, browser checks and remaining limitations for internship review. Earlier application functionality and Week 1 to Week 4 reports are preserved.')
p('Repository: github.com/nitinmehra1017/taskflow-reactjs-internship')
p('Submission branch: week-5-testing-qa')
p('Full dependency audit: 26 development advisory entries. Production-only audit: zero. Three production build performance warnings remain. Independent browser engine and assistive-technology audits remain outstanding.')

page('Project introduction and objectives')
p('TaskFlow is a React task management dashboard built with JavaScript, JSX, React Router, custom Webpack 5 and Babel. Week 1 established architecture and tooling; Week 2 added seven reusable UI components; Week 3 introduced Context, reducers, hooks, CRUD, filters, persistence and dashboard statistics. Week 4 added the Remote Task Explorer and validated remote-to-local imports.')
p('Week 4 was inspected and verified before branching. The Week 5 branch starts from commit 549332fc20664d0250bb774ac461910e4ca08059. Its 66 passing tests formed the baseline. Week 5 adds 45 tests and targeted quality changes without adding Week 6 features or merging into main.')
h('Testing objectives')
bullet('Protect component behavior, task state, storage recovery and remote request handling.')
bullet('Exercise complete user workflows through the real application and providers.')
bullet('Reproduce actual defects before fixing them and retain regression evidence.')
bullet('Measure all application JavaScript and JSX against four 80 percent thresholds.')
bullet('Automate quality checks in GitHub Actions and document limits accurately.')
h('Scope and environment')
p('Validation used Node 24.22.0 and npm 11.19.1. The committed lockfile supports repeatable npm ci installation. Jest runs serially in jsdom, Babel transforms JSX, and the development server serves localhost:3000. Existing linting, formatting and Webpack configuration remain in use.')
h('Testing pyramid')
p('The base consists of pure validation, reducer, storage and service tests. Rendered components and hook/provider tests verify interactions in the middle. Routed workflows verify task creation, lifecycle, persistence, filters and imports above them. A smaller manual browser layer checks layout, focus and live remote recovery. jsdom does not substitute for browser engine or assistive-technology testing.')

page('Testing tools and unit methodology')
table(['Tool','Responsibility'],[
('Jest','Runner, mocks, assertions, isolated jsdom execution and coverage'),
('React Testing Library','Render real UI and query observable accessible behavior'),
('user-event and jest-dom','Keyboard and form interactions; readable DOM assertions'),
('jest-axe 11','Automated accessibility checks in rendered fixtures'),
('ESLint and Prettier','Static quality and consistent formatting')],[1.9,4.7])
h('Reusable components')
p('All seven primitives are exercised. Button tests cover variants, sizes, click, disabled, loading and keyboard behavior. Input tests verify labels, controlled values, helper/error associations and required state. Modal tests exercise Escape, focus trapping, restoration, Tab navigation and background restrictions. Card tests cover children, actions and footer. Badge tests cover semantic output, variants and sizes. Select tests cover options, selection, disabled state, validation and keyboard/form interaction. Alert tests cover variants, dismissal and announcement urgency.')
h('State and hook testing')
p('Tests cover immutable reducer updates, unknown IDs, unique task identifiers, timestamps, field validation, calendar dates, statistics and combined filters. useTasks, useLocalStorage and useTaskFilters are tested through observable values and interactions. Storage tests cover malformed envelopes, duplicate IDs, migration, restricted reads, failed writes and retry recovery.')
h('Isolation and predictable fixtures')
p('Global setup clears localStorage, rejects unexpected fetches and restores mocks and real timers. Fixture helpers provide stable ISO timestamps, remote data, JSON responses and deferred promises. renderApp wraps the real application in MemoryRouter and returns a user-event instance. Tests do not depend on public API availability.')
code("clearMocks: true,\nrestoreMocks: true,\ncollectCoverageFrom: ['src/**/*.{js,jsx}'],\ncoverageThreshold: {\n  global: { statements: 80, branches: 80, functions: 80, lines: 80 }\n}")

page('Integration API tests and execution matrix')
table(['Workflow','Executed behavior'],[
('A and C','Create task; verify dashboard; unmount and remount; verify persistence'),
('B','Create, edit, complete, reopen and confirmed deletion through real UI'),
('D','Create multiple tasks; combine title, status and priority; clear filters'),
('E','Render remote fixtures; filter; import; visit local tasks; remount; reject duplicate')],[1.1,5.5])
p('Workflow B is retained in tasks.test.jsx. The other named workflows are in workflows.test.jsx. Only fetch is mocked for remote workflows; application hooks, providers, validation and UI remain real.')
h('API testing')
p('Service and hook tests cover successful data decoding, loading, HTTP errors, network errors, malformed responses, retry, refresh, abort cancellation and stale response protection. Deferred promises deliberately resolve requests out of order. Explorer tests cover search, filters, pagination, imports and duplicate protection. Browser recovery additionally used a labelled temporary failure harness; after retry it fetched 200 real records. The harness was removed before final source validation.')
h('Representative executed cases')
table(['Case','Expected and actual result','Status'],[
('UI components','Named controls respond correctly; focus trap and restoration hold','Pass'),
('Invalid state/storage','Invalid inputs rejected; recoverable storage feedback shown','Pass'),
('Remote races','Cancelled or stale responses cannot overwrite current state','Pass'),
('QA 001 complete/edit','Removed trigger falls back to My tasks heading','Pass'),
('QA 002 retry','Request status retains focus after error panel disappears','Pass'),
('Responsive routes','15 correct headings; no measured horizontal overflow','Pass')],[1.35,4.5,.75],8.5)
p('The full 111-row execution matrix is docs/Week5_Test_Cases.md. Each row identifies its actual executed assertion, suite, preconditions, reproduction command, expected behavior and result. Both successful and negative scenarios are included. evidence/week5/jest-results.json is the machine-readable execution source.')

page('Coverage results and validation evidence')
p('The final suite passed 111 tests across 10 suites with zero failures. All executable src JavaScript and JSX files are collected, including bootstrap and barrel modules. No application source exclusions were added to inflate results. Styles, assets and tests are outside the application JavaScript glob.')
table(['Metric','Covered','Total','Actual','Threshold'],[
('Statements','486','497','97.78%','80%'),
('Branches','411','427','96.25%','80%'),
('Functions','185','188','98.40%','80%'),
('Lines','434','440','98.63%','80%')],[1.5,1,1,1.15,1.2])
p('Baseline coverage was 95.02 percent statements, 93.82 percent branches, 95.10 percent functions and 96.72 percent lines. Defensive paths and some callback combinations remain uncovered; percentages are not proof that every possible behavior is correct.')
h('Actual command results')
table(['Command','Observed result'],[
('npm ci','Successful clean lockfile installation'),
('npm test -- --watch=false --coverage','111 passed; 0 failed; 10 suites; four thresholds passed'),
('npm run test:a11y','8 passed; 0 failed'),
('npm run lint','Passed with zero lint warnings'),
('npm run format:check','Passed after formatting documentation'),
('npm run build','Successful; three bundle/performance warnings'),
('npm audit','Nonzero advisory result: 21 moderate and 5 high'),
('npm audit --omit=dev','Zero production vulnerabilities')],[3.2,3.4],9)
p('Raw command output is retained in evidence/week5. Historical red regression output and the initial ambiguous-query failure are preserved separately. Coverage HTML can be regenerated locally in coverage/; JSON summary, full coverage data and LCOV are retained as evidence. Terminal output is provided as genuine text logs rather than fabricated terminal screenshots.')

page('Debugging and regression fixes')
h('QA 001 Filtered task actions lose focus')
p('Reproduce by completing a pending task while the pending filter is active, or editing a medium-priority task to high while the medium filter is active. Before the fix the active card disappeared and the document body gained focus. The expected destination is the surviving task results heading.')
p('Filtering unmounted the original action trigger. Modal restoration cannot focus a disconnected element. TasksPage now captures the action trigger and schedules a post-render connectivity check. If it disappeared, a ref focuses the My tasks heading with tabIndex minus one. Other triggers keep their usual restoration behavior.')
p('Two regression assertions failed against the original source and passed after the fix: completing a task hidden by the current filter, and editing a task out of the active filter. Actual desktop browser checks confirmed both destinations. The dedicated before and after logs retain the failure and recovery.')
h('QA 002 Remote retry loses focus')
p('Reproduce a network error in Explore and activate Retry with Enter. Before the fix the error panel and focused Retry button disappeared, leaving focus on the body. ExplorePage now schedules focus to its persistent request status paragraph after refresh. The status remains present during loading and success.')
p('The retry regression failed before and passed after the fix. A real Chrome check recovered from the explicitly controlled error to 200 live remote records with focus retained in request feedback.')
h('Other investigated areas')
p('Storage failures, task validation, reducer immutability, combined filters, API races and duplicate imports passed their executed checks; no additional bugs are claimed. One expanded-suite failure was an ambiguous test query matching two valid status regions. Scoping it to Demo feedback corrected the test, not production code. The first failing log remains available.')
p('Full reproduction steps, root causes, fixes, exact test names and verification are in docs/Week5_Debugging_Log.md.')

page('Accessibility browser checks and limitations')
p('Eight automated jest-axe tests passed. They cover Dashboard, Tasks, Components, Settings, the missing route, populated remote results, dialog validation and the seven primitives. No axe rules were disabled. jsdom cannot provide a full contrast or layout audit, and automated checks do not replace screen-reader testing.')
p('Manual keyboard checks exercised Enter opening, Escape closing, Tab and Shift Tab wrapping, validation focus, trigger restoration, filtered completion/edit fallback and retry feedback. Focus styles and reduced-motion CSS were inspected. Reduced-motion emulation, a complete contrast review and assistive-technology checks remain outstanding.')
p('Chrome checked all five application routes at 1440, 768 and 390 pixels. Every recorded heading matched its route and all 15 document widths matched the viewport. Additional in-app browser checks covered desktop task workflows and tablet layouts. Two browser surfaces were used; independent rendering engines were not established. Native Safari access timed out, so no Safari or Firefox result is claimed.')
picture('chrome-mobile-dialog.jpg',2.05,'Actual Chrome mobile task dialog at 390 pixel viewport')
caption('Actual mobile dialog capture. Enter opened the dialog; Escape closed it and restored the New task trigger.')

page('Genuine browser evidence')
picture('desktop-dashboard.jpg',5.7,'Actual running TaskFlow dashboard in the in-app browser')
caption('Running desktop dashboard after QA task cleanup. Existing local tasks remain intact.')
picture('retry-focus-fix.jpg',5.7,'Remote explorer after successful live retry with request feedback focused')
caption('Actual Chrome recovery after a labelled temporary failure. The retry loaded 200 live records and retained keyboard focus in request feedback.')
p('Other genuine captures include invalid submission, filtered completion/edit focus, tablet Tasks and Settings at all three widths. screenshot-manifest.json records filenames, byte counts and SHA256 hashes. Screenshots demonstrate their captured state; automated and DOM measurements provide the broader execution evidence.')

page('Continuous integration and dependency review')
p('GitHub Actions runs for pushes and pull requests on main, week branches and codex branches, plus manual dispatch. The workflow uses read-only repository permissions, Node 24, npm lockfile caching and a 15 minute timeout. Coverage is uploaded even if a later step fails. No secrets or deployment steps are introduced.')
code("- uses: actions/checkout@v6\n- uses: actions/setup-node@v6\n  with:\n    node-version: '24'\n    cache: npm\n- run: npm ci\n- run: npm run lint\n- run: npm run format:check\n- run: npm run test:ci\n- run: npm run build")
p('A real successful run executed source commit cac61a271297b08b0c87d00c5a3e98d8be5aa946. Run ID 39291464514 and the raw run/job REST responses are retained in evidence/week5. URL: github.com/nitinmehra1017/taskflow-reactjs-internship/actions/runs/39291464514. The final documentation push can be checked on the same branch Actions page.')
h('Dependency advisory investigation')
p('The full audit reports 26 affected development package entries: 21 moderate and 5 high, with zero critical. Production-only audit reports zero vulnerabilities. npm audit fix was attempted without force and found no compatible fix that cleared these remaining findings. Breaking Webpack development server changes and an incompatible Jest downgrade were not applied.')
p('Findings include development server transitive chains and Jest instrumentation dependencies. Keep the development server local; review upstream compatibility before migrating tools. The findings remain actionable maintenance work, even though no production dependency vulnerabilities were reported. Three Webpack bundle/performance warnings also remain for Week 6 optimization.')

page('Planned work breakdown challenges and conclusion')
p('This allocation totals 35 planned hours. It is a work breakdown for the internship and is not a measured attendance record.')
table(['Activity','Planned hours'],[
('Verify Week 4 and prepare branch','2'),
('Test infrastructure and reusable helpers','3'),
('Component unit and accessibility tests','6'),
('State hooks and storage tests','5'),
('API and routed integration workflows','6'),
('Reproduce bugs and implement regression fixes','4'),
('Browser responsive and keyboard checks','3'),
('CI dependency audit and final validation','3'),
('Documentation evidence and Word report','3'),
('Total','35')],[5.4,1.2])
h('Challenges and resolutions')
p('Focus restoration had to account for React removing filtered cards after dispatch. Post-render connectivity checks preserve a logical destination. Deferred mock requests made race tests repeatable. An ambiguous test query was narrowed to its intended region. Browser access enabled useful checks but did not prove independent engines; the limitation is explicitly recorded.')
h('Conclusion and Week 6 handoff')
p('The completed Week 5 suite protects existing behavior with 111 passing tests, source-wide coverage, three regression assertions and CI automation. Reports and evidence distinguish executed checks from outstanding work. Week 6 should prioritize independent browser engines, assistive-technology and contrast review, bundle optimization, compatible dependency migration and deployment preparation.')
p('Start locally with npm ci followed by npm start, then open localhost:3000. Repeat quality checks using the commands on page 5. Submit this Word report with the branch URL and the 240 word submission description in submission-week5-description.txt.')
for element in list(doc.element.iter(qn('w:pBdr'))):
    element.getparent().remove(element)
for style in doc.styles:
    for element in list(style.element.iter(qn('w:pBdr'))):
        element.getparent().remove(element)
doc.save(OUT)
print(OUT)
