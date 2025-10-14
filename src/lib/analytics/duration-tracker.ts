/**
 * Global duration tracker that persists across React re-renders
 * Uses a singleton pattern to maintain state outside of React lifecycle
 */

import { trackView } from '@/services/analytics/client-tracking';

interface TrackerState {
  resumeId: string;
  sessionId: string;
  startTime: number;
  accumulatedTime: number;
  isVisible: boolean;
  lastUpdate: number;
  intervalId: NodeJS.Timeout | null;
}

const trackers = new Map<string, TrackerState>();

/**
 * Start tracking duration for a resume view
 */
export function startDurationTracking(resumeId: string, sessionId: string): void {
  const key = `${resumeId}-${sessionId}`;
  
  // If already tracking this combination, don't create a new tracker
  if (trackers.has(key)) {
    console.log('⏱️ [DurationTracker] Already tracking this resume/session');
    return;
  }

  console.log('⏱️ [DurationTracker] Starting new tracker', { resumeId, sessionId: sessionId.substring(0, 8) + '...' });

  const state: TrackerState = {
    resumeId,
    sessionId,
    startTime: performance.now(),
    accumulatedTime: 0,
    isVisible: !document.hidden,
    lastUpdate: 0,
    intervalId: null,
  };

  // Visibility change handler
  const handleVisibilityChange = () => {
    const tracker = trackers.get(key);
    if (!tracker) return;

    if (document.hidden) {
      if (tracker.isVisible) {
        const elapsed = performance.now() - tracker.startTime;
        tracker.accumulatedTime += elapsed;
        tracker.isVisible = false;
        
        const totalSeconds = Math.floor(tracker.accumulatedTime / 1000);
        console.log(`⏱️ [DurationTracker] Tab hidden - paused at ${totalSeconds}s`);
      }
    } else {
      if (!tracker.isVisible) {
        tracker.startTime = performance.now();
        tracker.isVisible = true;
        
        const totalSeconds = Math.floor(tracker.accumulatedTime / 1000);
        console.log(`⏱️ [DurationTracker] Tab visible - resuming from ${totalSeconds}s`);
      }
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Set up interval
  console.log('⏱️ [DurationTracker] Creating 15-second interval...');
  state.intervalId = setInterval(() => {
    const tracker = trackers.get(key);
    if (!tracker) {
      console.log('⏱️ [DurationTracker] Tracker no longer exists, clearing interval');
      if (state.intervalId) clearInterval(state.intervalId);
      return;
    }

    console.log(`⏱️ [DurationTracker] ✨ INTERVAL FIRED!`);

    if (!tracker.isVisible) {
      console.log('⏱️ [DurationTracker] Tab hidden, skipping');
      return;
    }

    const currentElapsed = performance.now() - tracker.startTime;
    const totalDuration = tracker.accumulatedTime + currentElapsed;
    const durationSeconds = Math.floor(totalDuration / 1000);

    console.log(`⏱️ [DurationTracker] Duration: ${durationSeconds}s, Last: ${tracker.lastUpdate}s`);

    if (durationSeconds >= 10 && durationSeconds - tracker.lastUpdate >= 10) {
      console.log(`⏱️ [DurationTracker] Sending update: ${durationSeconds}s`);
      
      trackView({
        resumeId: tracker.resumeId,
        sessionId: tracker.sessionId,
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        viewDuration: durationSeconds
      }).catch(error => {
        console.error('⏱️ [DurationTracker] Update failed:', error);
      });

      tracker.lastUpdate = durationSeconds;
    } else {
      console.log(`⏱️ [DurationTracker] Not ready to send (need ≥10s total and ≥10s change)`);
    }
  }, 15000);

  console.log(`⏱️ [DurationTracker] ✅ Interval created! ID: ${state.intervalId}`);

  trackers.set(key, state);

  // Set up cleanup for actual page navigation (not React re-renders)
  const cleanupOnNavigation = () => {
    console.log('⏱️ [DurationTracker] Page unloading - cleaning up');
    stopDurationTracking(resumeId, sessionId);
  };

  window.addEventListener('beforeunload', cleanupOnNavigation);
  window.addEventListener('popstate', cleanupOnNavigation);
}

/**
 * Stop tracking and send final duration
 */
export function stopDurationTracking(resumeId: string, sessionId: string): void {
  const key = `${resumeId}-${sessionId}`;
  const tracker = trackers.get(key);
  
  if (!tracker) {
    console.log('⏱️ [DurationTracker] No tracker to stop');
    return;
  }

  console.log('⏱️ [DurationTracker] Stopping tracker');

  // Clear interval
  if (tracker.intervalId) {
    clearInterval(tracker.intervalId);
    console.log(`⏱️ [DurationTracker] Interval ${tracker.intervalId} cleared`);
  }

  // Remove visibility listener
  document.removeEventListener('visibilitychange', () => {});

  // Calculate and send final duration
  const finalElapsed = tracker.isVisible 
    ? performance.now() - tracker.startTime 
    : 0;
  const finalDuration = Math.floor((tracker.accumulatedTime + finalElapsed) / 1000);

  if (finalDuration > 0) {
    console.log(`⏱️ [DurationTracker] Sending final: ${finalDuration}s`);
    
    trackView({
      resumeId: tracker.resumeId,
      sessionId: tracker.sessionId,
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      viewDuration: finalDuration
    }).catch(error => {
      console.error('⏱️ [DurationTracker] Final update failed:', error);
    });
  }

  // Remove from map
  trackers.delete(key);
  console.log('⏱️ [DurationTracker] Tracker removed');
}

/**
 * Check if currently tracking
 */
export function isTracking(resumeId: string, sessionId: string): boolean {
  return trackers.has(`${resumeId}-${sessionId}`);
}
