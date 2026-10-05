# "Clean modern" UI trends 2025–2026 for operational apps, what to avoid, and visual inspiration (My PASKAM)

Research date: 2026-10-05. Scope: product/ops UI rather than marketing sites. Every claim below has a link. Anything I could not verify is listed under Gaps.

## 1. What makes up the respected "clean modern" product UI style (Linear, Vercel/Geist, etc.)?

### Takeaway
The respected 2025–2026 product style uses a neutral base and one deliberate accent. Colors come from a perceptual color space (LCH/OKLCH). Text contrast is high, with carefully tuned alignment. Inter or Geist is used with tabular numbers for data. Borders and layered subtle shadows carry most of the separation work instead of heavy drop shadows. Motion is restrained and has a reduced-motion variant. Much of the quality is felt rather than seen: alignment, contrast and consistency.

### Cited Findings
- Linear's redesign uses Inter Display for headings "to add expression" and regular Inter for body text. — [Linear: How we redesigned the Linear UI](https://linear.app/now/how-we-redesigned-the-linear-ui)
- Linear moved theme generation to the LCH color space because it is perceptually uniform ("a red and a yellow with lightness 50 will appear roughly equally light"). A theme now comes from 3 variables (base color, accent color, contrast) instead of 98, which also makes high-contrast themes automatic. — [Linear](https://linear.app/now/how-we-redesigned-the-linear-ui)
- Linear raised contrast: text and neutral icons are darker in light mode and lighter in dark mode. It also aimed for a "more neutral and timeless appearance" by reducing how much brand chrome color is mixed into the neutrals. — [Linear](https://linear.app/now/how-we-redesigned-the-linear-ui)
- Linear spent effort on vertical and horizontal alignment of labels, icons and buttons in the sidebar and tabs: "isn't something you'll immediately see but rather something that you'll feel after a few minutes." — [Linear](https://linear.app/now/how-we-redesigned-the-linear-ui)
- Geist (Vercel) recommends tabular numbers for numeric data: `font-variant-numeric: tabular-nums` or Geist Mono, so digits line up across rows in tables. — [Vercel Geist Typography](https://vercel.com/geist/typography), [Geist Table](https://vercel.com/geist/table)
- Vercel Web Interface Guidelines, the parts that matter for ops UIs:
  - Use tabular numbers for comparisons, and put a non-breaking space between a number and its unit (`10&nbsp;MB`).
  - Prefer APCA contrast. Hover, active and focus states should have more contrast than the default state.
  - Hit targets: at least 24px, and at least 44px on mobile. "If part of a control looks interactive, it should be interactive." Use a visible `:focus-visible` ring.
  - Every animation needs a reduced-motion variant. Animate only transform and opacity, and keep animations interruptible.
  - Shadows: layer them ("ambient + direct light with at least two layers"). Combine borders with semi-transparent overlays for clear edges. Nested radii: the child radius must be ≤ the parent's, and corners concentric.
  - Forms: inputs must not lose their value after hydration. Never block paste. A loading button shows a spinner and keeps its label. Spinners get a 150–300ms show-delay and 300–500ms minimum visibility. Loading text ends in an ellipsis ("Saving…"). Errors tell the user how to fix the problem. Destructive actions need confirmation or undo.
  - Source: [Vercel Web Interface Guidelines](https://vercel.com/design/guidelines)
- shadcn/ui's current defaults are neutral, not colorful:
  - `--radius: 0.625rem` (10px), with a derived scale from radius-sm to radius-4xl.
  - Colors in OKLCH. `--primary` is near-black `oklch(0.205 0 0)` in light mode.
  - Base color options: Neutral, Stone, Zinc, Mauve, Olive, Mist, Taupe.
  - Source: [shadcn/ui Theming](https://ui.shadcn.com/docs/theming)

### Inferences
- For PASKAM, Linear's 3-variable approach maps directly onto the brand: base = cool neutral, accent = orange (actions only), plus a blue "structure" hue for header/nav/identity, all defined in OKLCH on top of the existing Tailwind 4 tokens in `globals.css`.
- Tabular numbers should be the default wherever hour meter (HM), quantities, part numbers and dates appear in lists or reports. This is a domain detail that also makes the app feel built for its users.
- The 44px mobile hit target is the minimum. For supervisors wearing gloves or working in the sun, 48px+ is a reasonable internal standard. That is my inference, not a source finding.

### Gaps
- I did not fetch primary sources for Stripe Dashboard, Notion, Raycast, Attio, Height, Notion Calendar or GitHub Primer, because the research budget ran out. Claims about those products are deliberately left out.
- Linear's article did not state concrete radius or spacing numbers.

## 2. Critiques of "AI slop" / the generic shadcn look, and techniques that make a UI feel human-designed

### Takeaway
"AI slop" UI is the statistical average of training data:
- purple/violet gradients
- colored glows
- Inter everywhere
- permanent dark mode
- identical icon-on-top feature cards
- stat-banner rows
- colored left-border cards
- emoji sidebars
- bento mosaics

The fix the sources agree on is to write design decisions down once in a durable place (tokens plus a DESIGN.md or design-system doc), commit to one dominant color and one accent, and design around real content and hierarchy.

### Cited Findings
- AI slop is described as "the generic look every AI coding agent reaches for by default": purple→blue gradients, a gray 1px border on every card, Inter headlines, three feature cards in a row, dark mode nobody asked for. — [vibecodekit: AI Slop Design (2026)](https://vibecodekit.dev/ai-slop-design)
- Root cause: models output "the statistical mean of their training data"; distinctive design "lives in the tails". shadcn is built to be copy-pasted by agents, so its defaults show up everywhere. — [vibecodekit](https://vibecodekit.dev/ai-slop-design)
  - The same source says shadcn ships a violet primary (#7c3aed). That is **contradicted** by the official docs, where the default primary is near-black `oklch(0.205 0 0)`: [shadcn/ui Theming](https://ui.shadcn.com/docs/theming). The "violet" look most likely comes from LLM habits, not shadcn's defaults. Treat the vibecodekit claim as unreliable.
- A catalog of 16 slop patterns by Adrian Krebs (Developers Digest, Apr 2026, updated Sep 2026):
  - Fonts: Inter for everything; recycled pairings (Space Grotesk / Instrument Serif / Geist); a single serif-italic accent word.
  - Color: "VibeCode Purple"; permanent dark mode with medium-gray text; dark themes failing WCAG AA; gradients everywhere; colored glows and shadows.
  - Layout: centered hero; badge above the H1; **colored left card borders** ("almost as reliable a sign"); identical icon-on-top feature cards; numbered 1-2-3 steps; **stat banner rows**; **emoji-icon sidebars**; all-caps headings.
  - Key fix: "Encode choices somewhere durable instead of re-deciding on every prompt," e.g. a DESIGN.md that documents palette, type system and layout primitives.
  - Source: [Developers Digest: AI Design Slop, 16 patterns](https://www.developersdigest.tech/blog/ai-design-slop-and-how-to-spot-it)
- Concrete anti-slop instructions:
  - Specify display, body and mono fonts, and list the generic ones to ban.
  - One dominant color plus a sharp accent, defined as CSS variables.
  - An 8px spacing rhythm.
  - A list of forbidden patterns (purple gradients, three-card heroes).
  - shadcn/ui as the foundation.
  - Screenshot and compare after every UI change.
  - Source: [vibecodekit](https://vibecodekit.dev/ai-slop-design); similar advice in [MindStudio: avoid AI slop with a design system](https://www.mindstudio.ai/blog/claude-design-avoid-ai-slop-design-system) and [Alex Lavaee: Why my AI-generated UI looked generic](https://alexlavaee.me/blog/lessons-learned-designing-with-ai/)
- An open-source scanner that audits AI frontends for "purple-gradient slop" and for the newer "tasteful" defaults (cream + terracotta, mono chrome). — [GitHub: funboy322/avoid-ai-design](https://github.com/funboy322/avoid-ai-design)
- Bento grids "went from Apple keynote device to AI default in two years… a mosaic is the cheapest way to look like a layout happened." — [UX Skill: Why every AI UI reaches for the bento grid](https://uxskill.laithjunaidy.com/blog/ai-bento-grid-overused.html)

### Inferences
- Several of these "slop tells" are already banned by the PASKAM PRD (gradients, glow, emoji icons, decorative widgets). PRD §4 should also add **colored left-border cards**, **stat-banner rows on the dashboard**, **all-caps section labels**, and **permanent dark mode**.
- Inter is flagged as "overused" in the critiques, but it remains a sound choice for legibility. The tell is defaulting to it without other decisions behind it. A defensible PASKAM choice is Inter or Geist (or the system font for performance) with tabular numbers, a fixed type scale and real Indonesian content. Swapping fonts just to look different is not required.
- The strongest anti-slop technique for PASKAM is domain specificity:
  - real unit codes (e.g. "PC200-8 / EX-12"), HM readings, spare-part numbers and work-order statuses
  - Indonesian microcopy written for supervisors instead of generic SaaS copy
  - a project-specific `docs/design-system.md` that acts as the "DESIGN.md"

### Gaps
- I found no strong primary essay by a well-known designer, such as a Linear or Vercel staff blog post, that critiques "AI slop" directly. Most sources are 2026 blogs and tool-vendor posts, so their authority is moderate.
- I did not locate HN or X threads with verifiable URLs in this pass.

## 3. Apple Liquid Glass (2025) and the glassmorphism revival: readability criticism and guidance for sparing use

### Takeaway
Apple's own guidance limits glass to the navigation layer that floats above content:
- never glass-on-glass
- tint only primary actions
- the clear variant only over media with a dimming layer
- respect Reduce Transparency, Increase Contrast and Reduce Motion

NN/g found that iOS 26 hurts legibility (text over busy backgrounds), crowds touch targets and adds decorative motion. For PASKAM this confirms the PRD stance: glass only as a subtle accent, mostly opaque, with a solid fallback.

### Cited Findings
- Raluca Budiu (NN/g), "Liquid Glass Is Cracked, and Usability Suffers in iOS 26", 10 Oct 2025, found:
  - translucent elements obscure content, e.g. Messages text camouflaged by background photos and Mail subject lines layered into an "illegible mess"
  - spacing between targets below the "at least 0.4cm" guideline, and cramped tab bars with a floating search button
  - decorative motion: "motion for motion's sake is not usability. It's distraction with a side of nausea"
  - back buttons without labels and hidden tab management
  - Recommendations: put content legibility first, keep controls in consistent locations, preserve conventions, meet touch-target standards.
  - Source: [NN/g](https://www.nngroup.com/articles/liquid-glass/)
- Commentary on the NN/g piece: [anderegg.ca](https://anderegg.ca/2025/10/12/nielsen-norman-group-on-ios-26-usability), [HN discussion](https://news.ycombinator.com/item?id=45560593), [Pixel Envy / TidBITS](https://pxlnv.com/linklog/engst-nng-liquid-glass/)
- Apple WWDC25 "Meet Liquid Glass" (session 219):
  - Placement: "best reserved for the navigation layer that floats above the content". Putting it in the content layer "would make it compete with other elements and muddy the hierarchy".
  - Stacking: "Always avoid glass on glass". For elements on top of glass, use fills, transparency and vibrancy instead.
  - Variants: Regular is the default and adaptive. Clear is allowed only over media-rich content, when a dimming layer is acceptable and the content on top is bold and bright. The two variants "should never be mixed".
  - Tint: "Tinting should only be used to bring emphasis to primary elements and actions… When every element is tinted, nothing stands out." Put color in the content layer instead.
  - Accessibility: Reduced Transparency makes the glass frostier, Increased Contrast makes elements black/white with a contrasting border, Reduced Motion disables the elastic effects.
  - Source: [Apple WWDC25: Meet Liquid Glass](https://developer.apple.com/videos/play/wwdc2025/219/); also [Get to know the new design system](https://developer.apple.com/videos/play/wwdc2025/356/)

### Inferences
- Rules for PASKAM glass (applying Apple and NN/g to a web PWA used outdoors):
  1. Use glass only on the floating bottom nav, the modal/sheet backdrop and the login card. Never on list rows, cards or forms.
  2. Make it near-opaque (high-alpha white plus blur) so text keeps WCAG AA contrast regardless of what scrolls underneath.
  3. Add a `@media (prefers-reduced-transparency: reduce)` fallback to a solid surface, and `prefers-reduced-motion`.
  4. No glass on glass (e.g. no glass dropdown inside a glass nav).
  5. Orange tint only on the primary action, never on the whole bar.
- Direct sunlight makes low-contrast translucency even worse. This is my inference; I found no field study.

### Gaps
- The Apple HIG "Materials" page could not be read by the fetcher (JS-rendered). Guidance comes from the WWDC session instead.
- I found no quantitative study of glass UI legibility outdoors.

## 4. Trends relevant to operational apps: calm/dense dashboards, status-first design, bento grids, light vs dark for field use, "boring is good"

### Takeaway
For ops:
- Light mode is the evidence-backed default for legibility, especially at small text sizes.
- Bento grids are now an "AI default". They are fine only when tile size encodes real priority, and they collapse badly on mobile.
- "Calm" dashboards mean live data without visual noise, and density matched to the dashboard type: monitoring needs loud alerts, strategic views can stay quiet.

### Cited Findings
- NN/g (Budiu, 2020, still the canonical summary):
  - For people with normal vision, light mode (positive polarity) "won across all dimensions" in acuity and proofreading tasks.
  - "The smaller the font, the better it is for users to see the text in light mode."
  - Dark mode helps some users with cataracts or cloudy ocular media.
  - Recommendation: light mode as the default, dark mode as an option.
  - Source: [NN/g: Dark Mode vs. Light Mode](https://www.nngroup.com/articles/dark-mode/)
- "Permanent dark mode" and dark themes failing WCAG AA are listed as AI-slop tells. — [Developers Digest](https://www.developersdigest.tech/blog/ai-design-slop-and-how-to-spot-it)
- Bento grid critiques:
  - risk of a "visual maze"
  - mismatch between source order and visual order for screen readers
  - naive vertical stacking on mobile creates "endless scroll"
  - "A visually balanced dashboard can still be a bad dashboard if it makes a billing issue and a decorative preview feel equally important."
  - Sources: [SaaSFrame: Designing bento grids that actually work (2026)](https://www.saasframe.io/blog/designing-bento-grids-that-actually-work-a-2026-practical-guide), [Zayd Zarrouk: Bento without turning the dashboard into decoration](https://www.zaydzarrouk.com/blog/UI%20System%20Guide/bento-grid-ui-for-saas-dashboards/), [UX Skill](https://uxskill.laithjunaidy.com/blog/ai-bento-grid-overused.html)
- Calm dashboards: "A monitoring tool needs sub-second updates and loud alerts. A strategic SaaS view can refresh nightly and stay calm." Old enterprise dashboards were "a wall of data tables with no hierarchy". — [Fuselab: Dashboard design trends 2026](https://fuselabcreative.com/top-dashboard-design-trends-2025/), [Fuselab: Enterprise UX guide 2026](https://fuselabcreative.com/enterprise-ux-design-guide-2026-best-practices/)
- Applying mobile constraints to an analytical dashboard strips out density that analysts depend on, so different dashboard types need different density. — [Fuselab](https://fuselabcreative.com/top-dashboard-design-trends-2025/)
- Field-service app pattern overview (2025). — [Team400: Mobile apps for field service, design patterns](https://team400.ai/blog/2025-07-field-service-mobile-apps); older background on field-service mobile CX: [UXmatters (2023)](https://www.uxmatters.com/mt/archives/2023/09/enhancing-the-customer-experience-with-field-service-mobile-apps.php)

### Inferences
- Status-first for PASKAM:
  - The Pengawas home screen should lead with "what needs action" (draft reports, pending part orders, today's planned jobs) as a list with status chips. It should not open with KPI tiles.
  - The Owner gets a denser desktop view: tables with tabular numbers, filters and drill-down.
  - This puts the "density by role" finding into practice.
- Status color should be semantic and separate from the brand: success = green, warning = amber, error = red, info = blue. This keeps orange free for actions only. Make sure the warning amber can never be confused with the orange CTA, e.g. by pairing amber with an icon and text label and keeping CTAs as filled buttons.
- Ship light mode only, or light as the default. That matches both NN/g and the PRD's outdoor requirement.

### Gaps
- I found no specific, well-known 2024–2026 essay titled along the lines of "boring is good" for enterprise UI. Search returned only agency blogs.
- I found no published research on sunlight readability for mobile web apps.
- AI assistant patterns were not researched because they are not relevant to PASKAM's current scope.

## 5. Concrete visual inspiration for field-service / fleet / construction / maintenance apps

### Takeaway
Dribbble and Behance have few strong, recent, non-slop field-ops shots, and many are concept dashboards with decorative charts. Better references are **shipping products**, browsable on Mobbin or their own sites: ServiceTitan Field Mobile, Jobber, Fleetio and Fieldwire. Use Dribbble tags only for small details, with caution.

### Cited Findings
- ServiceTitan Field Mobile App:
  - native technician app where job details, forms, photo capture, estimates and payments live in a single flow per job
  - a useful model for a job-centric home screen and a photo + form workflow
  - Sources: [ServiceTitan feature page](https://www.servicetitan.com/features/field-mobile-app), [ServiceTitan help: Field Mobile App Home](https://help.servicetitan.com/docs/field-mobile-app)
- Jobber: field service app for quotes, scheduling, invoicing. — [Jobber Academy: best field service apps](https://www.getjobber.com/academy/best-mobile-field-service-apps/)
- Mobbin: a library of more than 300,000 real app screens and flows, filterable by category and UI element. It is the best place to study real list, form and status patterns in shipped apps. — [Capterra: Mobbin](https://www.capterra.com/p/10187598/Mobbin/), [Mobbin explore](https://mobbin.com/explore/web)
- Fleetio, on what an equipment maintenance log app should do (domain features: service history, inspections, meter readings). — [Fleetio blog](https://www.fleetio.com/blog/best-equipment-maintenance-log-app)
- Fieldwire positions itself as mobile-first for field operations (useful construction reference for task lists and plans). — [Fieldwire vs Procore](https://www.fieldwire.com/blog/fieldwire-vs-procore-comparison/)
- Behance case studies (older, so treat them as pattern references for flows, not visual trend references):
  - [Field Service Management – Technician Mobile App, Brundha Krishnan (2022)](https://www.behance.net/gallery/138399583/Field-Service-Management-Technician-Mobile-App)
  - [Field service mobile app Design, Arunachalam A (2017)](https://www.behance.net/gallery/53743791/Field-service-mobile-app-Design)
  - [Behance search: field service app](https://www.behance.net/search/projects/field%20service%20app?locale=en_US)
- Dribbble tag pages:
  - [fleet-management-app](https://dribbble.com/tags/fleet-management-app)
  - [fleet-app](https://dribbble.com/tags/fleet-app)
  - Search snippets mention shots titled "Predictive Maintenance App Pro", "Auto Eye – Fleet Management Dashboard", "Digitruck – Truck Owner App UX" and "Telematics SaaS – Driver Profile". I could not open the individual shots to judge their quality or get their URLs.
- Example of the bento-dashboard aesthetic to **avoid** as a template: [Dribbble: Bento Grid Dashboard](https://dribbble.com/shots/24384312-Bento-Grid-Dashboard)

### Inferences
- Qualities to copy from shipped field apps (ServiceTitan/Jobber-style):
  - job/work-order as the central object
  - a big sticky primary action at the bottom
  - status chips with text
  - photo thumbnails inline in the report
  - offline and sync indicators
  - forms broken into short sections
- Qualities to avoid from concept shots: decorative gauges or donut charts, map backgrounds behind text, gradient KPI cards, dark-only dashboards.

### Gaps
- The Dribbble tag page did not render in the fetcher, so **I could not verify individual shot URLs or describe the shots' visual quality**. A human should browse those tags and Mobbin (login required) to pick 5–10 references.
- I found no Mobbin deep links, since Mobbin requires an account.
- I found no public design-system documentation from Samsara, Procore or Fieldwire in this pass.

## 6. Customizing shadcn/ui so it doesn't look generic

### Takeaway
shadcn now ships several "styles", each a full visual language with its own density, radius and spacing. Pick the style for the work being done (a dense one for data, a balanced one for forms). Then set a small number of tokens: `--background`, `--foreground`, `--primary`, `--radius`, fonts and a chart palette. Validate on one realistic screen before rolling out.

### Cited Findings
- Tokens: every color and the radius are CSS variables in OKLCH. `--radius` defaults to 0.625rem, and sm–4xl steps are derived from it. The token list covers background, card, popover, primary, secondary, muted, accent, destructive, border, input, ring, chart-1…5 and the sidebar set. — [shadcn/ui Theming](https://ui.shadcn.com/docs/theming)
- shadcn styles (shadcndesign, May 2026, updated Jul 2026):
  - **Nova**: default, balanced.
  - **Vega**: a more polished middle ground.
  - **Mira**: dense and compact, "ideal for dashboards, admin panels…", but "can feel less relaxed".
  - **Luma**: spacious and round.
  - **Sera**: editorial, square corners.
  - **Maia**: round and approachable.
  - **Rhea**: borderless-at-rest inputs.
  - **Lyra**: square, geometric.
  - Advice: "A style should match the work people are doing." Customize the theme after choosing a style, and test one realistic screen in Figma and code.
  - Source: [shadcndesign: How to choose the right shadcn/ui style](https://www.shadcndesign.com/blog/how-to-choose-shadcn-ui-style)
- Start with four tokens: `--background`, `--foreground`, `--primary`, `--radius`. Radius presets range from None to Full. A style is the whole visual language; a theme is the color/radius/font layer on top of it. — [shadcndesign theming docs](https://www.shadcndesign.com/docs/theming), [shadcn studio theme generator](https://shadcnstudio.com/docs/getting-started/theme-generator)
- Visual token editors with live preview: [tweakcn](https://tweakcn.com/), [shadcndesign theme generator](https://www.shadcndesign.com/theme-generator), [shadcncraft](https://shadcncraft.com/theme). Customization guide: [Spectrum UI: make shadcn components actually yours](https://ui.spectrumhq.in/blog/shadcn-customization-guide)
- There is a paid course specifically on styling Tailwind and shadcn AI prototypes while avoiding slop. — [Maven](https://maven.com/p/af8a3f/style-ai-prototypes-master-tailwind-shad-cn-avoid-slop)

### Inferences
- Concrete PASKAM recipe (inferred from the sources):
  1. Neutral base: a cool gray, slightly tinted toward the brand blue.
  2. `--primary` = orange, used only for buttons and CTAs. A separate brand-blue token covers header, active nav and identity. Do **not** map blue to shadcn's `--accent`, because shadcn uses `--accent` for hover backgrounds.
  3. `--radius` around 0.5rem (8px). Cards ≤ 12px, inputs and buttons 8px, chips full. Nested radii must stay concentric.
  4. A type scale with tabular numbers. Base body text 16px on mobile to avoid iOS zoom.
  5. Density: a Mira-like compact density for Owner desktop tables, and Nova/Vega-like density with 44–48px targets for Pengawas mobile forms.
  6. Borders for separation. At most one subtle two-layer shadow, for floating elements only (bottom nav, sheet).
  7. Record all of this in `docs/design-system.md` as the durable "DESIGN.md".
- Check which shadcn style or preset the project actually uses before choosing. The style names above come from a third-party blog as of mid-2026.

### Gaps
- I did not verify the style list (Nova/Vega/Mira/etc.) against official shadcn docs. It comes from a third-party vendor blog.
