# Design notes — Figma → code

The Figma file itself was not reachable from this environment (no Figma connector was
available in the session), so the implementation was built from the three exported frame
sheets (Welcome/Login/Sign-up · Home/Read/Updates/Logout · Capture→History). Measurements
were estimated from those sheets at ~1:1 phone scale.

## Tokens (`mobile/constants/theme.ts`)

| Token | Value | Figma usage |
| --- | --- | --- |
| `green800` | `#2E5B2A` | banner, About card tint, Logout button |
| `green700` | `#3C6B34` | Get Started / Login / Sign Up / Scan New |
| `green600` | `#4E8A3F` | "Curious about your coconut's health?", section headings |
| `green500` | `#5BA23B` | confidence %, saved checkmark ring |
| `green400` | `#79B65C` | Cancel / Retry / Scan Again |
| `danger` | `#E0462F` | "Disease Detected!", disease labels |
| `warning` | `#D98E04` | Uncertain state, Demo badge |
| Radii | 12 (buttons/inputs), 16 (cards), 28 (sheets/modals) | |
| Font | Poppins 400/500/600/700 (Google Fonts) | closest match to the frames |

## Screen → file map

| Figma frame | Route file | Shared components |
| --- | --- | --- |
| Welcome | `app/index.tsx` | AuthBackground, Brand, PrimaryButton |
| Login / Sign-up | `app/(auth)/login.tsx`, `signup.tsx` | AuthBackground, AuthSheet, TextField |
| Home | `app/(app)/home.tsx` | Card, UpdatesModal, LogoutModal, DemoBadge |
| Read about Coconuts | `app/(app)/diseases.tsx` | BackButton |
| Image Capture | `app/(app)/scan/camera.tsx` | BackButton, PrimaryButton |
| Capture Confirmation | `app/(app)/scan/confirm.tsx` | PrimaryButton |
| Detecting Process | `app/(app)/scan/detecting.tsx` | LoadingRing, LightBackground |
| Results | `app/(app)/scan/result.tsx` | **ResultPanel** |
| Saved | `app/(app)/scan/saved.tsx` | LightBackground |
| History | `app/(app)/history/index.tsx` | ScanHistoryCard, ScreenHeader, EmptyState |
| (detail) | `app/(app)/history/[id].tsx` | ResultPanel (saved mode) |

## Deliberate deviations

- **Logout entry point.** The Figma shows the Logout modal over Home but no trigger; a small
  logout icon was added beside the bell so the modal is reachable.
- **Detection rectangles.** Not rendered (classifier has no spatial output). The photo is shown
  full-bleed behind the result sheet.
- **65 % in Detecting.** Shown only while a real upload is in progress (api-mode); otherwise an
  indeterminate ring, per the brief.
- **Demo badge.** Added wherever a simulated result is displayed. Not in Figma, required for
  honesty.

## Missing assets (replace in `mobile/assets/images/`)

See `mobile/assets/images/README.md`. Also replace `assets/icon.png`, `splash-icon.png`,
`android-icon-*.png` with the CocoScan logo exports.
