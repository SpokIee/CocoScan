# CocoScan — AI-Powered Coconut Leaf Disease Detection

Smartphone screening tool for **Gray Leaf Spot** and **Leaf Rot** on coconut leaves,
built for the capstone manuscript *CocoScan: AI-Powered Image Recognition for Early
Detection of Coconut Leaf Diseases* (Espinosa, Dumdum, Lobaton — Mapúa Malayan Colleges Mindanao).

```
cocoscan/
  mobile/     React Native + Expo (TypeScript, Expo Router)   -> the app
  backend/    FastAPI + SQLAlchemy + PostgreSQL/SQLite       -> auth, scans, CNN inference
  docs/       Feature status, model hand-off, testing guide
```

## Quick start (demo mode, no backend needed)

```bash
cd mobile
npm install --legacy-peer-deps
npx expo start
```

Scan the QR code with **Expo Go** on your Android phone (same Wi-Fi), or press `a` for an
emulator. The app starts in **Demo Mode**: a pre-seeded account
(`demo@cocoscan.app` / `cocoscan123`) lets you run the whole flow —

Welcome → Login → Home → Scan Now → Capture/Gallery → Confirm → Detecting → Result → Save → Saved → History → Detail.

Demo predictions are **simulated** and every demo result is badged *Demo Mode*.
Saved scans and accounts persist on the device (AsyncStorage + SecureStore).

> `npm install` without `--legacy-peer-deps` can fail on an unrelated `react-dom` peer range
> pulled in by Expo's web tooling. The flag only affects dependency resolution.

## Running against the real backend

1. Start the API (see [backend/README.md](backend/README.md)):
   ```bash
   cd backend
   python -m venv .venv && .venv\Scripts\activate
   pip install -r requirements.txt
   copy .env.example .env
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
2. In `mobile/`, copy `.env.example` → `.env` and set
   ```
   EXPO_PUBLIC_DATA_MODE=api
   EXPO_PUBLIC_API_URL=http://<your-PC-LAN-IP>:8000
   ```
3. Restart `npx expo start` (env vars are read at bundle time).

Without trained weights the API answers every analysis with **`Model Not Configured`** — the
app shows that state honestly instead of inventing a diagnosis. Drop the trained model into
`backend/models_store/<architecture>/` to enable real predictions
(see [docs/MODEL_INTEGRATION.md](docs/MODEL_INTEGRATION.md)).

## Documentation

| Doc | What it covers |
| --- | --- |
| [docs/FEATURE_STATUS.md](docs/FEATURE_STATUS.md) | Which features are real, which are placeholders, and what unlocks each |
| [docs/MODEL_INTEGRATION.md](docs/MODEL_INTEGRATION.md) | Exact files/format needed to plug in MobileNetV3 / EfficientNetB0 / ResNet50 weights |
| [docs/TESTING.md](docs/TESTING.md) | Manual test script for all 13 screens + automated checks |
| [docs/DEFENSE_SETUP.md](docs/DEFENSE_SETUP.md) | Laptop-as-server checklist for the defense: install, weights, firewall, hotspot, APK, troubleshooting |
| [docs/DESIGN_NOTES.md](docs/DESIGN_NOTES.md) | Figma → code mapping, tokens, and missing design assets |
| [docs/SECURITY.md](docs/SECURITY.md) | Dependency audit results, Node version, secrets handling |
| [backend/README.md](backend/README.md) | API reference and database schema |

## Tech stack

- **Mobile:** Expo SDK 58, React Native 0.88, TypeScript, Expo Router, expo-camera,
  expo-image-picker, expo-secure-store, AsyncStorage, Reanimated 4, react-native-svg, Poppins.
- **Backend:** FastAPI, SQLAlchemy 2, PostgreSQL (SQLite fallback), bcrypt + JWT, Pillow/NumPy,
  optional TensorFlow / TFLite runtime for inference.
