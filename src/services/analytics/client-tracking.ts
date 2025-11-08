/**
 * Client-Side Analytics Tracking Service
 * Handles all communication with the Supabase Edge Function for analytics tracking
 */

import type { InteractionTypeValue } from '@/types/analytics';

const API_ROUTE = '/api/track-analytics';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export interface TrackViewParams {
  resumeId: string;
  sessionId: string;
  userAgent: string;
  referrer: string;
  viewDuration?: number;
}

export interface TrackInteractionParams {
  resumeId: string;
  sessionId: string;
  interactionType: InteractionTypeValue;
  targetValue?: string;
  sectionName?: string;
  userAgent: string;
}

/**
 * Track a resume view or update view duration
 * @param params View tracking parameters
 */
export async function trackView(params: TrackViewParams): Promise<void> {
  const payload = {
    event: 'view',
    resumeId: params.resumeId,
    sessionId: params.sessionId,
    userAgent: params.userAgent,
    referrer: params.referrer,
    ...(params.viewDuration !== undefined && { viewDuration: params.viewDuration })
  };

  await sendToEdgeFunction(payload, 'view');
}

/**
 * Track a user interaction (click, scroll, etc.)
 * @param params Interaction tracking parameters
 */
export async function trackInteraction(params: TrackInteractionParams): Promise<void> {
  const payload = {
    event: 'interaction',
    resumeId: params.resumeId,
    sessionId: params.sessionId,
    interactionType: params.interactionType,
    targetValue: params.targetValue,
    sectionName: params.sectionName,
    userAgent: params.userAgent
  };

  await sendToEdgeFunction(payload, 'interaction');
}

/**
 * Send data to edge function with retry logic
 * @param payload Data to send
 * @param eventType Type of event for logging
 * @param retryCount Current retry attempt
 */
async function sendToEdgeFunction(
  payload: Record<string, unknown>,
  eventType: string,
  retryCount = 0
): Promise<void> {
  try {
    const response = await fetch(API_ROUTE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Edge function returned ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    return result;
  } catch {
    // Silent retry logic
    if (retryCount < MAX_RETRIES) {
      const delay = RETRY_DELAY * Math.pow(2, retryCount); // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay));
      return sendToEdgeFunction(payload, eventType, retryCount + 1);
    }

    // Max retries reached - fail silently to avoid breaking UI
  }
}

/**
 * Batch multiple interactions to reduce network requests
 */
class InteractionQueue {
  private queue: TrackInteractionParams[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private readonly BATCH_SIZE = 10;
  private readonly FLUSH_INTERVAL = 2000; // 2 seconds

  add(params: TrackInteractionParams): void {
    this.queue.push(params);

    // Schedule flush
    if (!this.flushTimer) {
      this.flushTimer = setTimeout(() => this.flush(), this.FLUSH_INTERVAL);
    }

    // Immediate flush if queue is full
    if (this.queue.length >= this.BATCH_SIZE) {
      this.flush();
    }
  }

  private flush(): void {
    if (this.queue.length === 0) return;

    // Send all queued interactions
    const batch = [...this.queue];
    this.queue = [];

    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    // Send each interaction (could be optimized to batch in edge function)
    batch.forEach(params => trackInteraction(params));
  }

  // Force flush on page unload
  forceFlush(): void {
    this.flush();
  }
}

// Export singleton queue
export const interactionQueue = new InteractionQueue();

// Flush queue on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    interactionQueue.forceFlush();
  });
}
