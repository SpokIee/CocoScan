import { absoluteUrl, request, upload } from '@/services/api/client';
import { CLASS_LABELS } from '@/services/labels';
import type { DiseaseInfo, PredictedClass, ScanResult, ScanService, ScanUpdate } from '@/types';
import { AppError } from '@/types';

interface ApiScanResult {
  id: number;
  image_id: number;
  predicted_class: PredictedClass;
  label: string;
  confidence: number | null;
  probabilities: Record<string, number> | null;
  model_name: string;
  model_version: string;
  model_status: 'ok' | 'not_configured' | 'error';
  is_simulated: boolean;
  is_saved: boolean;
  created_at: string;
  image_url: string;
  warnings: string[];
  message: string | null;
}

interface ApiUpdate {
  id: number;
  result_id: number;
  status: 'scan_complete' | 'result_saved';
  title: string;
  predicted_class: PredictedClass;
  label: string;
  confidence: number | null;
  image_url: string;
  is_read: boolean;
  created_at: string;
}

interface ApiDisease {
  id: number;
  key: string;
  name: string;
  scientific_name: string | null;
  description: string;
  symptoms: string[];
  management: string[];
}

function mapResult(r: ApiScanResult): ScanResult {
  return {
    id: String(r.id),
    imageUri: absoluteUrl(r.image_url),
    predictedClass: r.predicted_class,
    label: r.label || CLASS_LABELS[r.predicted_class],
    confidence: r.confidence,
    probabilities: r.probabilities,
    modelName: r.model_name,
    modelVersion: r.model_version,
    modelStatus: r.model_status,
    isSimulated: r.is_simulated,
    isSaved: r.is_saved,
    createdAt: r.created_at,
    warnings: r.warnings ?? [],
    message: r.message,
  };
}

export const apiScanService: ScanService = {
  async analyze(imageUri, onProgress, signal) {
    onProgress?.({ phase: 'uploading', fraction: 0 });
    const res = await upload<ApiScanResult>('/scans/analyze', {
      fieldName: 'image',
      uri: imageUri,
      fileName: 'leaf.jpg',
      mimeType: 'image/jpeg',
      signal,
      onProgress: (fraction) => {
        if (fraction >= 1) onProgress?.({ phase: 'analyzing' });
        else onProgress?.({ phase: 'uploading', fraction });
      },
    });
    return mapResult(res);
  },

  async save(resultId) {
    const res = await request<ApiScanResult>('/scans/save', {
      method: 'POST',
      body: JSON.stringify({ result_id: Number(resultId) }),
    });
    return mapResult(res);
  },

  async history() {
    const rows = await request<ApiScanResult[]>('/scans/history');
    return rows.map(mapResult);
  },

  async get(resultId) {
    try {
      return mapResult(await request<ApiScanResult>(`/scans/${resultId}`));
    } catch (e) {
      if (e instanceof AppError && e.code === 'not_found') return null;
      throw e;
    }
  },

  async updates() {
    const rows = await request<ApiUpdate[]>('/updates');
    return rows.map(
      (u): ScanUpdate => ({
        id: String(u.id),
        resultId: String(u.result_id),
        status: u.status,
        title: u.title,
        predictedClass: u.predicted_class,
        label: u.label,
        confidence: u.confidence,
        imageUri: absoluteUrl(u.image_url),
        isRead: u.is_read,
        createdAt: u.created_at,
      }),
    );
  },

  async markUpdateRead(updateId) {
    await request<unknown>(`/updates/${updateId}/read`, { method: 'POST' });
  },

  async diseases() {
    const rows = await request<ApiDisease[]>('/diseases');
    return rows.map(
      (d): DiseaseInfo => ({
        key: d.key,
        name: d.name,
        scientificName: d.scientific_name,
        description: d.description,
        symptoms: d.symptoms,
        management: d.management,
      }),
    );
  },
};
