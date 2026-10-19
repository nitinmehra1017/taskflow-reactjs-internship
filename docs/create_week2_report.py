"""Rebuild the Week 2 report using python-docx from the bundled document runtime."""

from pathlib import Path

from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "ReactJS_Internship_Week2_Component_Library.docx"
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
header.text = "TaskFlow    /    YuvaIntern ReactJS Internship    /    Week 2"
header.runs[0].font.size = Pt(8)
header.runs[0].font.color.rgb = RGBColor(0, 0, 0)
footer = section.footer.paragraphs[0]
footer.alignment = WD_ALIGN_PARAGRAPH.RIGHT
footer.add_run("Reusable UI component library    |    ").font.size = Pt(8)
field = OxmlElement("w:fldSimple")
field.set(qn("w:instr"), "PAGE")
footer._p.append(field)

doc.core_properties.title = "TaskFlow ReactJS Internship Week 2 Component Library"
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



import json
from PIL import Image
EVIDENCE = ROOT / 'evidence' / 'week2'
results = json.loads((EVIDENCE / 'jest-results.json').read_text())
passed = results['numPassedTests']
failed = results['numFailedTests']


def picture(filename, width, description):
    paragraph = doc.add_paragraph()
    shape = paragraph.add_run().add_picture(str(EVIDENCE / filename), width=Inches(width))
    shape._inline.docPr.set('descr', description)
    return paragraph


def caption(text):
    paragraph = p(text)
    paragraph.paragraph_format.space_after = Pt(12)
    for run in paragraph.runs:
        run.font.size = Pt(9)
        run.font.italic = True


p('YuvaIntern Junior ReactJS Developer Internship', 'Subtitle')
p('').paragraph_format.space_after = Pt(28)
p('TaskFlow ReactJS Internship Week 2 Component Library', 'Title')
p('Reusable responsive and accessible interface components', 'Subtitle')
p('Week 2 of a six week internship')
p('Prepared on 19 October 2026')
p('').paragraph_format.space_after = Pt(20)
h('Introduction')
p('Week 2 extends the existing TaskFlow project with seven reusable React components, an interactive component library route, shared Sass design tokens, and a tested foundation for later task-management features. The established green, lime, off-white and neutral design remains in place, and Week 1 reports and evidence are preserved.')
p(f'The delivered library contains Button, Input, Modal, Card, Badge, Select and Alert. A clean npm install, lint, formatting and production-build checks succeeded. Two Jest suites passed {passed} tests with {failed} failures. Browser checks exercised interactive examples and responsive layouts; genuine screenshots accompany this report.')
h('Scope and review materials')
bullet('Review /components for live variants, field validation, dialog behavior, native selection, cards and feedback.')
bullet('Review docs/Week2_Component_Library.md for every prop, default, example, accessibility decision and limitation.')
bullet('Review evidence/week2 for actual logs, test results, viewport observations, screenshots and initial failures.')
p('The 35 hour allocation in this report is a planned work breakdown, not verified attendance. Task CRUD, persistence and filters remain future feature work.')

page('Objectives technology and architecture')
h('Week 2 objectives')
p('Create a reusable library that pages can compose without duplicating validation display, action states, modal lifecycle or visual tokens. Keep components independent of routing and task state. Expose controlled props and callbacks, provide native keyboard behavior where available, and make the showcase functional across desktop, tablet and mobile layouts.')
table(['Technology','Installed version','Week 2 role'],[
['React and React DOM','19.3.1','Functional components and browser rendering'],
['React Router DOM','7.18.4','New /components route in the existing shell'],
['Webpack','5.112.0','Retain CSS and add SCSS compilation'],
['Sass and sass-loader','1.105.2 / 17.0.1','Tokens, mixins and component styles'],
['Jest and babel-jest','30.5.2','Behavior tests with Babel JSX transforms'],
['Jest jsdom environment','30.5.2','DOM testing outside a native browser'],
['Testing Library','See environment.log','React rendering, role queries and user-event'],
['ESLint and Prettier','10.13.0 / 3.9.10','Code quality and shared formatting'],
['Node.js and npm','24.22.0 / 11.19.1','Executed runtime and package manager'],
],[1.9,1.5,3.3],9)
h('Component organization')
code('''src/components/ui/
  Button/       Button.jsx and Button.scss
  Input/        Input.jsx and Input.scss
  Modal/        Modal.jsx and Modal.scss
  Card/         Card.jsx and Card.scss
  Badge/        Badge.jsx and Badge.scss
  Select/       Select.jsx and Select.scss
  Alert/        Alert.jsx and Alert.scss
  index.js      Central exports
src/styles/_tokens.scss
src/pages/ComponentsPage.jsx and ComponentsPage.scss
tests/ui.test.jsx and tests/showcase.test.jsx''', 9)
p('AppLayout remains the shared parent. ComponentsPage owns demo state and composes the seven exported primitives. Existing PageHeading, StatCard and navigation components retain their distinct purposes. No new application or external UI framework was introduced.')

