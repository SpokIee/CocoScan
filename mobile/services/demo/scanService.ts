/**
 * DEMO MODE scanning.
 *
 * Predictions here are SIMULATED. They are derived deterministically from the
 * image file so the same photo always yields the same demo result, but they
 * are not produced by any CNN and must never be presented as a diagnosis.
 * Every result carries `isSimulated: true` and the UI labels it "Demo Mode".
 *
 * Images are copied into the app's document directory so saved scans survive
 * app restarts. Records are stored per user in AsyncStorage.
 */
import { Directory, File, Paths } from 'expo-file-system';

import { DISEASES } from '@/constants/diseases';
import { CONFIDENCE_THRESHOLD } from '@/services/config';
import { CLASS_LABELS } from '@/services/labels';
import { readJson, writeJson } from '@/services/storage';
import type { PredictedClass, ScanResult, ScanService, ScanUpdate } from '@/types';
import { AppError } from '@/types';

const SCANS_KEY = (userId: string) => `cocoscan.demo.scans.${userId}`;
const UPDATES_KEY = (userId: string) => `cocoscan.demo.updates.${userId}`;

let currentUserId: string | null = null;

export function setDemoUser(userId: string | null): void {
  currentUserId = userId;
}

function requireUser(): string {
  if (!currentUserId) throw new AppError('Not authenticated.', 'auth', 401);
  return currentUserId;
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function fnv1a(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Deterministic pseudo-prediction from the file name/size. Clearly simulated. */
function simulatePrediction(seedInput: string): { predicted: PredictedClass; confidence: number; probabilities: Record<string, number> } {
  const h = fnv1a(seedInput);
  const classes: PredictedClass[] = ['healthy', 'gray_leaf_spot', 'leaf_rot'];
  const top = classes[h % 3]!;
  // Spread confidence between 0.62 and 0.96 so "uncertain" also appears sometimes.
  const confidence = 0.62 + ((h >>> 8) % 3400) / 10_000;
  const rest = 1 - confidence;
  const split = ((h >>> 16) % 100) / 100;
  const probabilities: Record<string, number> = {};
  for (const c of classes) probabilities[c] = 0;
  probabilities[top] = confidence;
  const others = classes.filter((c) => c !== top);
  probabilities[others[0]!] = Number((rest * split).toFixed(4));
  probabilities[others[1]!] = Number((rest * (1 - split)).toFixed(4));
  const predicted: PredictedClass = confidence < CONFIDENCE_THRESHOLD ? 'uncertain' : top;
  return { predicted, confidence: Number(confidence.toFixed(4)), probabilities };
}

async function persistImage(sourceUri: string, userId: string): Promise<string> {
  try {
    const dir = new Directory(Paths.document, 'scans', userId);
    if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
    const ext = sourceUri.split('?')[0]!.split('.').pop()?.toLowerCase();
    const safeExt = ext && ext.length <= 4 ? ext : 'jpg';
    const dest = new File(dir, `${Date.now()}.${safeExt}`);
    new File(sourceUri).copy(dest);
    return dest.uri;
  } catch {
    // If copying fails (e.g. web), fall back to the original URI.
    return sourceUri;
  }
}

async function loadScans(userId: string): Promise<ScanResult[]> {
  return readJson<ScanResult[]>(SCANS_KEY(userId), []);
}

async function loadUpdates(userId: string): Promise<ScanUpdate[]> {
  return readJson<ScanUpdate[]>(UPDATES_KEY(userId), []);
}

export const demoScanService: ScanService = {
  async analyze(imageUri, onProgress, signal) {
    const userId = requireUser();
    onProgress?.({ phase: 'analyzing' });

    const storedUri = await persistImage(imageUri, userId);
    // Simulate inference latency so the Detecting screen is visible.
    for (let i = 0; i < 6; i++) {
      if (signal?.aborted) throw new AppError('Analysis cancelled.', 'unknown');
      await delay(300);
    }

    let size = 0;
    try {
      size = new File(storedUri).size ?? 0;
    } catch {
      size = 0;
    }
    const sim = simulatePrediction(`${storedUri}:${size}`);

    const result: ScanResult = {
      id: `demo-${Date.now()}`,
      imageUri: storedUri,
      predictedClass: sim.predicted,
      label: CLASS_LABELS[sim.predicted],
      confidence: sim.confidence,
      probabilities: sim.probabilities,
      modelName: 'demo-simulator',
      modelVersion: 'demo',
      modelStatus: 'ok',
      isSimulated: true,
      isSaved: false,
      createdAt: new Date().toISOString(),
      warnings: [],
      message:
        sim.predicted === 'uncertain'
          ? 'Simulated confidence is below the threshold. In a real scan you would be asked to capture a clearer image.'
          : null,
    };

    const scans = await loadScans(userId);
    scans.unshift(result);
    await writeJson(SCANS_KEY(userId), scans);

    const updates = await loadUpdates(userId);
    updates.unshift({
      id: `upd-${Date.now()}`,
      resultId: result.id,
      status: 'scan_complete',
      title: 'Scan complete!',
      predictedClass: result.predictedClass,
      label: result.label,
      confidence: result.confidence,
      imageUri: result.imageUri,
      isRead: false,
      createdAt: result.createdAt,
    });
    await writeJson(UPDATES_KEY(userId), updates);

    return result;
  },

  async save(resultId) {
    const userId = requireUser();
    await delay(300);
    const scans = await loadScans(userId);
    const idx = scans.findIndex((s) => s.id === resultId);
    if (idx < 0) throw new AppError('Scan not found.', 'not_found', 404);
    const existing = scans[idx]!;
    if (existing.isSaved) return existing; // idempotent
    const updated: ScanResult = { ...existing, isSaved: true };
    scans[idx] = updated;
    await writeJson(SCANS_KEY(userId), scans);

    const updates = await loadUpdates(userId);
    updates.unshift({
      id: `upd-${Date.now()}`,
      resultId: updated.id,
      status: 'result_saved',
      title: 'Result saved',
      predictedClass: updated.predictedClass,
      label: updated.label,
      confidence: updated.confidence,
      imageUri: updated.imageUri,
      isRead: false,
      createdAt: new Date().toISOString(),
    });
    await writeJson(UPDATES_KEY(userId), updates);
    return updated;
  },

  async history() {
    const userId = requireUser();
    const scans = await loadScans(userId);
    return scans.filter((s) => s.isSaved).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  },

  async get(resultId) {
    const userId = requireUser();
    const scans = await loadScans(userId);
    return scans.find((s) => s.id === resultId) ?? null;
  },

  async updates() {
    const userId = requireUser();
    const updates = await loadUpdates(userId);
    return updates.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  },

  async markUpdateRead(updateId) {
    const userId = requireUser();
    const updates = await loadUpdates(userId);
    const idx = updates.findIndex((u) => u.id === updateId);
    if (idx >= 0 && !updates[idx]!.isRead) {
      updates[idx] = { ...updates[idx]!, isRead: true };
      await writeJson(UPDATES_KEY(userId), updates);
    }
  },

  async diseases() {
    return DISEASES;
  },
};
