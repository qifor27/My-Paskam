# Mobile UX Patterns for Field Workers (Outdoor, Unstable Connectivity) — My PASKAM

Scope: evidence-based patterns for a mobile-first PWA (Next.js + Tailwind + shadcn/ui + Lucide) used by heavy-equipment field supervisors (work reports with HM, BBM liters, photos; spare-part orders; job plans) and an Owner who filters and exports PDF.

Source-quality legend: [P] = primary/research-backed (NN/g, Baymard, W3C, MDN, web.dev, WebKit, peer-reviewed); [V] = vendor/blog/aggregator, treat as weaker; [OLD] = pre-2020 but still cited as valid. Sources marked "(not fetched)" are canonical spec/doc URLs cited from known content but not re-read in this session; the report writer should verify them before quoting.

## 1. Fast mobile data entry (minimizing typing, input types, form layout, wizard vs single page)

### Takeaway
Use a single-column, single-page form for ~8–10 fields, cut fields wherever possible, prefill (today's date, last unit/operator/location), use chips/segmented controls for small option sets and a searchable combobox for operators/units, and use `type="text" inputmode="decimal"` (not `type="number"`) for HM and liters. Field count matters more than step count.

### Cited Findings
- Baymard testing: single-column forms produce "fewer skipped fields, misinterpreted fields, and errors compared to multicolumn layouts"; multicolumn forms require users to scan "both down and across." 16% of benchmarked sites still use extensive multicolumn forms. Exception: paired fields that form one logical entity (e.g., ZIP/city) while the form overall stays single-column. (Oct 2023) [P] — [Baymard: Avoid Multi-Column Forms](https://baymard.com/blog/avoid-multi-column-forms)
- Checkout research summary: "usability problems come from what is being asked at each step rather than from the steps themselves"; average US checkout 11.3 form fields when ~8 suffice; 17% of shoppers abandoned an order over long/complicated checkout. On mobile, a handful of fields already spans multiple viewports, so a 1–2 page mobile flow can look intimidating per step. [V — these Baymard numbers came via aggregators/search snippets, not a Baymard page I read directly] — [VWO Q&A with Baymard](https://vwo.com/blog/christian-holst-about-checkout-optimization/); [Growth Engines checkout summary](https://growth-engines.com/insights/ecommerce/ecommerce-checkout-optimization)
- Claim that "every additional form field costs ~2–3% conversion" and "reducing field count can increase conversion 35.26%" appears only in aggregator content attributed to Baymard; treat as unverified. [V] — [IvyForms](https://ivyforms.com/blog/multi-step-forms-single-step-forms/)
- `inputmode` values: `decimal` = digits + locale decimal separator (`.` or `,`); `numeric` = digits 0–9 only; `inputmode` is a hint only and does not validate; Baseline since Dec 2021. [P] — [MDN inputmode](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/inputmode)
- GOV.UK Design System dropped `type="number"` for `type="text" inputmode="numeric" pattern="[0-9]*"` because: NVDA exposes it as a spin button with unlabeled buttons; browsers round large values or convert them to exponential notation; Chrome silently discards letters except `e` with no feedback; mouse/trackpad scroll can accidentally change values. (Feb 2020) [P] — [GOV.UK Technology blog](https://technology.blog.gov.uk/2020/02/24/why-the-gov-uk-design-system-team-changed-the-input-type-for-numbers/)
- Date entry: calendar pickers are best for dates "close to the present time"; scrolling pickers are "slow and unproductive" for dates weeks away; label today's date ("today") to remove uncertainty; when the options are limited (<10), offer a short list. [P][OLD-ish, still valid] — [NN/g: Date-Input Form Fields](https://www.nngroup.com/articles/date-input/)

### Inferences (implementation guidance for PASKAM)
- **Form layout**: one page, single column, ~8–10 fields; group as "Unit & Operator" → "Readings (HM, BBM)" → "Location & Description" → "Photos". A wizard adds navigation cost without reducing the number of fields; use it only if the report grows a lot. Pair HM start/end side by side only if both exist and are short (Baymard's logical-pair exception).
- **Numeric readings**: `<input type="text" inputmode="decimal" autocomplete="off" enterkeyhint="next">` for HM (e.g., 12345.6) and liters; parse and validate on the server with Zod. Accept both `,` and `.` (Indonesian locale uses a comma decimal, and `inputmode="decimal"` shows the locale separator per MDN). Show the unit as a suffix ("jam", "L") outside the input. Avoid steppers for HM/liters: values are large and not incremented in small steps (GOV.UK's "non-incrementable" reasoning).
- **HM sanity checks**: prefill or show "HM terakhir unit ini: 12.340,5" under the field and warn (not block) if the new HM is lower or jumps implausibly. This is a business rule, so confirm with the PRD/ADR before adding thresholds.
- **Defaults/memory**: date = today (label "Hari ini"); remember last-used unit/location per supervisor (localStorage as a convenience only). Operator = searchable combobox (shadcn `Command` in a bottom sheet) with recent items on top; unit = combobox if >~7 options, chips if few; status/type with ≤5 options = segmented control/chips.
- **Date**: native `<input type="date">` defaulted to today plus quick chips "Hari ini / Kemarin", since nearly all reports are recent (NN/g: pickers suit near dates). Format display only via `src/lib/format.ts`.
- **Keyboard flow**: `enterkeyhint="next"` on intermediate fields, `"done"` on the last field; `autocomplete="off"` for readings so the browser doesn't suggest stale values. (enterkeyhint reference, not fetched: [MDN enterkeyhint](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/enterkeyhint))
- **Sticky submit**: a bottom-anchored primary (orange) "Simpan" bar sitting above the safe area (`padding-bottom: env(safe-area-inset-bottom)`), so the action stays reachable without scrolling.

### Gaps
- I didn't fetch a primary Baymard/NN/g study that directly compares a wizard and a single page for a ~10-field data-entry (non-checkout) form. The evidence above comes from checkout research.
- No primary research found on stepper vs free numeric entry for large meter readings; the guidance above is inferred from GOV.UK.
- `enterkeyhint` browser support wasn't verified this session.

## 2. Validation UX on mobile

### Takeaway
Validate late (on blur / on submit), never on focus of an empty field; after a field has an error, re-validate live as the user corrects it ("reward early, punish late"). Never clear user input on failure.

### Cited Findings
- "Late validation almost always performs better"; avoid premature validation that shows errors "before users even have a chance to type anything"; reward early / punish late: when editing an erroneous field validate immediately, for valid fields wait for blur; premature distraction reduces accuracy and increases completion time. Exceptions: password strength, username availability. (Sep 2022) [P] — [Smashing Magazine: Inline Validation UX](https://www.smashingmagazine.com/2022/09/inline-validation-web-forms-ux/)
- Indicators should be contextual, passive, conditional; Best Buy example combined an icon plus a different color to draw attention to a field needing correction. (Jan 2024) [P] — [NN/g: Indicators, Validations, Notifications](https://www.nngroup.com/articles/indicators-validations-notifications/)
- Don't rely on color alone for state: "Using only color to show state can be hard for users to notice, or even completely inaccessible." [P][OLD 2016] — [web.dev Offline UX design guidelines](https://web.dev/articles/offline-ux-design-guidelines)

### Inferences
- Error text sits directly under the field, with an icon (Lucide `CircleAlert`) plus red text plus a red border, phrased as what to do: "Isi HM akhir, contoh 12345,6", not "Invalid input".
- On submit with errors: scroll to and focus the first invalid field, and show a summary count at top ("2 kolom perlu diperbaiki").
- Server/network failure must keep all field values and photos in state (and in the IndexedDB draft); offer "Coba lagi" which reuses the same client UUID / idempotency key (matches CLAUDE.md rule 4).

### Gaps
- No NN/g/Baymard mobile-specific numeric data on error-message wording was fetched this session.

## 3. Photo capture in a web/PWA

### Takeaway
Use `<input type="file" accept="image/*">` (optionally `capture="environment"`) rather than a custom getUserMedia camera. Compress client-side via canvas/`createImageBitmap` before upload, show a thumbnail grid with per-photo status (queued / uploading % / done / failed + retry / remove), and persist blobs in IndexedDB so photos survive reloads and offline periods.

### Cited Findings
- `capture` with no value lets the browser pick; `"user"` / `"environment"` prefer the front/rear camera. On Android, `capture` removes the option to pick existing pictures and launches the camera directly. `accept="image/*"` alone, on Chrome/Safari iOS and Android, offers a choice between taking a photo or choosing an existing image. [P][OLD 2016, behavior still current to my knowledge] — [web.dev: Capturing an image from the user](https://web.dev/articles/media-capturing-images)
- getUserMedia gives a fully in-page camera but requires HTTPS and explicit permission; don't prompt on page load because most users reject unsolicited permission requests; frames are captured by `drawImage()` onto a canvas for manipulation/compression. [P][OLD] — [web.dev: Capturing an image from the user](https://web.dev/articles/media-capturing-images)

### Inferences
- **Recommendation**: offer two buttons, "Ambil Foto" (`accept="image/*" capture="environment"`, opens the camera directly) and "Pilih dari Galeri" (`accept="image/*"`, no capture, `multiple`). Supervisors often photograph first and file later, and `capture` blocks the gallery on Android.
- **Compression**: decode with `createImageBitmap(file, { imageOrientation: "from-image" })`, scale the long edge to ~1600–2000 px, `canvas.toBlob(..., "image/jpeg", ~0.75–0.8)`. This typically turns multi-MB camera files into a few hundred KB, which matters on weak signal. Exact targets are a product decision, so record them as an ADR. Strip EXIF on re-encode, but capture time/GPS first if the PRD needs them; that needs a security.md note.
- **Grid UI**: 3-column thumbnail grid with a "+" tile; each tile shows an overlay state: spinner/progress ring (uploading), check (done), red `RefreshCw` "Gagal — ketuk untuk ulang" (failed), and an `X` remove button at least 24×24 CSS px (prefer 44). Remove asks for confirmation only once the photo is uploaded.
- **Upload**: upload each photo independently (or via presigned URL) with its own client UUID; per-file progress via `XMLHttpRequest.upload.onprogress` (fetch has no upload progress in most browsers). The report record references photo IDs; the report can be "saved on device" while photos are still queued.
- **Limits**: enforce max count/size client-side for UX, and again server-side for security (MIME sniffing, size).

### Gaps
- I didn't fetch a 2020+ primary source on client-side compression benchmarks, or on iOS PWA camera quirks (e.g., standalone-mode file input behavior). Verify on real iOS/Android devices.

## 4. Offline-first UX (sync state, vocabulary, outbox, conflicts)

### Takeaway
Combine a quiet global connectivity indicator with **per-item sync status** (icon + text). Save locally first (outbox in IndexedDB) and sync opportunistically. Avoid the jargon "offline"; say what happens to the user's data. Background Sync is Chromium-only, so always add a foreground fallback (sync on `online` event, app open, visibility change, manual "Sinkronkan sekarang"). Request persistent storage to reduce eviction risk.

### Cited Findings
- "The word 'offline' often isn't clear enough to tell the user what your app is doing"; use action-based language; sample message: "You seem to have a bad network connection. Not to worry! Messages will be sent when the network is restored." Show sync status per item, not just app-level; don't use only color; use skeletons; no blocking modals when connectivity is poor. (Nov 2016) [P][OLD but still widely cited] — [web.dev: Offline UX design guidelines](https://web.dev/articles/offline-ux-design-guidelines)
- Outbox pattern: store the submission in an IndexedDB outbox and tell the page "the send failed but the data was successfully retained"; non-GET requests have no offline equivalent (network-only), so queue them. [P][OLD 2014, updated] — [web.dev: Offline Cookbook](https://web.dev/articles/offline-cookbook)
- Background Synchronization API: "Limited availability", not Baseline; needs HTTPS + service worker; flow = `registration.sync.register(tag)` → SW `sync` event → `event.waitUntil(sendOutbox())`; MDN recommends feature-detecting `SyncManager` and falling back to syncing immediately otherwise. [P] — [MDN: Background Synchronization API](https://developer.mozilla.org/en-US/docs/Web/API/Background_Synchronization_API). Note: the summary of the Offline Cookbook I fetched listed Firefox support, which I believe is wrong (Firefox and Safari don't ship it). Rely on MDN's compat table.
- WebKit storage policy (Aug 2023): per-origin quota up to 60% of disk for browser apps (home-screen web apps get the same); eviction is per-origin, LRU by user interaction, under quota/storage pressure; origins in **persistent mode** or with active pages are protected; use `navigator.storage.persist()`, `persisted()`, `estimate()`. [P] — [WebKit: Updates to Storage Policy](https://webkit.org/blog/14403/updates-to-storage-policy/)

### Inferences
- **Vocabulary (Bahasa Indonesia)**, three-plus-one states, each as icon + text + color:
  - `Tersimpan di HP` / "Menunggu dikirim" — Lucide `Clock` (grey/blue) — like WhatsApp's clock tick before sending (common-knowledge analogy, not sourced here).
  - `Mengirim…` — `Loader2` spinning (blue) with photo progress "2/5 foto".
  - `Terkirim` — `CheckCircle2` (green). Optionally hide after a while to reduce clutter (NN/g warns indicators add noise).
  - `Gagal dikirim — ketuk untuk coba lagi` — `AlertTriangle` (red/orange action), with a reason if known ("Sesi berakhir, masuk lagi", "Foto terlalu besar").
- **Global**: a slim non-blocking banner at top when offline: "Tidak ada sinyal. Laporan tetap tersimpan di HP dan dikirim otomatis saat online." Plus a badge on the nav ("3 menunggu") linking to an Outbox list. No modals.
- **Outbox**: IndexedDB records `{clientId (UUID), type, payload, photos[], status, attempts, lastError, createdAt}`. Send with the `Idempotency-Key: clientId` header so the server upserts; use exponential backoff; triggers are `online`, `visibilitychange`, app start, the SW `sync` event (Chromium), and a manual button.
- **Optimistic UI**: after "Simpan", navigate to the list immediately with the item at the top in "Tersimpan di HP"; never show success copy like "Terkirim" until the server confirms.
- **Conflicts**: for append-only records (work reports, part orders created by one supervisor) conflicts are rare. For edits use a `version`/`updatedAt` check and, on mismatch, show both values and let the user choose, rather than silent last-write-wins. Whether edits after submit are even allowed is a business rule: check the PRD/ADR.
- **Auth expiry offline**: if the session expires while items are queued, keep the queue and prompt for login, then resume. Never drop queued data.
- **iOS**: call `navigator.storage.persist()` after the first save. Encourage "Add to Home Screen". No Background Sync, so foreground sync on open is essential.

### Gaps
- I didn't fetch first-hand engineering write-ups from offline-first field apps (e.g., Fulcrum, ServiceTitan, Linear's sync), or a primary source for the Google Docs / WhatsApp / Notion status UI. The comparisons above are common knowledge, not cited evidence.
- The "7-day cap on script-writable storage for Safari non-home-screen sites" (2020 ITP) wasn't mentioned in the 2023 WebKit post I read. Its current status is unverified.

## 5. Lists with status (badges, grouping, refresh, pagination, swipe)

### Takeaway
List newest first, grouped by day ("Hari ini", "Kemarin", then a date), with each row showing a status badge made of icon + text + color. Use "Muat lebih banyak" (load more) or cursor pagination instead of infinite scroll for task-oriented lists on weak connections. Keep swipe actions optional, with visible alternatives.

### Cited Findings
- Infinite scroll suits goal-less browsing of homogeneous items; **Load More** suits mobile and bandwidth-constrained scenarios; pagination is better for finding specific items. Infinite scroll breaks return-to-position after viewing a detail ("find themselves at the top of the list") and hides the footer. (Sep 2022) [P] — [NN/g: Infinite Scrolling Tips](https://www.nngroup.com/articles/infinite-scrolling-tips/)
- Status indicators should be contextual and justify their space, since they add clutter; icon + color together draw attention. (Jan 2024) [P] — [NN/g: Indicators, Validations, Notifications](https://www.nngroup.com/articles/indicators-validations-notifications/)
- Hoober: users prefer to view and touch the center of the screen, so primary content goes in a center list/grid. (Mar 2017) [P][OLD] — [UXmatters: Design for Fingers, Touch, and People, Part 1](https://www.uxmatters.com/mt/archives/2017/03/design-for-fingers-touch-and-people-part-1.php)

### Inferences
- Row anatomy: line 1 = unit code + type (bold); line 2 = operator · HM · BBM (regular, ≥14px); right side = time plus status badge (pill with Lucide icon + short text). Sticky day headers.
- Pull-to-refresh: fine as a convenience in a PWA, but the browser's own overscroll reload can conflict with it. Set `overscroll-behavior-y: contain` on the scroll container, and always provide a visible refresh/sync button too, since pull-to-refresh isn't discoverable. (General web knowledge, not sourced this session.)
- Swipe actions: hidden, error-prone with gloves/dirty hands. If used (e.g., swipe to retry/delete a draft), duplicate them in the detail view or a kebab menu, and add undo for destructive actions.
- Use "Muat lebih banyak" with cursor pagination and restore scroll position when returning from detail (Next.js: keep the list in a client cache).

### Gaps
- No primary research on pull-to-refresh discoverability or swipe-action error rates was fetched.

## 6. Filter + export (Owner)

### Takeaway
On mobile, open filters in a full-height bottom sheet with **batch apply** ("Tampilkan 47 hasil"). Show active filters as removable chips above the list, plus a count badge on the Filter button. For PDF export, show progress, generate server-side for large ranges, and hand off via the Web Share API (files) with a download fallback.

### Cited Findings
- NN/g: use **batch filtering** (Apply button) on mobile, because page loads are slower and refreshing after every facet is "disruptive and tiresome"; interactive filtering fits exploratory users only when results come back in under ~1 s. (Feb 2016) [P][OLD] — [NN/g: Applying Filters](https://www.nngroup.com/articles/applying-filters/)
- Baymard: display applied filters in an overview; on mobile show a count such as "4 Filters Applied" so users know there are more active filters than the visible ones. [P via search snippet; page not fetched] — [Baymard: How to Design Applied Filters](https://baymard.com/blog/how-to-design-applied-filters)
- Recommendations for a full-screen filter overlay, 44×44 px targets, and a result count on Apply ("Show 47 results"). [V] — [LogRocket: Mobile search filter UX](https://blog.logrocket.com/ux-design/best-practices-mobile-search-filter/)
- `navigator.share()` needs a secure context, transient user activation (button click) and the `web-share` permissions policy; check `navigator.canShare({ files })` before sharing files; PDF is a commonly supported type; errors: `AbortError` (user cancelled), `NotAllowedError`, `TypeError`, `InvalidStateError`; "Limited availability", not Baseline. [P] — [MDN: Navigator.share()](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share)

### Inferences
- Filter sheet sections: Date range (chips "Hari ini / 7 hari / Bulan ini / Custom"), Pengawas, Unit, Status, Jenis. Sticky footer with "Reset" (secondary) and "Tampilkan N hasil" (orange primary). Encode filters in the URL search params so they survive reload and can be shared.
- Export flow: the button "Ekspor PDF" applies the *current filters* and shows a summary ("142 laporan, 1–30 Sep") before generating. For small exports, generate and then `navigator.share({ files: [pdf] })` if `canShare`, else `<a download>`. For large exports, run a server job with a progress state ("Menyiapkan PDF… 40%") and a later "Unduh" link, and don't block the UI. `navigator.share` must be called directly in the click handler: if generation takes a while, show a second "Bagikan" button when the file is ready, because transient activation expires.
- Treat `AbortError` as a non-error (user cancelled the share sheet).

### Gaps
- Desktop browser support for file sharing (e.g., Firefox desktop) wasn't verified; MDN only says "limited availability".
- No research found on optimal UX for long-running PDF exports specifically.

## 7. Outdoor readability (sunlight, contrast, typography, light vs dark)

### Takeaway
Sunlight collapses effective screen contrast, so design with maximum contrast: target WCAG AAA 7:1 for body text, use near-black text on white, no light greys or thin weights, ≥16px body, semibold labels. Default to light mode; there is no evidence that dark mode helps in daylight.

### Cited Findings
- Under sunlight the effective contrast ratio of a phone display has been measured below 1.75:1 ("seriously washed out"), because ambient light raises the black level. Brightness and contrast fade progressively from 500 to 20,000 lux. [P — summarized from search snippets of display-engineering literature; full papers not read] — [ResearchGate: Contrast-ratio analysis of sunlight-readable color LCDs](https://www.researchgate.net/publication/245413666_Contrast-ratio_analysis_of_sunlight-readable_color_LCDs_for_outdoor_applications); [ScienceDirect: Effects of high ambient illuminations on image quality in mobile displays (2020)](https://www.sciencedirect.com/science/article/abs/pii/S0030402620305106)
- Screen reflectivity matters as much as native contrast and brightness for sunlight legibility. [V/lab test] — [GSMArena display tests](https://www.gsmarena.com/gsmarena_lab_tests-review-751p2.php)
- A 2025 ACM paper treats ambient illumination as a *situational impairment* for digital devices (full text blocked, 403). [P, unread] — [ACM DL 10.1145/3764687.3769905](https://dl.acm.org/doi/10.1145/3764687.3769905)
- Light mode (positive polarity) beat dark mode on visual acuity and proofreading in Piepenbrock et al. 2013, with the advantage growing as font size shrinks; Dobres et al. 2017 found polarity didn't matter in daytime glanceable reading, but light mode performed better at night. Users with cataracts/cloudy media read better in dark mode. Recommendation: light mode for normal vision, offer a toggle. (Feb 2020) [P] — [NN/g: Dark Mode vs. Light Mode](https://www.nngroup.com/articles/dark-mode/)
- WCAG 2.x: 1.4.3 (AA) requires 4.5:1 for normal text and 3:1 for large text; 1.4.6 (AAA, Contrast Enhanced) requires 7:1 / 4.5:1. [P, not fetched] — [W3C Understanding 1.4.6](https://www.w3.org/WAI/WCAG22/Understanding/contrast-enhanced.html)

### Inferences
- Since sunlight can crush effective contrast to under 2:1, AA's 4.5:1 leaves little margin. Use 7:1+ for body text and key numbers (HM, liters). No standard says "7:1 for outdoors"; this is a reasoned choice, best recorded as an ADR.
- Tokens: text on white `#0f172a`-ish (slate-900 ≈ 17:1); secondary text no lighter than slate-600 (≈7.5:1 on white). Avoid slate-400 for meaningful text. Orange action buttons: white text on Tailwind orange-500 (#f97316) is only about 2.8:1 and fails AA. Use orange-700 (#c2410c, ≈5.2:1) or darker, or dark text on orange. Verify with a checker.
- Type: base 16–17px, numbers 18–20px semibold, weights ≥500 for labels (thin weights wash out in glare). Status should never rely on hue alone (also needed for color-blind users); always add an icon + text.
- Glassmorphism (CLAUDE.md allows it only as an accent) lowers contrast. Never put it behind text that must be read outdoors.
- Default light theme. Dark mode optional (dawn/night shifts); don't auto-switch.

### Gaps
- No peer-reviewed study fetched that gives a specific minimum contrast ratio or font size for outdoor phone use; the 7:1 target is an inference.
- The ACM 2025 paper couldn't be read.

## 8. One-handed use, thumb zone, primary action placement, gloves/dirty hands

### Takeaway
People shift grips constantly and most taps land mid-screen. Corners need larger targets (~12mm) than the center (~7mm). Put the primary action in a bottom sticky bar (or bottom nav plus a contextual "Buat Laporan"), tertiary items in menus. For gloves/dirty hands, go well beyond minimums: 48–56px targets with ≥8px gaps.

### Cited Findings
- Hoober 2013, 1,333 observations of people in public (780 touching the screen): 49% one-handed, 36% cradled, 15% two-handed; grips change "sometimes every few seconds"; 67% of one-handed users used the right thumb, 33% the left. (Feb 2013) [P][OLD] — [UXmatters: How Do Users Really Hold Mobile Devices?](https://www.uxmatters.com/mt/archives/2013/02/how-do-users-really-hold-mobile-devices.php)
- Hoober 2017: 75% touch with one thumb; fewer than 50% hold with one hand alone; 36% cradle; 10% hold in one hand and tap with the other's finger. Accuracy is best at the center, where targets can be ~7mm, while corners need ~12mm (sizes cover 95% of taps). Primary content goes in the center, secondary actions along top/bottom edges, tertiary in corner menus. (Mar 2017) [P][OLD] — [UXmatters: Design for Fingers, Touch, and People, Part 1](https://www.uxmatters.com/mt/archives/2017/03/design-for-fingers-touch-and-people-part-1.php)
- NN/g: touch targets at least 1cm × 1cm; based on Parhi, Karlson & Bederson 2006 (one-handed thumb); average fingertip 1.6–2cm, thumb impact ~2.5cm (MIT Touch Lab); often-recommended spacing ~2mm; larger for primary actions and mobile contexts. (May 2019) [P][OLD] — [NN/g: Touch Targets on Touchscreens](https://www.nngroup.com/articles/touch-target-size/); original study [Parhi et al. 2006 (PDF)](https://www.microsoft.com/en-us/research/wp-content/uploads/2006/01/parhi-mobileHCI06.pdf)
- Platform minimums: Material 48×48 dp, Apple 44×44 pt. [V summary] — [Ahmad Shadeed: Designing better target sizes](https://ishadeed.com/article/target-size/)
- Gloved operation: standard gloves reduce effective touch precision to ~20–25mm, capacitive-tip gloves ~12–15mm; 48–56px "more reliably operated". [V — vendor blog, military context, no cited study; weak] — [Corvus Intelligence: Ruggedized UX](https://corvusintell.com/blog/field-apps/ruggedized-ux-military-operators/)
- A 2025 arXiv study investigates encumbrance (carrying objects) effects on touch target acquisition on handheld devices. [P, not read] — [arXiv 2512.16472](https://arxiv.org/pdf/2512.16472)

### Inferences
- Bottom navigation for 3–5 top-level destinations (Beranda, Laporan, Order, Planning, Akun) with icon + label; primary per-screen action as a full-width bottom sticky button in forms, and in lists either a bottom-right FAB ("+ Laporan") or a bottom bar button. Given Hoober's finding that corners need ~12mm, make a FAB ≥56px.
- Targets: min 44×44 CSS px for all controls (≥48 preferred, 56 for primary/FAB); ≥8px gaps between adjacent targets (more than NN/g's 2mm because of gloves/dust). List rows ≥56px tall with the whole row tappable.
- Bottom sheets (shadcn `Drawer`/vaul) for pickers, filters and confirmations keep controls in the reachable lower half. Avoid critical actions in the top corners; put destructive actions away from the primary CTA.
- Avoid gestures as the only path: no long-press-only, swipe-only or pinch-only features.

### Gaps
- No rigorous peer-reviewed data on gloved/dirty-finger touch target sizes was found; the glove numbers come from a weak vendor source.
- Thumb-zone heatmaps for 6.5"+ phones (2020+) weren't found in this session.

## 9. Accessibility basics that matter in the field (WCAG 2.2)

### Takeaway
Meet WCAG 2.2 AA (2.5.8: 24×24 CSS px minimum or spacing) but aim for AAA 2.5.5 (44×44) for all field controls. Keep visible focus, respect reduced motion, and never convey status by color alone.

### Cited Findings
- SC 2.5.8 Target Size (Minimum), AA: targets at least 24×24 CSS px; undersized targets pass if a 24px-diameter circle centered on each doesn't intersect another target or circle; exceptions for equivalent controls, inline text, UA defaults, essential. SC 2.5.5 (AAA) = 44×44, and W3C advises "for important links/controls, consider aiming for the stricter 2.5.5." [P] — [W3C Understanding SC 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
- Don't use color alone to show state. [P][OLD] — [web.dev: Offline UX design guidelines](https://web.dev/articles/offline-ux-design-guidelines)
- WCAG 2.2 added 2.4.11 Focus Not Obscured (Minimum), relevant when sticky bottom bars/headers cover focused fields; 2.3.3 Animation from Interactions (AAA) relates to `prefers-reduced-motion`. [P, not fetched] — [W3C: What's New in WCAG 2.2](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/)

### Inferences
- Sticky submit bars and bottom nav must not hide the focused input when the keyboard opens: add `scroll-padding-bottom` equal to the bar height and test with the virtual keyboard (2.4.11).
- Visible `:focus-visible` ring in a blue structural token, ≥2px, with 3:1 against adjacent colors.
- Wrap spinners/slide-in animations with `@media (prefers-reduced-motion: reduce)` (Tailwind `motion-reduce:`), keeping status changes as text.
- Labels always visible (no placeholder-only labels); errors linked with `aria-describedby`; sync status changes announced via a polite `aria-live` region.

### Gaps
- Didn't fetch the specific Understanding pages for 2.4.11 or 2.3.3 in this session.
