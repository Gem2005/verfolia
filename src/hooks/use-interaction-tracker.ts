import { useCallback } from 'react';
import { trackInteraction } from '@/services/analytics/client-tracking';
import type { InteractionTypeValue } from '@/types/analytics';

/**
 * Hook to track user interactions with a resume
 * Provides a simple function to track any interaction type
 */
export function useInteractionTracker(resumeId: string, sessionId: string) {
  const track = useCallback(
    (
      interactionType: InteractionTypeValue,
      targetValue?: string,
      sectionName?: string
    ) => {
      console.log(`👆 [Interaction] Tracking: ${interactionType}${targetValue ? ` (${targetValue})` : ''}`);
      
      trackInteraction({
        resumeId,
        sessionId,
        interactionType,
        targetValue,
        sectionName,
        userAgent: navigator.userAgent
      });
    },
    [resumeId, sessionId]
  );

  return { trackInteraction: track };
}
