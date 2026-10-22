# Testing guide

## Automated checks

```bash
cd mobile
npm run typecheck          # TypeScript, strict mode
npx expo export --platform android   # full Metro bundle; catches bad imports / native module issues
npx expo-doctor            # dependency / config sanity
```

```bash
cd backend
python -m compileall app   # syntax check
uvicorn app.main:app --reload
# open http://localhost:8000/docs and try /auth/register -> /auth/login -> /scans/analyze
```

## Manual script (Demo Mode, physical Android phone via Expo Go)

| Step | Screen | Expect |
| --- | --- | --- |
| 1 | Welcome | Photo background, title, tagline, **Get Started** → Login. |
| 2 | Login | Empty submit → field errors. Wrong password → red banner. Eye icon toggles password. Keyboard does not cover the button. |
| 3 | Sign Up | Mismatched passwords → error. Registering an existing email → "already exists". Success → Home. |
| 4 | Home | "Welcome back / <name>!". Bell opens Updates (empty state on first run). Logout icon → modal; Cancel closes, Logout → Login. Banner & Read → Diseases. Recently Scanned → History (empty state). |
| 5 | Diseases | Hero image, white rounded panel, scrollable text, back button works. |
| 6 | Scan Now | First time: OS camera prompt. Deny → in-app explanation with Allow / Settings / Gallery. Allow → live preview, framing corners, flip works, gallery opens picker. |
| 7 | Capture | Shutter → Confirm shows the real photo. **Retry** returns to camera. **OK** → Detecting. |
| 8 | Detecting | Spinning ring, "Analyzing Image / Please Wait...", Demo badge, tip at bottom. Back cancels. |
| 9 | Result | Headline colour matches class (green healthy / red disease / amber uncertain). Confidence %, date, time. Demo badge visible. Scan Again → camera. |
| 10 | Save | Tap Save twice quickly → only one record. → "Result Saved!" screen. View History → list; Home → home. |
| 11 | History | Newest first, thumbnail, label, confidence, date. Tap → detail with same layout, no Save button. Pull to refresh. Back to Home / Scan New work. |
| 12 | Updates | Bell shows red dot; list has "Scan complete!" and "Result saved" rows; tap opens the scan; dot clears. |
| 13 | Persistence | Kill the app, reopen → still logged in, history intact. Log out → Login; log in again → same history. |
| 14 | Android back | Back on Detecting cancels; on Saved goes Home; on Camera closes scanner. |

## API mode checks

1. Set `EXPO_PUBLIC_DATA_MODE=api`, `EXPO_PUBLIC_API_URL=http://<LAN-IP>:8000`, restart Expo.
2. Register → `users` table row with bcrypt hash (no plaintext).
3. Scan → Detecting shows upload %, then "Analyzing". Without weights the Result screen shows **Model Not Configured** and Save is disabled.
4. Add weights (MODEL_INTEGRATION.md) → real class + confidence; `probabilities` bars match the API JSON.
5. Second user cannot `GET /scans/{id}` of the first (404).

## Known limitations of this environment

- The development PC used to build this repo has no regular Python install (only an MSYS2
  interpreter without pip), so the backend passed `python -m compileall app` (syntax) but was
  **not executed here**. Install Python 3.11+ from python.org, then run the `/docs` smoke test
  above before the defence.
- `npx expo export --platform android` and `npm run typecheck` both passed on 2026-10-22.
- Camera capture requires a physical device or emulator with camera support; on web the app
  shows the "Camera unavailable" state with gallery upload.
