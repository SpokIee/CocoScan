/**
 * Runtime configuration. Values come from EXPO_PUBLIC_* env vars (see .env.example).
 *
 * DATA_MODE
 *   "demo" -> DemoAuthService + DemoScanService (local storage, simulated predictions)
 *   "api"  -> ApiAuthService + ApiScanService (FastAPI backend)
 */
export type DataMode = 'demo' | 'api';

const rawMode = (process.env.EXPO_PUBLIC_DATA_MODE ?? 'demo').toLowerCase();

export const DATA_MODE: DataMode = rawMode === 'api' ? 'api' : 'demo';
export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000').replace(/\/+$/, '');
export const IS_DEMO = DATA_MODE === 'demo';

/** Predictions below this are shown as "Uncertain" (mirrors backend CONFIDENCE_THRESHOLD). */
export const CONFIDENCE_THRESHOLD = 0.7;

export const APP_NAME = 'CocoScan';
export const TAGLINE = 'Healthy Coconuts, Better Harvests';
