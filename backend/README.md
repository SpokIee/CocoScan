# CocoScan API (FastAPI)

```
app/
  main.py            app factory, lifespan (create tables, seed diseases, load model)
  core/              settings (.env), password hashing, JWT
  database/          SQLAlchemy engine/session (PostgreSQL or SQLite fallback)
  models/            ORM: User, LeafImage, DiagnosisResult, DiseaseInfo, ScanUpdate
  schemas/           Pydantic request/response models
  services/          auth, scan workflow, file storage, disease seed
  ml/                labels, preprocessing, validation, model registry, predictor
  api/               routers: auth, scans, diseases, updates
```

## Run

```bash
python -m venv .venv
.venv\Scripts\activate            # Windows   (source .venv/bin/activate on macOS/Linux)
pip install -r requirements.txt
copy .env.example .env             # edit DATABASE_URL / SECRET_KEY
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- Leave `DATABASE_URL` empty to use `backend/cocoscan.db` (SQLite) — handy for demos.
- `--host 0.0.0.0` is required so the phone can reach the API over Wi-Fi.
- Swagger UI: <http://localhost:8000/docs>

## Endpoints

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/auth/register` | – | `{email, password, confirm_password, name?}` → token + user (409 if email exists) |
| POST | `/auth/login` | – | `{email, password}` → token + user (401 on bad credentials) |
| GET | `/auth/me` | Bearer | current user |
| POST | `/auth/logout` | Bearer | 204 (stateless JWT; client drops token) |
| POST | `/scans/analyze` | Bearer | multipart `image` → validates, stores, runs CNN, returns `ScanResultOut` (201) |
| POST | `/scans/save` | Bearer | `{result_id}` → marks saved (idempotent) |
| GET | `/scans/history` | Bearer | saved scans, newest first, current user only |
| GET | `/scans/{id}` | Bearer | one scan (404 if not owned) |
| GET | `/scans/{id}/image` | Bearer | the stored leaf image |
| GET | `/scans/model-status` | – | which model is active and whether weights loaded |
| GET | `/diseases`, `/diseases/{key}` | – | disease library |
| GET | `/updates` | Bearer | scan updates for the bell / modal |
| POST | `/updates/{id}/read` | Bearer | mark read |
| GET | `/health` | – | liveness + model status |

### `ScanResultOut`

```json
{
  "id": 12, "image_id": 12,
  "predicted_class": "gray_leaf_spot",      // healthy | gray_leaf_spot | leaf_rot | uncertain | not_configured
  "label": "Gray Leaf Spot Detected",
  "confidence": 0.8464, "probabilities": {"healthy": 0.09, "gray_leaf_spot": 0.8464, "leaf_rot": 0.0636},
  "model_name": "mobilenetv3", "model_version": "mnv3-large-v1.2",
  "model_status": "ok",                     // ok | not_configured | error
  "is_simulated": false, "is_saved": false,
  "created_at": "2026-09-21T04:12:00Z",
  "image_url": "/scans/12/image",
  "warnings": ["The photo looks very dark. Try better lighting."],
  "message": null
}
```

## Database schema

| Table | Columns |
| --- | --- |
| `users` | id, name, email (unique), password_hash (bcrypt), created_at |
| `leaf_images` | id, user_id → users, storage_path, content_type, captured_at |
| `diagnosis_results` | id, image_id → leaf_images, user_id → users, predicted_class, confidence, probabilities_json, model_name, model_version, is_simulated, is_saved, created_at |
| `disease_info` | id, key (unique), name, scientific_name, description, symptoms, management |
| `scan_updates` | id, user_id, result_id → diagnosis_results, status, title, is_read, created_at |

Tables are created with `Base.metadata.create_all` at startup (fine for the capstone; add Alembic
if the schema keeps evolving).

## Security notes

- Passwords are bcrypt-hashed via passlib; never stored or logged in plaintext.
- JWT (HS256) signed with `SECRET_KEY` from `.env`; tokens expire after `ACCESS_TOKEN_EXPIRE_MINUTES`.
- Every scan/update query filters by the authenticated `user_id`; other users' records return 404.
- Uploaded files are validated with Pillow and size-capped (`MAX_UPLOAD_MB`).
- Image paths are resolved inside `UPLOAD_DIR` only (no path traversal).
