# Image assets

All photography and icons were exported from the CocoScan Figma file
(`db28yB0uReqfa2W18qae7J`) through the Figma MCP connector on 2026-10-22.
Large exports were downscaled with `node scripts/resize-png.js` (dependency-free).

## `assets/images/`

| File | Figma layer | Used on | Size |
| --- | --- | --- | --- |
| `welcome-bg.png` | `Front 1` (2:98) | Welcome, Login, Sign-up | 375×812 |
| `light-leaf-bg.png` | `oco (1) 1` | Home (67 %), Detecting / Saved / History (30 %) | 375×812 |
| `coconut-tree.png` | `Front 1` (18:485) | Disease Information hero | 375×812 |
| `about-bg.png` | `Rectangle 9` fill | Home "About CocoScan" card | 860×574 |
| `home-coconut.png` | `coconut 1` | Home banner cutout (transparent) | 600×600 (from 2000) |
| `camera-fallback.png` | `image 8` (sample leaf) | Camera screen when no camera device exists | 1024×745 |

## `assets/icons/`

| File | Figma layer | Used on |
| --- | --- | --- |
| `scan.png` / `read.png` / `history.png` | `cam 1/2/3` | Home navigation cards (39 px) |
| `bell.png` | `notif 1` | Home header (19 px) |
| `logout.png` | `logout 1` | Logout modal (79 px) + header entry point |
| `email.png` / `lock.png` | `Email 1`, `password 1` | Text fields (16 px) |
| `back-button.svg`, `check-icon.svg`, `chevron.svg`, `detecting-ring.svg`, `handle-line.svg` | vectors | Reference only — re-drawn with `react-native-svg` in `BackButton`, `saved.tsx`, `Chevron`, `LoadingRing` |

Icons were exported at 2000 px and reduced to 160 px (≈4× their rendered size).
The app icon / splash (`assets/icon.png`, `splash-icon.png`, `android-icon-*.png`) are
still the Expo template defaults — replace them with the CocoScan logo when available.
