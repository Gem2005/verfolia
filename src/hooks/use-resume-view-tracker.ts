import { useEffect, useMemo } from 'react';
import { getOrCreateSessionId } from '@/lib/analytics/session-manager';
import { trackView } from '@/services/analytics/client-tracking';
import { useViewDuration } from './use-view-duration';
import { useInteractionTracker } from './use-interaction-tracker';
import { useSectionVisibility } from './use-section-visibility';

/**
 * Main hook that orchestrates all analytics tracking for a resume view
 * - Creates/retrieves session ID
 * - Tracks initial view
 * - Tracks duration updates
 * - Provides interaction tracking helpers
 */
export function useResumeViewTracker(resumeId: string) {
  // Get or create session ID (persists for 30 minutes)
  const sessionId = useMemo(() => getOrCreateSessionId(), []);

  // Track initial view on mount
  useEffect(() => {
    const initView = async () => {
      try {
        await trackView({
          resumeId,
          sessionId,
          userAgent: navigator.userAgent,
          referrer: document.referrer
          // No viewDuration - this is the initial view creation
        });
      } catch (error) {
        console.error('❌ [ResumeViewTracker] Failed to track initial view:', error);
      }
    };

    initView();
  }, [resumeId, sessionId]);

  // Track duration updates (every 15 seconds)
  useViewDuration(resumeId, sessionId);

  // Get interaction tracker
  const { trackInteraction } = useInteractionTracker(resumeId, sessionId);

  return {
    sessionId,
    trackInteraction,
    useSectionVisibility: (sectionId: string, sectionName: string) =>
      useSectionVisibility(sectionId, sectionName, trackInteraction)
  };
}
