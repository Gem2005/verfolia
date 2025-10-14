import { useEffect, useRef } from 'react';
import type { InteractionTypeValue } from '@/types/analytics';

/**
 * Hook to track when a section becomes visible in the viewport
 * Uses Intersection Observer to detect when 50% of section is visible
 */
export function useSectionVisibility(
  sectionId: string,
  sectionName: string,
  trackingFn: (type: InteractionTypeValue, value?: string, section?: string) => void
) {
  const ref = useRef<HTMLElement>(null);
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Track when 50% of section is visible (and only once)
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5 && !hasTrackedRef.current) {
            trackingFn('section_view' as InteractionTypeValue, sectionId, sectionName);
            hasTrackedRef.current = true;

            if (process.env.NODE_ENV === 'development') {
              console.log(`[SectionVisibility] ${sectionName} viewed`);
            }
          }
        });
      },
      {
        threshold: 0.5, // Trigger when 50% visible
        rootMargin: '0px' // No margin
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [sectionId, sectionName, trackingFn]);

  return ref;
}
