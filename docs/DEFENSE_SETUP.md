# Defense-day setup: laptop as the server

Goal: the CocoScan app on a phone talks to the backend (API + CNN) running on a laptop, with
**no dependence on the venue's Wi-Fi**. The phone's hotspot is the network.

Everything below was verified on 2026-10-28 on a Windows 11 PC with a Galaxy A55.
Budget: ~30 min for first-time setup, ~5 min on the day.

---

## Part A — One-time laptop setup (do this days before)

### A1. Install the tools
1. **Git** — https://git-scm.com/download/win (defaults are fine).
2. **Python 3.12** — https://www.python.org/downloads/ → 3.12.x → tick **"Add python.exe to PATH"**.
   Do not use 3.13+; TensorFlow has no Windows wheel for it yet.
3. **Node.js LTS** — only needed if you want Expo Go / Metro as a fallback. The APK does not need it.

### A2. Get the code
```
cd %USERPROFILE%\Documents
git clone https://github.com/SpokIee/CocoScan.git
cd CocoScan\backend
```

### A3. Python environment
```
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt -r requirements-ml.txt
```
(TensorFlow is ~400 MB; do this on good internet.)

### A4. Model weights (NOT in GitHub)
Download from Google Drive → `My Drive / coconut_models /` and place:
```
backend\models_store\mobilenetv3\MobileNetV3.keras
backend\models_store\efficientnetb0\EfficientNetB0.keras
backend\models_store\resnet50\ResNet50.keras
```
The `model_config.json` next to each is already in the repo. Only MobileNetV3 is required
for the demo; the other two are for the comparison slide (switch with `ACTIVE_MODEL`).

### A5. Backend config
```
copy .env.example .env
```
Edit `.env`:
- `DATABASE_URL=` (leave **empty** → SQLite, nothing to install)
- `SECRET_KEY=` any long random string (e.g. 40+ random characters)
- `ACTIVE_MODEL=mobilenetv3`

### A6. Firewall (once, needs admin)
Double-click **`backend\scripts\Open-Port-8000.bat`** → click **Yes** on the UAC prompt.
It removes Windows' broad "python.exe" rules and adds one narrow rule: TCP 8000, local subnet,
Private networks only. The window prints the rule; press Enter to close.

### A7. First start and self-check
```
.venv\Scripts\python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```
Open http://localhost:8000/scans/model-status in a browser. You must see
`"status": "ok"` and `"model_version": "MobileNetV3Large-colab-v1"`. Stop with Ctrl-C.

---

## Part B — Build the APK for the laptop (once per laptop/network)

The APK has the server address baked in at build time, so it must be built for the address
the laptop will have **on the hotspot**.

### B1. Find the laptop's hotspot address
1. On the phone: Settings → Connections → Mobile Hotspot and Tethering → turn **Mobile Hotspot** on.
2. Connect the laptop to that hotspot. When Windows asks, choose **Private** network
   (or later: Settings → Network & Internet → Wi-Fi → the hotspot name → Network profile → Private).
3. On the laptop: `ipconfig` → the hotspot adapter's **IPv4 Address**, typically `192.168.x.y`.
   Samsung hotspots usually give `192.168.199.x` or `192.168.43.x`.

Hotspot addresses are usually stable for the same laptop, but confirm it on the day (B3).

### B2. Build
In `mobile/eas.json`, set the `lan-apk` profile's `EXPO_PUBLIC_API_URL` to
`http://<laptop hotspot IP>:8000`, then (needs Node + an Expo login, see TESTING.md):
```
cd mobile
npx eas-cli build -p android --profile lan-apk --non-interactive
```
~15 min. Install the resulting APK on every demo phone. On Samsung, turn **Auto Blocker** off
first (Settings → Security and privacy → Auto Blocker), then back on after installing.

Keep the **demo-apk** build on a phone too: it runs the whole UI with clearly-labelled simulated
predictions and needs no laptop at all — the fallback if hardware fails on the day.

### B3. Verify the pairing
With the laptop on the hotspot and the API running, open `http://<laptop IP>:8000/health`
in the phone's browser. JSON appears → the phone can reach the server. Only then test the app.

---

## Part C — On the day (5 minutes)

1. Phone: hotspot **on**. Laptop: connect to it. Check `ipconfig` shows the expected address.
2. Laptop, in `CocoScan\backend`:
   ```
   .venv\Scripts\activate
   .venv\Scripts\python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```
   Wait for `Application startup complete` (model load takes ~5 s).
3. Phone browser: `http://<laptop IP>:8000/health` → JSON. If not, see Troubleshooting.
4. App: Sign Up (the database starts empty unless you keep `backend\cocoscan.db` from rehearsal),
   then scan.
5. Optional for the panel: open `http://localhost:8000/docs` on the laptop to show the live API,
   and DB Browser for SQLite on `backend\cocoscan.db` to show rows appearing.

Rehearse the full sequence at least once at home with the hotspot, not the home Wi-Fi.

---

## What to scan

The CNN was trained on photos where the leaflet fills the frame. **Do not photograph a laptop
screen** showing a dataset image — the dark surroundings dominate and it reads as "healthy".
Use either:
- a real leaf (fresh samples of each class, if you can get them), filling the framing guide; or
- dataset JPGs copied to the phone, chosen with the **gallery** button. This reproduces the
  notebook's test-set conditions exactly and is the honest accuracy demo.

Confidence below 0.70 is reported as **Uncertain** by design (manuscript alternate flow).

---

## Troubleshooting (all seen on 2026-10-28)

| Symptom | Cause | Fix |
| --- | --- | --- |
| App: "Cannot reach the CocoScan server" | Phone can't reach port 8000 | Phone browser `http://<IP>:8000/health`. No JSON → wrong IP in the APK, laptop not on the hotspot, network profile not Private, or firewall step A6 not run as admin. |
| Login spins forever / same message on login | Same as above | Same as above. |
| Login says wrong email/password | No account yet — DB starts empty | Use **Sign Up**. |
| "App not installed" on Samsung | Auto Blocker | Settings → Security and privacy → Auto Blocker → off, install, on. |
| Everything says "Healthy" | Photographing a screen / leaf is small in frame | See *What to scan*. |
| `/scans/model-status` says `not_configured` | Weights missing or wrong folder | Check A4 paths; the `detail` field names the folder it looked in. |
| Model load error mentioning Keras version | TensorFlow older than the Colab's | `pip install "tensorflow>=2.19"` (weights were saved with Keras 3.13). |
| Laptop IP changed | Hotspot handed out a different address | Rebuild (B2), or for a quick save run Expo Go via Metro with `mobile/.env` pointing at the new IP (see TESTING.md). |

## Where the data lives
- Accounts, scans, results: `backend\cocoscan.db` (SQLite). Delete it to start fresh.
- Uploaded photos: `backend\storage\uploads\<user id>\`.
- Neither is committed to GitHub.
