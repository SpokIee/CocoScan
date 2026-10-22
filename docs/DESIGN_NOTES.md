# Design notes — Figma → code

Source: Figma file `db28yB0uReqfa2W18qae7J` ("CocoScan"), read through the Figma MCP
connector on 2026-10-22. Frames are 375 × 812. Ten of the thirteen frames were pulled with full
design context (styles, fonts, assets); Welcome, Login and Image Capture hit the Figma Starter
plan's tool-call limit, so they were built from the frame metadata (positions/sizes) plus the
sibling frames that share their components (Sign-up ≙ Login, Capture Confirmation ≙ Image Capture).

## Tokens (`mobile/constants/theme.ts`)

| Token | Hex | Figma usage |
| --- | --- | --- |
| `green900` | `#335321` | "Detection Result", "Scan History", "Logout", "Detecting..." headings; sheet gradient end |
| `green800` | `#43662E` | Dark buttons (Login/OK/Save/Logout/View History), home banner, check mark |
| `green700` | `#4F7730` | Body text, "Curious about your coconut's health?", "Result Saved!" |
| `green600` | `#84B46E` | Light buttons (Cancel/Retry/Scan Again/Scan New), progress arc |
| `green500` | `#9CCB81` | Updates-row border and "Scan complete!" |
| `success` | `#34BA38` | Confidence score value |
| `danger` | `#FF4141` | "Disease Detected!", disease labels |
| Radii | 10 inputs · 11 buttons · 8 home cards · 20 history/updates cards · 30 sheets & modals | |
| Buttons | 126 × 42 pairs · 195 × 50 View History · 98 × 33 Scan New · 268 × 36–40 auth | |
| Shadows | `1 2 4 .16` cards · `0 4 4 .25` large cards · `0 2 7.5 .25` buttons · `0 12 10.7 .25` modals/sheets | |

**Fonts.** Headings, buttons and card titles use **Cal Sans** (`@expo-google-fonts/cal-sans`);
body copy uses Poppins Regular/Medium/SemiBold/Bold plus Italic (greeting name, card subtitles)
and Light Italic (result time). Figma body sizes of 6–8 px were raised to 7.5–10.5 px so text
stays legible on device; everything else is 1:1.

## Screen → frame → file

| Figma frame (node) | Route file | Notes |
| --- | --- | --- |
| Welcome (2:77) | `app/index.tsx` | Brand group at y≈581, 330 × 45 muted-green Get Started |
| Login (2:145) / Sign-up (2:347) | `app/(auth)/login.tsx`, `signup.tsx` | `AuthSheet`: gradient `rgba(135,139,57,.4)→#335321`, radius 30, 67 × 2 handle, 268-wide fields |
| Home (2:121) | `app/(app)/home.tsx` | Coconut cutout overlaps banner at (−14, −51); bell box 41 × 39 radius 12 |
| Read about Coconuts (18:484) | `app/(app)/diseases.tsx` | Hero 390 tall (85 % + 31 % black), panel from y=295 |
| Updates (18:534 / 18:588) | `components/UpdatesModal.tsx` | 329 × 410 panel, rows 267 × 100 with 3 px `#9CCB81` border |
| Log Out (18:598) | `components/LogoutModal.tsx` | 329 × 294 card, 79 px icon |
| Image Capture (9:12) | `app/(app)/scan/camera.tsx` | 268 × 256 corner guide, 83/65 shutter, 155 px gradient panel |
| Capture Confirmation (19:1913) | `app/(app)/scan/confirm.tsx` | Retry at x=35, OK at x=218 |
| Detecting Process (13:1683) | `app/(app)/scan/detecting.tsx` | 244 px ring; % label only while uploading |
| Results (13:1745) | `components/ResultPanel.tsx` + `scan/result.tsx` | Header 151 tall radius 30; sheet radius 30 with light-green gradient |
| Saved (13:1774) | `app/(app)/scan/saved.tsx` | 194 px ring stroke 15, check path from Figma SVG |
| History (16:1801) | `app/(app)/history/index.tsx` | 342 × 132 cards, 23 px gap |
| (detail) | `app/(app)/history/[id].tsx` | `ResultPanel` in saved mode |

## Deliberate deviations

- **Logout entry point.** The Figma shows the Logout modal over Home but no trigger; a second
  icon box (same style as the bell) was added so the modal is reachable.
- **Detection rectangles.** Not rendered (classifier has no spatial output). The photo is shown
  full-bleed behind the result sheet.
- **65 % in Detecting.** Shown only while a real upload is in progress (api-mode); otherwise an
  indeterminate ring.
- **Demo badge.** Added wherever a simulated result is displayed. Not in Figma, required for honesty.
- **Minimum text size** raised as described above.

## Assets

See `mobile/assets/images/README.md` for the layer → file mapping. Icons are PNGs from Figma;
the back button, chevron and check mark were re-drawn with `react-native-svg` from the exported
SVG paths so they stay crisp at any density. App icon and splash remain Expo defaults until the
CocoScan logo is exported.
