# Real-world field-service / fleet / maintenance / construction apps: mobile UI/UX patterns for My PASKAM

Research date: 2026-10-05. Sources are mostly official help centers (step-by-step UI descriptions). Note: SafetyCulture/iAuditor appears to have rebranded as "Mitti (by SafetyCulture)". help.safetyculture.com now 301-redirects to help.mitti.com, and the App Store listing is titled "Mitti (by SafetyCulture)" ([App Store](https://apps.apple.com/us/app/safetyculture-iauditor/id499999532)). Several pages (Samsara KB, Jobber product updates) returned HTTP 403, so the details for those come from search-result snippets of the official pages and are marked as such.

## 1. Home screen and navigation (bottom nav, tabs, quick actions)

### Takeaway
The common pattern is a short bottom tab bar (4-5 items) plus a role-aware Home that shows "today": next appointments, items needing action, and a few KPIs. Creating a record happens through a context "+" / Quick Add button, either per record or per section. Admins and field users get different Home content from the same shell.

### Cited Findings
- Jobber's bottom navigation has Home, Schedule, Timesheet, Search and Messages. A "More" tab holds lower-frequency items such as Apps & Integrations, Payments and Settings — [Jobber help via search snippet](https://help.getjobber.com/hc/en-us/articles/360051851173-Home-in-the-Jobber-App); [Jobber product update (403, snippet)](https://productupdates.getjobber.com/51900-new-and-improved-navigation-on-the-mobile-app)
- Jobber's navigation redesign "adds more contrast for improved usability" — [Jobber product update (snippet)](https://productupdates.getjobber.com/51900-new-and-improved-navigation-on-the-mobile-app)
- Jobber Home has four sections. (1) Map + "Up Next": a map centred on the first appointment, with pins for the day's appointments. (2) "To Do" (admin only) with actionable items such as "New requests" and "Approved quotes". (3) "Business Health": weekly job value and visits scheduled, with trend indicators against the previous period. (4) Discover — [Jobber Help: Home in the Jobber App](https://help.getjobber.com/hc/en-us/articles/360051851173-Home-in-the-Jobber-App)
- Jobber appointment cards show status (completed, active, to go, late), time tracked versus scheduled time, the title and the client name. "Up Next" is ordered by scheduled start time, and "anytime" appointments come last — [Jobber Help](https://help.getjobber.com/hc/en-us/articles/360051851173-Home-in-the-Jobber-App)
- Jobber role differences: admins see Map, To Do, Business Health, Discover, Activity feed and Settings. Non-admins see a map filtered to their permitted appointments, Settings and Messages — [Jobber Help](https://help.getjobber.com/hc/en-us/articles/360051851173-Home-in-the-Jobber-App)
- Raken: "Project tools" sits in the bottom navigation bar. The user picks a project from the top-left selector, then a tool such as Daily logs — [Raken Help: Create a Daily Report in the mobile app](https://help.rakenapp.com/en/articles/14478739-how-to-create-a-daily-report-in-the-raken-mobile-app)
- Samsara Driver app: the Home screen is a grid of tiles (for example a "DVIR" tile). Tapping a tile opens its module, which has a "Create DVIR" action — [Samsara KB via search snippet](https://kb.samsara.com/hc/en-us/articles/12017949275405-View-or-Complete-a-DVIR)
- Fleetio Go: records are created from the record context. Browse → Vehicles → vehicle overview → "+ Quick Add" button in the lower right → choose Fuel Entry (and the other entry types) — [Fleetio Help: Fuel Entries in Fleetio Go](https://fleetio.helpjuice.com/fleetio-go/fuel-entries-in-fleetio-go)
- MaintainX mobile: Work Orders opens from the sidebar, with a "+ New Work Order" button. Offline settings live under the Account section of the Overview screen — [MaintainX Help: Create a Work Order (snippet)](https://help.getmaintainx.com/create-a-work-order); [MaintainX Help: Working Offline](https://help.getmaintainx.com/offline-mode)
- Fieldwire, after a project is selected: a reviewer describes a stripped-down mobile layout with a left-side menu of icons for tasks, plans, photos and forms — [review aggregator snippet; thedigitalprojectmanager / work-management.org](https://thedigitalprojectmanager.com/tools/fieldwire-review/) (secondary source)

### Inferences
- For PASKAM, a bottom nav with roughly 4 items (Beranda, Laporan Kerja, Order Part, Planning) plus a "Lainnya"/More item for Laporan Data and account fits the Jobber pattern. A Pengawas Home could show "today": today's planned jobs, pending orders, and drafts not yet synced. An Owner Home adds "needs attention" items and a few KPIs, mirroring Jobber's admin/non-admin split.
- A per-unit Quick Add (Fleetio style: open unit PASKAM 2 → "+" → Laporan Kerja / Order Part) means the unit is filled in automatically, which removes one picker step.
- High contrast in the nav (Jobber explicitly cites it) matters for outdoor and sunlight use.

### Gaps
- No reliable 2024-2026 screenshots or descriptions were found for the Procore, ServiceTitan or UpKeep home screens. Mobbin was not checked because it needs a login.

## 2. The create flow (long form, wizard or checklist) and reducing typing

### Takeaway
Real products use a single scrollable form with grouped sections for simple entries (Fleetio fuel entry, MaintainX work order). They use a sectioned "daily log" hub with sub-entries for daily reports (Raken, Procore), and a linear checklist ending in certify/sign for inspections (Samsara DVIR, SafetyCulture). Typing is cut down with defaults (today's date, last price), auto-calculation, copy-from-previous-day, QR or asset context, and required-field gating.

### Cited Findings
- **Fleetio Go fuel entry, a single form with sections:** Details, Additional Details, Settings, Custom Fields, Attachments. Date defaults to the current date and time. Price per Gallon is prefilled from the most recent entry. Total is auto-calculated from price × gallons. Odometer is filled in this form too. Save sits in the top right — [Fleetio Help: Fuel Entries in Fleetio Go](https://fleetio.helpjuice.com/fleetio-go/fuel-entries-in-fleetio-go)
- Fleetio's meter field (odometer or hour meter) is required on fuel entries and holds the reading at the time of the transaction. These readings trigger service reminders — [Fleetio Help: Fuel Entry Overview](https://help.fleetio.com/using-fleetio/fuel-entry-overview)
- Fleetio can require meter readings for service entries or inspections (admin setting) — [Fleetio Help: Require Meter Readings](https://help.fleetio.com/en_US/inspections/require-meter-readings-for-service-or-inspections)
- Fleetio fuel entries also have "Partial fuel-up" and "Reset usage" toggles, so efficiency calculations stay correct — [Fleetio Help](https://fleetio.helpjuice.com/fleetio-go/fuel-entries-in-fleetio-go)
- **Raken daily log hub:** Daily logs opens with today's date selected by default (tap the date to change it). Sections include Work logs, Notes, Attachments and Survey. An orange "+" button adds a Work log (company, number of workers, hours, description, attachments), saved with a checkmark ✓ in the top right. Then come "Preview report" and "Sign and complete" — [Raken Help](https://help.rakenapp.com/en/articles/14478739-how-to-create-a-daily-report-in-the-raken-mobile-app)
- **Procore Daily Log:** pick a date, then a log type (Weather, Manpower and so on), then fill the fields, then Save. A Copy function copies log entries From one date To another, per selected section, and they can be edited afterwards. Weather and Photos cannot be copied because weather data is fetched for the specific day — [Procore: Copy a Daily Log (Android)](https://support.procore.com/procore-mobile-android/user-guide/daily-log-android/tutorials/copy-a-daily-log-android); [Procore: Add a Daily Log Entry (Android)](https://v2.support.procore.com/product-manuals/daily-log-android/tutorials/add-a-daily-log-entry-android)
- **Samsara DVIR, a linear flow:** DVIR tile → Create DVIR → asset details (vehicle, location) → inspection type (Pre-Trip / Post-Trip) → required fields, with defects selected from a list plus a description and an optional photo → safety status "Safe to drive" / "Unsafe" → "Certify and Submit" — [Samsara KB (403; snippet)](https://kb.samsara.com/hc/en-us/articles/43217017570829-View-or-Complete-a-DVIR-in-DVIR-2-0)
- Samsara positioned its DVIR as quick to complete, with "walkaround image capture and single-click digital signatures" taking "seconds". Note that this is from **2017** — [Samsara blog, Feb 2017](https://www.samsara.com/blog/samsara-dvir-faster-issue-resolution-fewer-breakdowns)
- **MaintainX work order:** the title field is phrased as a question, "What needs to be done?", followed by optional details — [MaintainX Help: Create a Work Order (snippet)](https://help.getmaintainx.com/create-a-work-order). There are four status options: Open (default), On Hold, In Progress, Done. Status switches to In Progress automatically when the user starts editing procedure steps, and "Mark as Done" completes the order — [MaintainX Help: Complete a Work Order](https://help.getmaintainx.com/complete-a-work-order)
- MaintainX lets users scan barcodes to add parts, record voice notes with optional AI transcription in comments, and run a start/stop timer for labour — [MaintainX Help: Complete a Work Order](https://help.getmaintainx.com/complete-a-work-order)
- **UpKeep:** scanning an asset's QR code inside the app creates a work request with the asset and location already attached. Requesters can submit without an account. Scanning only works from the UpKeep app, not the phone's camera app — [UpKeep: QR codes](https://upkeep.com/qr-codes/); [UpKeep: Mobile CMMS](https://upkeep.com/product/mobile-cmms/)
- **SafetyCulture/Mitti:** inspections start from a template, and photos, signatures and GPS are captured inside it — [goaudits comparison (secondary)](https://goaudits.com/blog/best-mobile-inspection-apps/); [Mitti Help: Inspections](https://help.mitti.com/using-safetyculture/inspections)

### Inferences
- For PASKAM's Laporan Kerja, the evidence supports **one sectioned form, not a wizard**: Tanggal (default today), Unit (preselected when started from a unit), Operator (picker, last used), HM and BBM (numeric keypad), Lokasi (last used / chips), Deskripsi, Status (segmented chips), Foto. Save stays reachable in a sticky action (orange).
- A "copy from the previous report" option (Procore) fits recurring daily unit reports. Lokasi and operator are often the same day to day.
- Prefill from the last entry (Fleetio's price-per-gallon pattern) can apply to Operator and Lokasi per unit. The HM field could show the "last HM: 12,345" as a hint.
- Status chips modelled on MaintainX (Open / On Hold / In Progress / Done) plus a binary "safe/unsafe" style flag (Samsara) are useful patterns for spare-part order urgency. Any new statuses have to come from the PRD or ADRs, not be invented.
- Phrasing the description field as a question ("Apa yang rusak?") follows MaintainX's "What needs to be done?".
- Scanning a QR code on each unit (UpKeep) is a possible later enhancement for picking the unit with no typing.

### Gaps
- No official source confirmed a "numeric keypad for meter field" detail. In a PWA this would be `inputmode="numeric"`/`decimal`, but that is an inference, not something cited from these products.
- Specific "last-used value" behaviour beyond Fleetio's price prefill was not documented in the sources fetched.

## 3. Photo capture, annotation, upload status, offline and sync

### Takeaway
Offline-first is table stakes: Fieldwire, SafetyCulture/Mitti, Samsara DVIR 2.0 and MaintainX all advertise offline capture with automatic sync. Products differ in how visible sync state is. SafetyCulture has a sync-status list and a manual sync, and MaintainX shows "Cache last updated" plus storage. Photos come with limits (Samsara 4 per vehicle and 3 per trailer) and annotation tools (SafetyCulture).

### Cited Findings
- Samsara DVIR 2.0 supports Offline Mode. A full inspection can be completed and saved without connectivity and syncs when the device is back online. Photo limits are 4 for vehicles and 3 for trailers — [Samsara KB (snippet)](https://kb.samsara.com/hc/en-us/articles/43217017570829-View-or-Complete-a-DVIR-in-DVIR-2-0)
- MaintainX switches to offline mode **automatically** when it cannot connect, and it can also be toggled manually (Account → Offline Settings → "Is Offline"). Offline work uses a local cache of work orders, which must be built while online. The UI shows "Cache last updated" and "Available Storage". After reconnecting, the user syncs the cache — [MaintainX Help: Working Offline](https://help.getmaintainx.com/offline-mode)
- The MaintainX documentation does not describe on-screen offline banners or pending-upload indicators — [MaintainX Help](https://help.getmaintainx.com/offline-mode) (absence noted)
- SafetyCulture/Mitti: Inspections, Actions, Assets, Documents, Issues, Reports, Schedule and Training work offline (some with limitations). Analytics, Notifications, Library, Sensors, Template Editor and others do not. There is a "detailed syncing status list" in the mobile app, auto-sync on reconnect, and a manual sync. Official advice: check sync status before going offline, and save photos to the device as a backup — [Mitti Help: Supported offline features](https://help.mitti.com/en-US/002907/)
- SafetyCulture: only inspections stored on the device can be edited offline ("Store inspections offline" setting) — [SafetyCulture Help: Store inspections on your device](https://help.safetyculture.com/000124)
- SafetyCulture supports annotating images inside inspections to give context to observations — [SafetyCulture Help: Annotate images](https://help.safetyculture.com/003414)
- Fieldwire: view plans, add tasks and capture photos offline, with automatic sync on reconnect. Its plan viewer supports markups and annotations — [Fieldwire App Store](https://apps.apple.com/us/app/fieldwire-construction-app/id780165517); [review summary (secondary)](https://thedigitalprojectmanager.com/tools/fieldwire-review/)
- Fieldwire limitation per reviewers: mobile performance suffers with poor cell service, and handwritten sketches on plans are "difficult and choppy" — [review aggregator (secondary)](https://thedigitalprojectmanager.com/tools/fieldwire-review/)
- UpKeep markets that "photos attach where they were taken", so the record becomes a by-product of the work — [UpKeep Mobile CMMS](https://upkeep.com/product/mobile-cmms/)

### Inferences
- PASKAM should **auto-detect offline** (as MaintainX does) and not need a toggle. It should show a global sync indicator (online / offline / N items pending / failed) plus a per-record badge (Draft, Menunggu sinkron, Terkirim, Gagal + Coba lagi). Competitors' documentation is weak here, so a visible pending list (SafetyCulture's "sync status list") is a real differentiator.
- A per-form photo cap (Samsara-like, for example 4-6) keeps uploads manageable on weak networks. Client-side compression is implied.
- Annotation (circling the damaged part) is valuable for Order Spare Part damage photos, but it is optional for a first release.
- The fact that Mitti advises users to back up photos themselves shows that photo loss is a known risk. PASKAM's "input must not be lost" rule should cover photos stored in IndexedDB until the server confirms them.

### Gaps
- No product documentation found shows per-photo upload progress UI. Conflict-resolution UI was not documented by any of the products checked.

## 4. Record lists with status, filters, grouping, and detail screens

### Takeaway
Lists are anchored to dates (Raken and Procore pick a date first, Jobber orders by scheduled time) and carry status chips with a few clear states. "Late" and "incomplete/unsigned" are surfaced explicitly.

### Cited Findings
- Jobber cards show status as completed / active / to go / late, ordered by start time — [Jobber Help](https://help.getjobber.com/hc/en-us/articles/360051851173-Home-in-the-Jobber-App)
- Raken tracks "unsigned or incomplete days" separately from completed reports — [Raken Help: Daily Reports in Raken](https://help.rakenapp.com/en/articles/14465435-daily-reports-in-raken)
- Procore Daily Log navigation is calendar-day first: tap a date, then the logs for that day — [Procore Android](https://v2.support.procore.com/product-manuals/daily-log-android/tutorials/add-a-daily-log-entry-android)
- MaintainX work order status set: Open / On Hold / In Progress / Done — [MaintainX Help](https://help.getmaintainx.com/complete-a-work-order)
- Samsara's DVIR resolution chain: driver submits → mechanic notified, prioritises and signs off the repair → next driver confirms the fix and signs (2017 description) — [Samsara blog 2017](https://www.samsara.com/blog/samsara-dvir-faster-issue-resolution-fewer-breakdowns)
- Fleetio Go vehicle overview acts as the hub for per-vehicle records (fuel, service and so on) — [Fleetio Help: Manage Vehicles in Fleetio Go](https://help.fleetio.com/en_US/fleetio-go/manage-vehicles-in-fleetio-go)

### Inferences
- PASKAM lists: group by date ("Hari ini", "Kemarin", dates), show a status chip with a colour and a text label (never colour alone, which also helps in sunlight), put the unit name first and large, and highlight "terlambat"/overdue for Planning Job (Jobber's "late").
- A unit detail page could act as a hub (Fleetio style) showing recent reports, the last HM, and open spare-part orders.

### Gaps
- No sources found describe saved filters or search UI in these mobile apps in concrete terms.

## 5. Daily report, DVIR and meter-reading screens

### Takeaway
Meter readings are treated as validated, monotonic data. Fleetio blocks readings lower than the previous one and offers Edit or Void. Daily reports are a set of sections that end in preview and signature.

### Cited Findings
- Fleetio meter validation: entering a meter value lower than an existing entry on or before that date prompts **Edit or Void**. Meters do not roll back, so entries must increase in date order. Void skips validation, which covers cases such as a replaced meter — [Fleetio Help: Meter Validation in Fleetio Go](https://fleetio.helpjuice.com/fleetio-go-for-account-owners-admins/meter-validation-in-fleetio-go-9); [Fleetio Help: Meter Entry Void](https://help.fleetio.com/s/article/Meter-Entry-Mark-As-Void-Unmark-As-Void)
- Fleetio has a dedicated "Meter Entry Conflicts" article and a "Reset Meter Values" article for meter replacement — [Meter Entry Conflicts](https://help.fleetio.com/en_US/meter-entry-conflicts); [Reset Meter Values](https://help.fleetio.com/en_US/meters/reset-meter-values)
- Fleetio supports both an odometer and an hour meter as the primary meter type — [Fleetio Help: Fuel Entry Overview](https://help.fleetio.com/using-fleetio/fuel-entry-overview); [Meter Overview](https://help.fleetio.com/en_US/using-fleetio/meter-overview)
- Raken daily report: Work logs (crew, workers, hours, description), Notes, Attachments/photos, Survey and optional Time Cards. It ends with Preview, then Sign and complete — [Raken Help](https://help.rakenapp.com/en/articles/14478739-how-to-create-a-daily-report-in-the-raken-mobile-app); [Daily Reports in Raken](https://help.rakenapp.com/en/articles/14465435-daily-reports-in-raken)
- Procore Weather log entries are filled from a weather service for that specific date, so they cannot be copied — [Procore Copy Daily Log](https://support.procore.com/procore-mobile-android/user-guide/daily-log-android/tutorials/copy-a-daily-log-android)

### Inferences
- PASKAM's HM field should be validated against the unit's last HM, with a clear warning ("HM lebih kecil dari laporan terakhir 12.345") and options to fix it or flag it as a meter reset. **Whether lower HM values are allowed is a business rule to confirm and record as an ADR.**
- A "Preview, then Kirim" step before final submit (Raken) reduces errors on reports that the Owner relies on.

### Gaps
- No public screenshots or detailed docs of the Fleetio Go meter-entry screen layout were retrieved. The Samsara DVIR 2.0 page body was blocked (403).

## 6. Reporting and export (PDF)

### Takeaway
SafetyCulture has the most mature model: reusable report layouts (cover page, logo, page size, image size and quality), PDF/Word export from mobile through Download or Share, and live web links. Raken's PDF includes only the sections active that day.

### Cited Findings
- SafetyCulture mobile: tap the top-right control to apply a report layout, then Download (PDF) or Share (email PDF) — [SafetyCulture Help: Export reports](https://help.safetyculture.com/en-US/000055/)
- Report layouts customise the cover page, company logo, page size, and image size and quality — [SafetyCulture Help: Report layouts](https://help.safetyculture.com/003189); [Cover pages](https://help.safetyculture.com/003129)
- Report links are public URLs giving a **real-time** view, unlike a PDF, which is a snapshot taken at export — [SafetyCulture Help: Manage report links](https://help.safetyculture.com/en-US/005313/)
- Raken daily report PDFs contain all sections active on the report that day and can include collaborator reports — [Raken Help](https://help.rakenapp.com/en/articles/14465435-daily-reports-in-raken)

### Inferences
- For PASKAM's Laporan Data: filters (date range, unit, supervisor, status) → preview count → "Export PDF". The PDF should carry a cover/header with the logo, the applied filters, and the generation timestamp, because a PDF is a snapshot (SafetyCulture's distinction). Photo size and quality options keep the PDF small. Public share links are a security question for `docs/security.md`, so they are not recommended without an ADR.

### Gaps
- No concrete details were found on Fleetio's or MaintainX's mobile export UX. Their reporting appears to be web-centric, but this is unconfirmed.

## 7. What users and reviewers praise or complain about

### Takeaway
Praise centres on fast onboarding and a simple, stripped-down mobile UI (Fieldwire). Complaints centre on sync in low coverage, sluggishness, and above all **data loss after crashes or during typing**, which directly backs PASKAM's "input must not be lost" rule.

### Cited Findings
- Fieldwire is praised for a clean, intuitive interface that crews pick up with minimal training and a mobile app stripped to essentials. Its weaknesses are performance in poor coverage and choppy sketching — [thedigitalprojectmanager review](https://thedigitalprojectmanager.com/tools/fieldwire-review/); [Fieldwire customer reviews](https://www.fieldwire.com/customers/reviews/)
- Capterra reviews of field service apps (FieldPulse, Synchroteam, GPS Insight FSM, FastField and others) report the mobile app feeling sluggish when syncing from weak coverage, sync failures and missing assignments, and **data loss after crashes or when rotating the phone or typing, which forces re-entry** — [Capterra FieldPulse reviews](https://www.capterra.com/p/153475/FieldPulse/reviews/); [Capterra Synchroteam reviews p3](https://www.capterra.com/p/129634/Synchroteam/reviews/?page=3); [Capterra GPS Insight FSM reviews](https://www.capterra.com/p/212692/GPS-Insight-Field-Service-Management/reviews/); [Capterra FastField reviews](https://www.capterra.com/p/138489/FastField/reviews/). Caveat: this came from a search-engine summary across these pages. Individual quotes were not verified product by product.

### Inferences
- PASKAM priorities that follow from the complaints: autosave drafts on every change (survives crash, rotation and reload), keep UI work light during sync, show sync failures clearly with a retry, and never block the form while uploading.

### Gaps
- G2 and App Store review text for Fleetio Go, Samsara Driver, MaintainX and Raken was not retrieved because of the tool-call budget. Sentiment specific to those apps is unverified.
- No Behance, Dribbble or Medium field-app case studies were reviewed.
