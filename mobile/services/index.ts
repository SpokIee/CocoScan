/**
 * Service locator. Screens import `authService` / `scanService` from here and
 * never care whether Demo Mode or the real API is behind them.
 */
import { apiAuthService } from '@/services/api/authService';
import { apiScanService } from '@/services/api/scanService';
import { IS_DEMO } from '@/services/config';
import { demoAuthService } from '@/services/demo/authService';
import { demoScanService } from '@/services/demo/scanService';
import type { AuthService, ScanService } from '@/types';

export const authService: AuthService = IS_DEMO ? demoAuthService : apiAuthService;
export const scanService: ScanService = IS_DEMO ? demoScanService : apiScanService;

export { IS_DEMO, DATA_MODE, API_URL } from '@/services/config';
