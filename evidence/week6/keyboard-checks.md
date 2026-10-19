# Actual Week 6 keyboard checks

Production preview at localhost:4173; Chrome extension and native Chrome controls.

| Check | Actual outcome |
| --- | --- |
| Main navigation and lazy route | Enter Tasks; main focused; Tab reached New task; Enter opened dialog |
| Focus trap | Shift+Tab from Close wrapped to Cancel; Tab returned to Close |
| Invalid form | Enter Save on blank task produced associated error and focused title |
| Creation | Keyboard typing title and description; Enter Save created QA task |
| Editing | Enter Edit; append updated with keyboard; Enter Save updated title |
| Complete/reopen | Space Complete then Enter Reopen changed status and actions |
| Search/clear | Typed keyboard query; Space Clear filters restored unfiltered state |
| Native status menu | Arrow-key selection did not produce a changed selected value through the automation; manual native arrow selection remains unverified. Automated selection/filter tests pass. |
| Delete confirmation | Enter Delete; Keep task focused; Tab then Return deleted only the QA task; New task regained focus |
| Showcase | Enter Open dialog; Escape closed it and restored Open dialog focus |
| Explorer | Enter Explore; live 200 records loaded; typed qui; Space Clear filters; Enter Next page; heading focused and page 2 shown |
| Mobile dialog | At 320 by 700, bounds left/top 12 and right/bottom 308/688; content scrolls internally |
| Sidebar focus | Tab from Overview reached Tasks; actual outline rgb(211,238,146), 3px |
| Browser zoom | Native Chrome AX confirmed 200 percent; five routes fit 735 CSS pixel effective width; restored 100 percent |

A long description typing call timed out after entering 76 characters; the retained valid text was used and the workflow continued. This is a tool timing limitation, not an application failure. No user tasks were deleted; the newly created Week 6 QA task was removed after checks. No screen-reader audit is claimed.
