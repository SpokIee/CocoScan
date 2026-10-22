/**
 * Holds in-flight scan state that is awkward to pass through route params:
 * the result of the most recent analysis and a counter that tells list screens
 * (History, Updates) to refetch after a save.
 */
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

import type { ScanResult } from '@/types';

interface ScanContextValue {
  currentResult: ScanResult | null;
  setCurrentResult(result: ScanResult | null): void;
  /** Increments whenever scans/updates change so dependent screens refetch. */
  version: number;
  bumpVersion(): void;
}

const ScanContext = createContext<ScanContextValue | null>(null);

export function ScanProvider({ children }: { children: React.ReactNode }) {
  const [currentResult, setCurrentResult] = useState<ScanResult | null>(null);
  const [version, setVersion] = useState(0);
  const bumpVersion = useCallback(() => setVersion((v) => v + 1), []);

  const value = useMemo(() => ({ currentResult, setCurrentResult, version, bumpVersion }), [currentResult, version, bumpVersion]);
  return <ScanContext.Provider value={value}>{children}</ScanContext.Provider>;
}

export function useScanContext(): ScanContextValue {
  const ctx = useContext(ScanContext);
  if (!ctx) throw new Error('useScanContext must be used inside <ScanProvider>');
  return ctx;
}
