'use client';

import { useState, useEffect } from 'react';
import { useJourneyStore } from '@/store/journeyStore';

/**
 * Hook to detect prefers-reduced-motion system setting
 * and sync with manual user accessibility toggle in JourneyStore
 */
export function useReducedMotion() {
  const manualReducedMotion = useJourneyStore((s) => s.reducedMotion);
  const setReducedMotion = useJourneyStore((s) => s.setReducedMotion);
  const [systemReducedMotion, setSystemReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setSystemReducedMotion(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setSystemReducedMotion(event.matches);
      if (event.matches) {
        setReducedMotion(true);
      }
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [setReducedMotion]);

  return manualReducedMotion || systemReducedMotion;
}