page('Implementation details and component contracts')
table(['Component','Key props','Delivered behavior'],[
['Button','variant, size, disabled, loading, loadingText, type, children','Four variants; three sizes; disabled/pending state; native button keyboard activation'],
['Input','label, id, helperText, error, required, native input props','Controlled/uncontrolled native input; connected descriptions; unique IDs and visible validation'],
['Modal','open, onClose, title, description, footer, size, initialFocusRef','Portal dialog; focus containment/restoration; Escape; scroll lock and inert background'],
['Card','title, description, actions, children, footer','Optional framing around flexible content; wrapping header/actions and mobile spacing'],
['Badge','variant, size, children','Five contextual variants; two sizes; textual non-live status labels'],
['Select','label, options, placeholder, error, required, native select props','Native single selection, disabled choices/controls and connected field guidance'],
['Alert','variant, title, children, announce, onDismiss, dismissLabel','Four variants; optional named dismissal; quiet static feedback and explicit announcements'],
],[1.0,2.4,3.3],9.2)
h('Defaults and parent responsibilities')
p('Button defaults to primary, medium, type button, with disabled and loading false. Input and Select generate IDs and default required to false. Modal is closed by default, medium width, and does not close on backdrop clicks unless requested. Card renders only supplied regions. Badge defaults to neutral and medium. Alert defaults to information, no dismissal and no live announcement.')
p('Parent code owns values, validation rules, asynchronous work, visibility and persistence. Input and Select show the supplied error; they do not decide business validity. Modal calls onClose, and the parent updates open. Alert calls onDismiss, and the parent removes the message and manages focus if needed.')
h('Examples and future reuse')
code('''import { Button, Card, Badge } from './components/ui';
<Card title="Today’s focus" actions={<Badge variant="success">Ready</Badge>}>
  <p>A small, useful step.</p>
  <Button variant="primary" onClick={handleAction}>Continue</Button>
</Card>''',8.8)
p('Weeks 3 to 6 can build task forms with Input, Select and Button; lists with Card and Badge; focused edit/confirmation flows with Modal; and feedback with Alert. The detailed Markdown reference contains full prop tables, examples, responsive behavior and edge cases for every component.')

page('Styling accessibility and build configuration')
h('SCSS integration and tokens')
p('Each component owns a namespaced ui stylesheet. _tokens.scss defines colors, typography, spacing, radii, shadows and focus indicators. Sass @use shares these values. The original plain CSS rule remains intact; production still extracts CSS while development injects styles.')
code(r'''// Added alongside the existing .css rule in webpack.config.cjs
{
  test: /\.scss$/i,
  use: [
    isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
    'css-loader',
    'sass-loader',
  ],
},
// Component styles consume tokens without a UI framework:
@use '../../../styles/tokens' as t;
.ui-button {
  @include t.focus-ring;
  min-height: 44px;
  background: t.$forest;
}''',8.8)
h('Accessibility implementation')
p('Native buttons, inputs and selects preserve platform keyboard behavior and disabled states. Labels remain visible; helper and error IDs are merged into aria-describedby, and errors set aria-invalid. Static badges and alerts do not create excessive live announcements. Alert announce=true opts into polite status feedback or assertive error feedback. Focus indicators remain visible, and reduced-motion styles stop button transitions and spinner animation.')
h('Modal lifecycle')
p('Opening saves the trigger, prior body overflow and sibling inert state. The portal mounts outside the application root; background siblings become inert and scrolling locks. Initial focus goes to the close button or a supplied focus ref. Tab and Shift+Tab wrap inside visible enabled controls; negative tab indices, hidden ancestors and disabled fieldsets are excluded. A focusin guard redirects escaped focus. Escape requests closing. Cleanup restores prior state and a connected opener.')
p('One active modal is supported. Nested dialogs, iframe/shadow-root widgets and newly inserted body siblings require additional focus/inert coordination. No full WCAG compliance, screen-reader or older-browser assurance is claimed.')

