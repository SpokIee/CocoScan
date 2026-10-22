export type PredictedClass = 'healthy' | 'gray_leaf_spot' | 'leaf_rot' | 'uncertain' | 'not_configured';
export type ModelStatus = 'ok' | 'not_configured' | 'error';

export interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
}

export interface AuthSession {
  token: string;
  user: User;
}

export interface ScanResult {
  id: string;
  /** Local file URI (demo) or absolute http URL (api) usable by <Image>. */
  imageUri: string;
  predictedClass: PredictedClass;
  label: string;
  /** 0..1 or null when the model is not configured. */
  confidence: number | null;
  probabilities: Record<string, number> | null;
  modelName: string;
  modelVersion: string;
  modelStatus: ModelStatus;
  /** true only for Demo Mode results — never shown as a genuine diagnosis. */
  isSimulated: boolean;
  isSaved: boolean;
  createdAt: string;
  warnings: string[];
  message: string | null;
}

export interface ScanUpdate {
  id: string;
  resultId: string;
  status: 'scan_complete' | 'result_saved';
  title: string;
  predictedClass: PredictedClass;
  label: string;
  confidence: number | null;
  imageUri: string;
  isRead: boolean;
  createdAt: string;
}

export interface DiseaseInfo {
  key: PredictedClass | string;
  name: string;
  scientificName: string | null;
  description: string;
  symptoms: string[];
  management: string[];
}

export type AnalyzeProgress =
  | { phase: 'uploading'; fraction: number }
  | { phase: 'analyzing' };

export interface AuthService {
  register(email: string, password: string, name?: string): Promise<AuthSession>;
  login(email: string, password: string): Promise<AuthSession>;
  me(token: string): Promise<User>;
  logout(token: string): Promise<void>;
}

export interface ScanService {
  analyze(imageUri: string, onProgress?: (p: AnalyzeProgress) => void, signal?: AbortSignal): Promise<ScanResult>;
  save(resultId: string): Promise<ScanResult>;
  history(): Promise<ScanResult[]>;
  get(resultId: string): Promise<ScanResult | null>;
  updates(): Promise<ScanUpdate[]>;
  markUpdateRead(updateId: string): Promise<void>;
  diseases(): Promise<DiseaseInfo[]>;
}

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: 'network' | 'auth' | 'validation' | 'not_found' | 'server' | 'unknown' = 'unknown',
    public readonly status?: number,
  ) {
    super(message);
    this.name = 'AppError';
  }
}
