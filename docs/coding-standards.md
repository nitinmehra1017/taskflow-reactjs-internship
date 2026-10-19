# Coding standards

## Names and organization

Use PascalCase for React component names and filenames (`TaskCard.jsx`), camelCase for variables/functions (`formatDueDate`), `use` prefixes for hooks (`useRouteFocus.js`), and UPPER_SNAKE_CASE for genuine module constants. Use lowercase hyphenated CSS classes and documentation filenames. JSX belongs in `.jsx`; non-JSX utilities and hooks belong in `.js`. Use `.cjs` for CommonJS build configuration and `.mjs` for ESLint's ES module flat configuration.

Keep one primary exported component per file. Place page-specific composition in `pages/`, shell structure in `layouts/`, and shared presentation in `components/`. Extract code when it has a clear responsibility or demonstrated reuse. Keep files focused; avoid speculative abstractions and unused code. Group imports as package imports, application imports, then styles/assets; use consistent relative paths.

## React and JavaScript

Use functional components and the automatic JSX runtime. Treat state as immutable. Use stable IDs as keys for changing collections; do not use array positions as IDs. Derive data during render where possible. Keep side effects in effects with correct dependencies. Do not call hooks conditionally. Avoid direct DOM mutation except explicit accessibility focus management. Use strict equality, `const` by default, meaningful booleans, and early returns where they improve clarity.

Document reusable component contracts with JSDoc and keep architecture.md current. Comments explain decisions or constraints. Avoid comments that merely repeat the code. No production console logging, dead links, fake controls, or fabricated activity data. Name fixtures and previews explicitly.

## Formatting and review

Prettier enforces two-space indentation, semicolons, single quotes in JavaScript, trailing commas, LF endings, and a 90-column print width. ESLint enforces recommended JavaScript, React X, and React Hooks rules. Formatting rules are disabled in ESLint via eslint-config-prettier to avoid conflicts. `npm run lint` fails on warnings. Review every diff before committing and include package-lock.json whenever dependency inputs change.

## Accessibility principles

Use landmarks and logical heading order. Give every future field a persistent label and connect errors with `aria-describedby`. Use buttons for actions and links for navigation. Maintain visible focus and full keyboard access; never rely on color alone. Hide decorative icons, provide meaningful alt text for informative images, and use appropriate accessible names. Keep click targets comfortable on touch screens. Preserve readable text at 200% zoom, test narrow layouts without horizontal overflow, and honor reduced-motion preferences.

Route changes update titles and focus main. Future dialogs must trap focus, close with Escape when appropriate, and restore focus to the trigger. Future asynchronous updates should announce meaningful results without overwhelming screen readers. Manual review and automated checks complement each other; lint alone does not establish WCAG conformance.

## Security and data

Never place credentials in frontend files or commit `.env` files. Treat browser storage as untrusted input. Avoid dangerouslySetInnerHTML; React's normal string rendering escapes content. Validate parsed storage and handle quota/unavailable-storage failures. Public deployment and source-map exposure will be reviewed in Week 6.