page('Component showcase on desktop')
p('The /components route uses the existing application shell, a section index, live feedback and paired example surfaces. It preserves the established TaskFlow palette and typography. The figures in this report are genuine captures of the running application, not mockups.')
picture('showcase-desktop-viewport.jpg',6.4,'TaskFlow component library at a 1440 by 1000 desktop viewport')
caption('Desktop viewport 1440 by 1000 CSS pixels in the ChatGPT in-app browser on macOS. The complete page capture is available separately in evidence/week2/showcase-desktop.jpg.')
h('Responsive composition')
p('The component grid has two columns above 1100px and one below. Alerts stack below 580px; cards reduce padding below 480px. Controls wrap rather than force the page wider. The navigation becomes a two-by-two grid on mobile. Layout measurements showed page width equal to viewport width at 1440, 768 and 390 pixels.')

page('Button states and field validation')
picture('input-validation.jpg',6.4,'Desktop button variants and a workspace name input showing its validation error')
caption('Actual 1440 by 1000 capture after submitting an empty workspace name. The input exposes aria-invalid, a connected error message and focused validation feedback. Button variants, sizes and disabled/loading examples share the same components.')
h('Interactive behavior')
p('Primary activation with Enter displayed feedback. The loading demonstration disabled its button and later re-enabled it. Invalid workspace-name submission focused the field; a valid name removed the error and displayed confirmation. The modal form also validates its input, focuses the invalid field, and confirms a valid label without persisting data.')
p('The examples do not create tasks or change account/workspace settings. Their state resets when the page unmounts. Existing dashboard metrics describe project structure, not fabricated user activity.')

page('Dialog screenshot and mobile behavior')
par = picture('modal-open-mobile.jpg',2.1,'Open TaskFlow modal at 390 by 844')
par.alignment = WD_ALIGN_PARAGRAPH.CENTER
caption('Actual mobile dialog capture at 390 by 844 CSS pixels. The desktop dialog capture at 1440 by 1000 is supplied in evidence/week2/modal-open-desktop.jpg. The image retains its original proportions.')
h('Observed keyboard and lifecycle behavior')
p('The browser verified initial close-button focus, reverse wrapping from the first control to the final action, forward wrapping to the close button, Escape closure and opener focus restoration. The mobile dialog fit the viewport. A DOM observation confirmed background inert markup and hidden body overflow while open.')
p('Jest tests additionally cover programmatic focus containment, optional initial focus, safe default backdrop behavior, opt-in backdrop closing, and cleanup restoring previously existing scroll/inert values. Dynamic focus boundaries are recomputed on Tab, so disabled and hidden controls are not treated as valid endpoints.')

page('Cards badges selects and feedback')
picture('cards-and-badges.jpg',6.35,'Card compositions and textual badge variants beside a native select example')
caption('Actual 1280 by 720 browser capture. Card titles, actions, bodies and footers are optional; badges preserve written meaning alongside color.')
picture('selects-and-alerts.jpg',6.35,'Selected native priority and contextual alert examples')
caption('Actual 1280 by 720 capture. Native selection updated the preview, disabled controls remained disabled, and success feedback could be dismissed and restored with appropriate focus movement.')

