# Public Design Systems as References for My PASKAM (mobile-first field ops PWA)

Scope note: research done 2026-10-05. Some official pages could not be fetched (Apple HIG returns a JS shell; SAP's new `sap.com/design-system/...` pages return HTTP 403 to fetchers; m3.material.io returns a JS shell, so M3 claims below come from search-result snippets of the m3 pages). Those limits are flagged in the Gaps sections. Claims marked "(snippet)" were checked against search-result text from the official URL, not against the full page.

## 1. Long forms on mobile (one-thing-per-page vs single page, grouping, validation timing, error summary, required/optional)

### Takeaway
GOV.UK has the strongest, research-backed form guidance: start with one question per page, mark only optional fields with "(optional)" (never asterisks), validate on submit, show an error summary at the top that links to each field, and add a "Check answers" review page before final submit. Carbon agrees on single-column layout and section headings but differs on validation timing (validate on blur) and lets complex enterprise forms mark "(required)" instead. For PASKAM's work report (hour meter, fuel, operator, photos), the practical blend is a single-column page split into sections or short steps, a review page, and an error summary on submit.

### Cited Findings
- GOV.UK question pages: "Start with one thing per page"; use the `<legend>`/`<label>` as the page heading so screen readers announce it once — [GOV.UK Question pages](https://design-system.service.gov.uk/patterns/question-pages/)
- GOV.UK: add "(optional)" to the labels of optional fields, or to the legend for radios/checkboxes; "Never mark mandatory fields with asterisks" — [GOV.UK Question pages](https://design-system.service.gov.uk/patterns/question-pages/)
- GOV.UK: always put a Back link at the top, because "some users do not trust browser back buttons when they're entering data". The previous page should open in its last-seen state, except after irreversible actions such as payments — [GOV.UK Question pages](https://design-system.service.gov.uk/patterns/question-pages/)
- GOV.UK: the button says "Continue", not "Next", and is left-aligned so users don't miss it — [GOV.UK Question pages](https://design-system.service.gov.uk/patterns/question-pages/)
- GOV.UK error summary: show it whenever there is a validation error, "even if there's only one". Place it at the top of the main content, below the back link and above the h1. JS moves focus to it on page load. Each error links to its field: the field ID for a single input, the first field with an error for a date, the first option for radios/checkboxes. Summary text must exactly match the inline error message — [GOV.UK Error summary](https://design-system.service.gov.uk/components/error-summary/)
- GOV.UK guidance points to validating on submission rather than on blur — [GOV.UK Error summary](https://design-system.service.gov.uk/components/error-summary/) (related pattern: [Recover from validation errors](https://design-system.service.gov.uk/patterns/validation/))
- GOV.UK "Check answers": a review page just before confirmation, for small and medium transactions. Long multi-section transactions can have one at the end of each section. Built from a summary list (key / value / "Change" link with visually hidden context such as "Change name"). The final button names the action ("Accept and send", "Send your claim form") instead of a generic "Submit" — [GOV.UK Check answers](https://design-system.service.gov.uk/patterns/check-answers/)
- Carbon: single-column forms by default, citing NN/g ("multicolumn forms are more prone to misinterpretation"). Logically related fields may share a row. Group inputs under section headings — [Carbon Forms pattern](https://carbondesignsystem.com/patterns/forms-pattern/)
- Carbon required/optional: in simple forms mark only optional fields "(optional)"; in complex enterprise forms mark only required fields "(required)". Pick one and stay consistent — [Carbon Forms pattern](https://carbondesignsystem.com/patterns/forms-pattern/)
- Carbon validation timing: client-side validation fires "as soon as the field loses focus". Server-side errors show as an inline notification plus field errors on resubmit. Short forms may disable submit until valid; long forms keep it enabled — [Carbon Forms pattern](https://carbondesignsystem.com/patterns/forms-pattern/). **This conflicts with GOV.UK's validate-on-submit stance** ([GOV.UK Error summary](https://design-system.service.gov.uk/components/error-summary/)).
- Carbon: helper text sits below the label; placeholders hold format hints only, never critical info. Primary button is left-aligned for in-page forms, full-width/right in dialogs and side panels, and placed at the bottom of the form, not pinned at the top. Multi-step forms use a progress indicator — [Carbon Forms pattern](https://carbondesignsystem.com/patterns/forms-pattern/)
- USWDS: its live "validation" checklist component has known accessibility problems (screen reader users miss status changes) and **will be removed after USWDS v3.12.0**. USWDS also reminds teams to repeat every check on the server — [USWDS Validation](https://designsystem.digital.gov/components/validation/)

### Inferences
- Work report form: use sections (Unit & HM, Fuel, Operator, Photos, Notes), each with a heading, in one column. On a phone, a stepper of 3–5 short steps plus a GOV.UK-style review page with "Change" links fits better than one very long scroll and protects input across steps (draft saved locally, which matches the CLAUDE.md rule that input must never be lost).
- Validation: validate on submit and show an error summary at the top with anchor links (GOV.UK). Optionally clear an error on input once the user fixes it. Avoid blur validation that fires while a gloved user is still scrolling.
- Mark "(opsional)" on optional fields and never use asterisks. Most report fields are required, but Carbon's rule says to mark the minority, and that is the optional ones.
- Final button names the action ("Kirim laporan"), uses the orange CTA, and is full-width on mobile.
- shadcn mapping: the [Form](https://ui.shadcn.com/docs/components/form) / [Field](https://ui.shadcn.com/docs/components/field) components with Zod; [Alert](https://ui.shadcn.com/docs/components/alert) (destructive variant) as the error summary container with a list of anchor links; focus it programmatically on failed submit.

### Gaps
- I did not fetch the full text of GOV.UK's "Recover from validation errors" pattern; the validate-on-submit stance is taken from the error-summary page.
- Polaris form-layout guidance was not fetched, because polaris.shopify.com now redirects to shopify.dev (see §8).

## 2. Status indicators / badges / tags

### Takeaway
All the systems surveyed agree: never use color alone, keep labels to one or two words, and separate status (semantic color) from metadata tags (neutral or accent). Carbon requires at least three of icon, shape, color and text. Atlassian splits status "lozenges" from count "badges" and descriptive "tags". Polaris adds progress pips (incomplete / partially complete / complete) and past tense for finished states.

### Cited Findings
- Carbon status palette: red = danger/error, orange = serious warning, yellow = regular warning, green = success, blue = passive/informational, purple = outlier, gray = draft. An extended yellow/orange range exists for contrast — [Carbon Status indicators](https://carbondesignsystem.com/patterns/status-indicator-pattern/)
- Carbon: "at least three of these elements must be present" (symbol, shape, color, descriptive text) to meet WCAG. Color alone is insufficient. Icons alone are acceptable only at 3:1 contrast, and labels are recommended — [Carbon Status indicators](https://carbondesignsystem.com/patterns/status-indicator-pattern/)
- Carbon indicator types: icon indicators (content-rich layouts), shape indicators (scanning dense data), numbered badges (counts), dot badges, differential indicators (change in a statistic). Suggested vocabulary is grouped by attention level (high: error/alert; medium: acknowledgement/in progress; low: ready/system feedback) — [Carbon Status indicators](https://carbondesignsystem.com/patterns/status-indicator-pattern/)
- Atlassian Lozenge: semantic appearances (success, warning, etc.) are for workflow status, risk and defined conditions. Accent colors are for user-chosen colors with no semantic meaning, and the two should not be mixed. Max width 200px (longer text truncates). Sentence case. Filled icons for critical statuses only, because overuse dilutes them — [Atlassian Lozenge usage](https://atlassian.design/components/lozenge/usage)
- Atlassian: Lozenge = attributes that affect prioritization (status, priority, permissions). Badge = tallies/scores. Tag = descriptive metadata. Don't add custom interactivity to static lozenges; use the dropdown-lozenge variant instead — [Atlassian Lozenge usage](https://atlassian.design/components/lozenge/usage)
- Polaris badge content: one word per status, two only for complex states (e.g., "Partially refunded"). Sentence case. Past tense for completed statuses — (snippet) [Polaris Badge (legacy, via search)](https://polaris-react.shopify.com/components/feedback-indicators/badge)
- Polaris badge progress values: `incomplete`, `partiallyComplete`, `complete`, shown as icons/pips because color alone carries priority. Use them only when the user needs to take action. Tones include info, success, warning, critical, attention, new, read-only — (snippet) [Shopify App Home Badge (web components)](https://shopify.dev/docs/api/app-home/web-components/feedback-and-status-indicators/badge)

### Inferences
- PASKAM status vocabulary (orders: Draft → Diajukan → Disetujui/Ditolak → Dipesan → Diterima; jobs: Direncanakan → Berjalan → Selesai/Tertunda) should map to at most 5 semantic tones: neutral/gray (draft), blue (info/in progress), yellow or amber (needs attention/pending), green (done), red (rejected/error). Each badge gets a Lucide icon and a text label. Using orange for status would collide with the orange CTA, so reserve orange for actions and use yellow/amber for warnings (Carbon separates orange "serious" from yellow "warning", but PASKAM's brand reserves orange).
- Use past tense for completed states ("Disetujui", "Diterima"), per Polaris.
- Keep categories such as unit type or location as neutral outline tags (Atlassian Tag), visually distinct from status badges.
- shadcn mapping: extend [Badge](https://ui.shadcn.com/docs/components/badge) variants with semantic tones and a leading Lucide icon slot.

### Gaps
- SAP Fiori "Object Status" guidance page (sap.com/design-system) returned 403; I could not verify Fiori's semantic-state set (Negative/Critical/Positive/Information/None) in this session.
- Polaris web-components badge page content was seen only through search snippets.

## 3. List / detail, mobile data tables, filtering, search, sorting, bulk actions (Fiori list report / object page)

### Takeaway
The Fiori List Report → Object Page floorplan pair is the closest named model for PASKAM's data reports and order lists: a filter bar plus saved variants above a results table, and tapping a row opens a detail page with header facts and sections. On phones, the list/detail split collapses into a list screen and a drill-in detail screen. I could not fetch Fiori's page text in this session, so the mobile specifics need checking.

### Cited Findings
- Fiori List Report floorplan's canonical URL moved to sap.com/design-system (old experience.sap.com URL 301-redirects) — [Fiori List Report (redirect target)](https://www.sap.com/design-system/fiori-design-web/page-types/floorplans/list-report-floorplan-sap-fiori-element/). Page content returned 403 to the fetcher.
- Carbon empty "user action" states cover "no search results" and should explain the result and suggest next steps (e.g., clear filters) — [Carbon Empty states](https://carbondesignsystem.com/patterns/empty-states-pattern/)

### Inferences
- PASKAM list screens: sticky search field + "Filter" button that opens a bottom sheet (status, date range, unit, supervisor) + a row of removable chips showing active filters + result count + sort selector. On mobile, render rows as compact list items (title, key fact, status badge, date) instead of a wide table. Show a real table at md+ widths only.
- Detail screen = Object Page: header with ID, status badge and the primary orange action, then sections (Info, Spare parts, Photos, History/audit).
- Bulk actions are probably Owner-only and desktop-first (e.g., approve multiple orders). On mobile, prefer per-item actions unless the PRD requires bulk.
- shadcn mapping: [Drawer](https://ui.shadcn.com/docs/components/drawer) (bottom sheet) for mobile filters; [Sheet](https://ui.shadcn.com/docs/components/sheet) on desktop; [Data Table](https://ui.shadcn.com/docs/components/data-table) (TanStack) at md+; [Toggle Group](https://ui.shadcn.com/docs/components/toggle-group) for quick status filters.

### Gaps
- Fiori List Report / Object Page / Fiori for iOS "Object Cell" and filter-feedback specifics were not retrievable (403). No source here verifies how Fiori adapts the list report to phones.
- Material 3 chips/search guidance and Atlassian/Polaris filter patterns were not fetched due to the tool-call budget.

## 4. Empty, error, offline, loading states; toasts vs banners

### Takeaway
Carbon has the clearest taxonomy. Inline notifications persist next to the task. Toasts are transient and never for critical info. Banners are system-wide and persist until dismissed. Callouts are non-dismissible guidance. Fiori for iOS has the only explicit offline and sync banner guidance found. Empty states should be one short title, an explanation and one primary action; illustrations are optional.

### Cited Findings
- Carbon notification types: **Inline** (task-scoped, persists until resolved/dismissed), **Toast** (time-based, slides in/out, stacks newest on top), **Actionable** (one button, persists until acted on), **Banner** (system/product-level, top of content, persists until dismissed), **Callout** (loaded with the page, cannot be dismissed) — [Carbon Notification pattern](https://carbondesignsystem.com/patterns/notification-pattern/)
- Carbon: "Don't use notifications that dismiss on a timer for critical or emergency messages". Toasts are unsuitable for content that needs reading time. Visual disruption should match urgency — [Carbon Notification pattern](https://carbondesignsystem.com/patterns/notification-pattern/)
- Carbon empty-state types: no data (first use), user action (e.g., no search results), error management (data exists but can't be shown because of permission, system or config problems: "precisely indicate the problem, and constructively suggest a solution"), first-use alternatives (inline docs/starter content) — [Carbon Empty states](https://carbondesignsystem.com/patterns/empty-states-pattern/)
- Carbon empty-state anatomy: optional decorative image (empty alt), short title, body with next steps, one primary action, optional secondary link. With several empty states on screen, use tertiary buttons — [Carbon Empty states](https://carbondesignsystem.com/patterns/empty-states-pattern/)
- Fiori for iOS banner: an offline-state banner when the app goes offline (auto-dismiss after a few seconds, or persistent). A sync banner lets users keep working during sync, offers cancel/close, shows a spinning sync icon, then changes to "Sync completed" — (snippet) [Fiori for iOS Banner usage](https://www.sap.com/design-system/fiori-design-ios/v25-4/components/feedback/banner/usage)
- SAP Mobile Services provides a dedicated "Offline Synchronization" screen that shows sync status of the local store against the backend — [SAP Mobile Services – Offline Sync screen](https://help.sap.com/doc/f53c64b93e5140918d676b927a3cd65b/Cloud/en-US/docs-en/guides/features/onboarding/android/fiori-compose-screens/offline-sync.html)
- SAP offline OData works read and write; local changes are replayed to the backend when connectivity returns — [SAP tutorial: Offline OData intro](https://developers.sap.com/tutorials/fiori-ios-hcpms-offline-odata-introduction.html)

### Inferences
- PASKAM connectivity:
  - Persistent slim banner (not a toast) while offline, e.g. "Offline — laporan disimpan di perangkat".
  - Per-item sync status badge (Menunggu kirim / Terkirim / Gagal kirim + Coba lagi).
  - An outbox screen listing queued submissions, mirroring the SAP offline queue screen.
- Toasts (shadcn [Sonner](https://ui.shadcn.com/docs/components/sonner)) only for non-critical confirmations ("Draf disimpan"). Server, validation and permission errors go inline or in a persistent Alert.
- Empty states: Lucide icon at most (no illustrations, consistent with the anti-AI-slop rule), one sentence, one orange action. Treat "no results for filter" with a "Hapus filter" action. Permission empty state: say who can grant access.
- Loading: use [Skeleton](https://ui.shadcn.com/docs/components/skeleton) shaped like the list rows. Never show a spinner over a form that holds user input.

### Gaps
- Atlassian, Polaris and Material loading/skeleton and offline guidance pages were not fetched (budget). No primary source here for skeleton-vs-spinner thresholds.
- Salesforce Field Service mobile offline/briefcase UI guidance not researched.

## 5. Touch targets, typography, contrast, density

### Takeaway
Use at least 48×48 CSS px targets (M3) with about 8px spacing between them. Apple's well-known 44pt minimum is smaller. Outdoor glare argues for 48px and above, larger body text, and strong contrast.

### Cited Findings
- M3: touch targets at least 48×48dp; the visual icon can be 24dp with padding making up the target (roughly 9mm physical); targets separated by 8dp or more balance density and usability — (snippet) [M3 Accessibility – Structure](https://m3.material.io/foundations/designing/structure); also [Android Accessibility Help – Touch target size](https://support.google.com/accessibility/android/answer/7101858?hl=en)
- Carbon: status icons need at least 3:1 contrast if used without text — [Carbon Status indicators](https://carbondesignsystem.com/patterns/status-indicator-pattern/)

### Inferences
- Tailwind: `min-h-12` (48px) for buttons and list rows, `h-12` inputs, `gap-2` minimum between adjacent targets, body text 16px or more (also prevents iOS zoom on input focus), numeric KPI values larger.
- Keep one comfortable density on mobile. A "compact" density could exist for Owner desktop tables only.

### Gaps
- Apple HIG (44×44pt minimum, Dynamic Type scale) could not be fetched (JS-rendered page); verify at https://developer.apple.com/design/human-interface-guidelines/accessibility before citing.
- M3 type scale and Carbon/Fluent density guidance not fetched.

## 6. Mobile navigation (bottom bar vs rail vs drawer)

### Takeaway
M3 says: navigation bar with 3–5 destinations on compact widths (<600dp), navigation rail at medium (600–839dp). M3 Expressive (May 2025) deprecated the navigation drawer in favor of an expanded rail. That supports a 3–5-item bottom bar on phones and a rail/sidebar on tablet and desktop.

### Cited Findings
- M3 navigation bar: 3–5 destinations, each with icon and label. Vertical items in compact windows (<600dp), horizontal items in medium windows (600–839dp) — (snippet) [M3 Navigation bar guidelines](https://m3.material.io/components/navigation-bar/guidelines)
- M3 navigation rail: for mid-sized windows, 3–7 destinations plus an optional FAB. Replace the bar with a rail at medium breakpoints, though a bar is acceptable in medium windows with few destinations — (snippet) [M3 Navigation rail guidelines](https://m3.material.io/components/navigation-rail/guidelines)
- M3 Expressive (May 2025) drops the navigation drawer (replaced by an expanded navigation rail) and reintroduces a shorter bottom bar — [9to5Google report](https://9to5google.com/2025/05/14/material-3-expressive-navigation/) (secondary source; treat the drawer as deprecated guidance)
- M2 "Bottom navigation" is the legacy name and page — [M2 Bottom navigation](https://m2.material.io/components/bottom-navigation)

### Inferences
- PASKAM: bottom bar with at most 5 role-filtered items (e.g., Beranda, Laporan, Order, Planning, Lainnya). Labels always visible, Lucide icons, active state in brand blue. The "create report" action is an orange button or FAB inside the screen, not a tab: tab bars are for navigation, not actions (common HIG principle; see Gaps).
- Desktop/tablet ≥768px: left sidebar/rail. Avoid a hamburger drawer as the primary navigation on mobile.

### Gaps
- Apple HIG tab bar page could not be fetched; the "tabs are for navigation, not actions" rule and the recommended tab count are not verified here.

## 7. Date pickers, number inputs, segmented buttons, chips

### Takeaway
GOV.UK: for dates the user already knows, use plain numeric inputs, not a calendar. Use a calendar picker only when the user needs to browse dates. Numeric fields should use `inputmode="numeric"`.

### Cited Findings
- GOV.UK Date input: use it when users already know the date or can look it up without a calendar; don't use it if they're unlikely to know the exact date. All three fields use `inputmode="numeric"` — [GOV.UK Date input](https://design-system.service.gov.uk/components/date-input/)
- GOV.UK date error hierarchy: "Enter [x]" (missing) → "[x] must be a real date" → must be in the past / future / between → relational ("must be the same as or after [date]"). Show only the highest-priority message. Highlight a single field only if the error is isolated to it — [GOV.UK Date input](https://design-system.service.gov.uk/components/date-input/)

### Inferences
- Work date: default to today with a one-tap change. A shadcn [Calendar](https://ui.shadcn.com/docs/components/calendar) in a Drawer or Popover is fine for planning (browsing future dates). Report filters need a date-range preset chip set (Hari ini / 7 hari / Bulan ini / Custom).
- Hour meter and fuel: `<input inputmode="decimal">` with units shown as a suffix, large text, and validation against the previous HM reading (business rule: check PRD/ADR). Avoid tiny +/- steppers for large values like HM. Steppers suit only small counts (e.g., part quantity).
- Segmented control ([Toggle Group](https://ui.shadcn.com/docs/components/toggle-group)) for 2–4 mutually exclusive options such as shift or condition. Use chips for filters.

### Gaps
- M3 segmented button/chips/date picker pages and HIG pickers/steppers were not fetched.

## 8. Which system is closest in spirit; most copyable pages; deprecations

### Takeaway
GOV.UK (forms, errors, check-answers, date input) and Carbon (status indicators, notifications, empty states, forms) are closest to an operational, no-decoration app and the most worth copying. Fiori is the closest domain match (enterprise field/mobile, offline, list report / object page) but its docs were hard to access. M3 is the reference for navigation and touch targets. Polaris React is deprecated.

### Cited Findings
- Polaris React is deprecated. Shopify released Polaris Web Components on Oct 1, 2025, with no further features or fixes for the React library — [polaris-react-archive (GitHub, marked Deprecated)](https://github.com/Shopify/polaris-react-archive); [Shopify dev community thread](https://community.shopify.dev/t/is-polaris-shopify-com-going-to-be-shut-down/26216). polaris.shopify.com component pages now redirect to [shopify.dev/docs/api/polaris](https://shopify.dev/docs/api/polaris).
- SAP Fiori docs moved from experience.sap.com to sap.com/design-system (301 redirect observed) — [Fiori List Report (new URL)](https://www.sap.com/design-system/fiori-design-web/page-types/floorplans/list-report-floorplan-sap-fiori-element/)
- The USWDS validation component is being removed after v3.12.0 — [USWDS Validation](https://designsystem.digital.gov/components/validation/)
- M3 Expressive deprecates the navigation drawer — [9to5Google](https://9to5google.com/2025/05/14/material-3-expressive-navigation/)

### Inferences
- Pages most worth copying into `docs/design-system.md`:
  1. GOV.UK [Question pages](https://design-system.service.gov.uk/patterns/question-pages/)
  2. GOV.UK [Error summary](https://design-system.service.gov.uk/components/error-summary/)
  3. GOV.UK [Check answers](https://design-system.service.gov.uk/patterns/check-answers/)
  4. GOV.UK [Date input](https://design-system.service.gov.uk/components/date-input/)
  5. Carbon [Status indicators](https://carbondesignsystem.com/patterns/status-indicator-pattern/)
  6. Carbon [Notifications](https://carbondesignsystem.com/patterns/notification-pattern/)
  7. Carbon [Empty states](https://carbondesignsystem.com/patterns/empty-states-pattern/)
  8. Carbon [Forms](https://carbondesignsystem.com/patterns/forms-pattern/)
  9. Atlassian [Lozenge](https://atlassian.design/components/lozenge/usage)
  10. M3 [Navigation bar](https://m3.material.io/components/navigation-bar/guidelines)
  11. Fiori for iOS [Banner (offline/sync)](https://www.sap.com/design-system/fiori-design-ios/v25-4/components/feedback/banner/usage)
- These systems fit the anti-AI-slop rule: GOV.UK and Carbon use flat surfaces, no gradients, and icon+text status. Copy their restraint, not M3 Expressive's shape/motion flourishes.
- Decision to record (ADR): the team must choose between validate-on-submit (GOV.UK) and validate-on-blur (Carbon). Recommendation: on submit, plus clear-on-fix.

### Gaps
- Salesforce Lightning (Field Service mobile), Microsoft Fluent 2, Atlassian forms/flags, and Fiori for Android were not researched within the tool-call budget.
- Apple HIG content could not be fetched at all in this session.
