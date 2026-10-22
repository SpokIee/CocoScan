/**
 * Reusable HTTP client for the CocoScan FastAPI backend.
 * All API calls go through here so auth headers, error mapping and
 * base URL handling live in one place.
 */
import { API_URL } from '@/services/config';
import { AppError } from '@/types';

let authToken: string | null = null;

export function setAuthToken(token: string | null): void {
  authToken = token;
}

export function getAuthToken(): string | null {
  return authToken;
}

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

function headers(extra?: Record<string, string>): Record<string, string> {
  const h: Record<string, string> = { Accept: 'application/json', ...extra };
  if (authToken) h.Authorization = `Bearer ${authToken}`;
  return h;
}

async function parseError(res: Response): Promise<AppError> {
  let detail = `Request failed (${res.status})`;
  try {
    const body = (await res.json()) as { detail?: unknown };
    if (typeof body.detail === 'string') detail = body.detail;
    else if (Array.isArray(body.detail) && body.detail[0]?.msg) detail = String(body.detail[0].msg);
  } catch {
    /* non-JSON body */
  }
  const code =
    res.status === 401 ? 'auth' : res.status === 404 ? 'not_found' : res.status === 422 || res.status === 409 ? 'validation' : 'server';
  return new AppError(detail, code, res.status);
}

export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(absoluteUrl(path), {
      ...init,
      headers: headers({ 'Content-Type': 'application/json', ...(init.headers as Record<string, string> | undefined) }),
    });
  } catch {
    throw new AppError('Cannot reach the CocoScan server. Check your connection and API URL.', 'network');
  }
  if (!res.ok) throw await parseError(res);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export interface UploadOptions {
  fieldName: string;
  uri: string;
  fileName?: string;
  mimeType?: string;
  onProgress?: (fraction: number) => void;
  signal?: AbortSignal;
}

/**
 * Multipart upload with real progress events (XMLHttpRequest exposes
 * upload.onprogress; fetch does not). Progress is the *upload* fraction only —
 * server-side inference time is indeterminate.
 */
export function upload<T>(path: string, opts: UploadOptions): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', absoluteUrl(path));
    for (const [k, v] of Object.entries(headers())) xhr.setRequestHeader(k, v);

    xhr.upload.onprogress = (ev) => {
      if (ev.lengthComputable && opts.onProgress) opts.onProgress(Math.min(1, ev.loaded / ev.total));
    };
    xhr.onerror = () => reject(new AppError('Cannot reach the CocoScan server. Check your connection and API URL.', 'network'));
    xhr.ontimeout = () => reject(new AppError('The server took too long to respond.', 'network'));
    xhr.onabort = () => reject(new AppError('Upload cancelled.', 'unknown'));
    xhr.onload = () => {
      const ok = xhr.status >= 200 && xhr.status < 300;
      let body: unknown = null;
      try {
        body = xhr.responseText ? JSON.parse(xhr.responseText) : null;
      } catch {
        body = null;
      }
      if (ok) {
        resolve(body as T);
        return;
      }
      const detail =
        body && typeof body === 'object' && 'detail' in body && typeof (body as { detail: unknown }).detail === 'string'
          ? (body as { detail: string }).detail
          : `Request failed (${xhr.status})`;
      const code = xhr.status === 401 ? 'auth' : xhr.status === 422 ? 'validation' : 'server';
      reject(new AppError(detail, code, xhr.status));
    };

    if (opts.signal) {
      opts.signal.addEventListener('abort', () => xhr.abort(), { once: true });
    }

    const form = new FormData();
    // React Native's FormData accepts {uri, name, type} objects for files.
    form.append(opts.fieldName, {
      uri: opts.uri,
      name: opts.fileName ?? 'leaf.jpg',
      type: opts.mimeType ?? 'image/jpeg',
    } as unknown as Blob);
    xhr.timeout = 60_000;
    xhr.send(form);
  });
}