page('Testing evidence and observed outcomes')
p(f'Final automated results: {passed} tests passed, {failed} failed, across {results["numPassedTestSuites"]} suites. These are executed results from evidence/week2/jest-results.json. No snapshot tests were used. Tests query user-visible roles, labels and text and drive interactions through user-event.')
table(['Validation','Observed outcome'],[
['Clean npm installation','Exit 0; 890 packages installed from the lockfile'],
['ESLint','Exit 0; no warnings after portal initialization fix'],
['Prettier check','Exit 0; matched source and documentation use shared formatting'],
['Production build','Exit 0; three bundle size/performance warnings retained'],
['Development startup','Server announced port 3000 and compiled successfully'],
['Automated component and route tests',f'{passed} passed; {failed} failed; disabled/loading, fields, modal, feedback and routes covered'],
['Desktop tablet and mobile layouts','1440 by 1000, 768 by 1024 and 390 by 844; no measured horizontal overflow'],
['Browser regression checks','Overview, Tasks, Settings and unknown-route recovery rendered expected headings'],
['Final console query','No error entries in a fresh tab after same-origin WebSocket correction'],
],[2.25,4.45],9.3)
h('Failure history and fixes')
p('Initial lint reported two portal-state immutability errors. Portal attributes now initialize at element creation. A clean dependency reinstall interrupted an active development watcher; restarting after installation restored service. Browser access was initially unavailable and an interrupted session required reopening the preview. These interruptions are documented rather than counted as application passes.')
p('Console review exposed a localhost versus 127.0.0.1 WebSocket origin mismatch. The documented auto://0.0.0.0:0/ws client setting now derives the socket endpoint from the page origin while keeping host checks enabled. Initial errors remain in evidence; the final error query was empty.')
p('The native Terminal app was unavailable for capture. Command screenshots are clearly labeled browser views of verbatim logs, not Terminal screenshots. Initial installation also reported transitive package deprecations and native-script notices. No security audit was executed.')

page('Work breakdown challenges and conclusions')
p('This is a planned 35 hour allocation, not verified attendance or a statement about the elapsed automation session. The intern should keep a separate actual activity log if required by YuvaIntern.')
table(['Work area','Hours','Output'],[
['Review Week 1 and define contracts','3','Design audit and reusable component API plan'],
['Sass and token setup','4','SCSS loaders, tokens and isolated selectors'],
['Button Input and Select','6','Native controls and field states'],
['Modal focus and lifecycle','6','Dialog semantics, focus containment and cleanup'],
['Card Badge and Alert','4','Composable surfaces and contextual feedback'],
['Showcase and responsiveness','4','New route, examples and navigation integration'],
['Testing evidence and documentation','8','Executed checks, screenshots, reference and Word report'],
['Total planned allocation','35','Week 2 reusable UI component library'],
],[2.55,0.6,3.55],9.3)
h('Challenges and remaining acceptance work')
p('The main implementation challenges were keeping field semantics consistent, managing modal focus and cleanup, integrating Sass without changing Week 1 styles, and correcting the development WebSocket host mismatch. Native controls and shared tokens kept the solution small and understandable. Single-dialog and browser-environment assumptions are documented in the component reference.')
p('Full screen-reader, 200 percent zoom, cross-browser and real-device audits remain future work. Reduced-motion behavior is implemented in source but no operating-system preference audit was performed. The production bundle still has size warnings; code splitting and performance review remain later milestones.')
h('Conclusion and submission materials')
p('Week 2 delivers all seven components, a functional showcase, SCSS support, behavior tests and genuine evidence while preserving the existing project. Future task features can compose these primitives instead of recreating their state display and accessibility behavior. The explicit Week 2 library assignment updates the original schedule; task features remain planned for Week 3 onward.')
p('Repository: github.com/nitinmehra1017/taskflow-reactjs-internship. Branch: week-2-component-library. The implementation commit is 4a97139; documentation and evidence are finalized separately. Consult evidence/week2/git-status.txt for recorded publication status.')
p('Submit this Word file together with the 200 to 300 word text in submission-week2-description.txt. The complete API reference is docs/Week2_Component_Library.md. Technical source for the WebSocket setting: webpack.js.org/configuration/dev-server/#websocketurl.')

for element in [doc.element, doc.styles.element]:
    for border in element.xpath('.//w:pBdr'):
        border.getparent().remove(border)
doc.save(OUT)
print(f'Created {OUT}; test results {passed} passed and {failed} failed')
