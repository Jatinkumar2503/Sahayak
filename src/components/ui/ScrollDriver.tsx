'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useJourneyStore } from '@/store/journeyStore';
import { journeyPhysics } from '@/store/journeyPhysics';

export function ScrollDriver() {
  const scrollMode = useJourneyStore((s) => s.scrollMode);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scrollMode) return;

    let targetProgress = journeyPhysics.progress;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      // Delta step for smooth scrolling
      const step = e.deltaY * 0.0003;
      targetProgress = (targetProgress + step + 1) % 1;

      gsap.to(journeyPhysics, {
        progress: targetProgress,
        duration: 0.4,
        ease: 'power2.out',
      });
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, [scrollMode]);

  return null;
}
