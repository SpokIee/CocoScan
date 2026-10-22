import { colors } from '@/constants/theme';
import type { PredictedClass } from '@/types';

export const CLASS_LABELS: Record<PredictedClass, string> = {
  healthy: 'Healthy Leaf Detected',
  gray_leaf_spot: 'Gray Leaf Spot Detected',
  leaf_rot: 'Leaf Rot Detected',
  uncertain: 'Uncertain Result',
  not_configured: 'Model Not Configured',
};

export const CLASS_SHORT: Record<PredictedClass, string> = {
  healthy: 'Healthy',
  gray_leaf_spot: 'Gray Leaf Spot',
  leaf_rot: 'Leaf Rot',
  uncertain: 'Uncertain',
  not_configured: 'Not configured',
};

/** Disease name as shown on the Figma result sheet ("Gray Leaf Spot Disease"). */
export const CLASS_DISEASE_NAME: Record<PredictedClass, string> = {
  healthy: 'Healthy Coconut Leaf',
  gray_leaf_spot: 'Gray Leaf Spot Disease',
  leaf_rot: 'Leaf Rot Disease',
  uncertain: 'Please capture a clearer image',
  not_configured: 'No prediction available',
};

export type ResultTone = 'success' | 'danger' | 'neutral';

export function toneFor(predicted: PredictedClass): ResultTone {
  if (predicted === 'healthy') return 'success';
  if (predicted === 'gray_leaf_spot' || predicted === 'leaf_rot') return 'danger';
  return 'neutral';
}

export function toneColor(tone: ResultTone): string {
  if (tone === 'success') return colors.success;
  if (tone === 'danger') return colors.danger;
  return colors.warning;
}

export function headlineFor(predicted: PredictedClass): string {
  if (predicted === 'healthy') return 'No Disease Detected';
  if (predicted === 'gray_leaf_spot' || predicted === 'leaf_rot') return 'Disease Detected!';
  if (predicted === 'uncertain') return 'Uncertain Result';
  return 'Model Not Configured';
}

export function formatConfidence(confidence: number | null): string {
  if (confidence == null) return '—';
  return `${(confidence * 100).toFixed(2)}%`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}
