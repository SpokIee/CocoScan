# Feature status

Legend: ✅ real implementation · 🟡 placeholder / demo · ⛔ blocked on an external resource

## Screens (Figma)

| # | Screen | Status | Notes |
| --- | --- | --- | --- |
| 1 | Welcome | ✅ | Real Figma photo background, Cal Sans headings. |
| 2 | Login | ✅ | Validation, password toggle, error banner, keyboard-aware. "Forgot Password?" shows an explanatory alert (no reset flow exists in the manuscript). |
| 3 | Sign Up | ✅ | Email/password/confirm validation, duplicate-account error. |
| 4 | Home | ✅ | Greeting from logged-in user, bell opens Updates, logout icon opens Logout modal, banner + 3 cards + About card all navigate. |
| 5 | Disease Information | ✅ | Content from manuscript (gray leaf spot, leaf rot, healthy). Loads from API in api-mode, bundled text otherwise. |
| 6 | Updates modal | ✅ | Real records (scan complete / result saved), unread dot, empty state, tap opens the scan. |
| 7 | Logout modal | ✅ | Clears SecureStore token + cached user, returns to Login. |
| 8 | Image Capture | ✅ | Live preview, flip, gallery, framing overlay, permission denied / can't-ask-again / no-camera states. |
| 9 | Capture Confirmation | ✅ | Shows the actual photo; Retry → camera, OK → analysis. Nothing is analysed or stored before OK. |
| 10 | Detecting | ✅ | Indeterminate ring; real upload % only in api-mode while uploading. Cancel via back, duplicate-request guard, retry on failure. |
| 11 | Detection Result | ✅ UI / 🟡 data | Healthy / Gray Leaf Spot / Leaf Rot / Uncertain / Model-Not-Configured states. No fake bounding boxes — the original photo is shown. |
| 12 | Result Saved | ✅ | Save is idempotent (button locks, backend/demo ignore repeats). |
| 13 | Scan History + detail | ✅ | Per-user, most recent first, pull-to-refresh, empty state, detail view reuses the result layout. |

## Data & services

| Area | Demo mode (`EXPO_PUBLIC_DATA_MODE=demo`) | API mode (`=api`) |
| --- | --- | --- |
| Accounts | 🟡 Stored on device (AsyncStorage), pre-seeded demo user | ✅ FastAPI `/auth/*`, bcrypt hashes, JWT |
| Session token | ✅ expo-secure-store | ✅ expo-secure-store |
| Scan images | ✅ copied to app document directory | ✅ uploaded, stored under `backend/storage/uploads/<user>/` |
| Predictions | 🟡 **Simulated**, deterministic per image, badged "Demo Mode" | ⛔ Real CNN once weights are supplied; until then `Model Not Configured` |
| Scan history / updates | ✅ on-device per user | ✅ PostgreSQL / SQLite per user |
| Disease library | ✅ bundled | ✅ seeded table |

## What is needed to turn placeholders into real features

| Item | Needed from the team | Where it goes |
| --- | --- | --- |
| Trained CNN weights (MobileNetV3 / EfficientNetB0 / ResNet50) | Only the three `.keras` files from `ACTUAL MODEL.ipynb` (Drive `coconut_models/`). Class order and preprocessing are already encoded in the committed `model_config.json` files. | `backend/models_store/<arch>/<Name>.keras` — see MODEL_INTEGRATION.md |
| Python + TensorFlow on the dev PC | Python 3.11/3.12 install, then `pip install -r requirements.txt -r requirements-ml.txt` | `backend/.venv` (backend has only been syntax-checked so far, never run) |
| Leaf-presence validation | A separate leaf/not-leaf model or OOD detector (the 3-class CNN cannot do this) | `backend/app/ml/validation.py` |
| Disease localisation overlays | Only if Grad-CAM or a detector is added; otherwise not shown | `ResultPanel.tsx` + a new API field |
| Figma photography | ✅ Done — pulled from the Figma file on 2026-10-22 | `mobile/assets/images/`, `mobile/assets/icons/` |
| App icon / splash | Final CocoScan logo exports (not in the Figma frames) | `mobile/assets/` |
| PostgreSQL | Connection string | `backend/.env` `DATABASE_URL` (SQLite works out of the box) |

## Not implemented (out of scope of the 13 Figma screens)

Admin console, feedback on a diagnosis, farm profile/settings, "Continue as Guest" — these appear in the manuscript's use-case list but have no Figma frames and were intentionally not invented.
