import { v4 as uuidv4 } from 'uuid';
import { storageHelpers } from '@/utils/storage';
import { trackView, trackInteraction } from './analytics/client-tracking';
import { getOrCreateSessionId } from '@/lib/analytics/session-manager';
import type { InteractionTypeValue } from '@/types/analytics';

// Interface for creation analytics events
interface CreationEventData {
  step_number?: number;
  step_name?: string;
  time_spent_on_step?: number;
  template_id?: string;
  theme_id?: string;
  save_success?: boolean;
  save_error_message?: string;
}

class AnalyticsService {
  private sessionId: string | null = null;
  private creationSessionId: string | null = null;
  private sessionInitialized: boolean = false;
  private sessionInitializing: boolean = false; // Prevent race conditions
  private currentUserId: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.sessionId = storageHelpers.getSessionId() || this.generateSessionId();
      this.creationSessionId = storageHelpers.getCreationSessionId() || this.generateCreationSessionId();
    }
  }

  private generateSessionId(): string {
    const sessionId = uuidv4();
    if (typeof window !== 'undefined') {
      storageHelpers.setSessionId(sessionId);
    }
    return sessionId;
  }

  private generateCreationSessionId(): string {
    const sessionId = `creation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    if (typeof window !== 'undefined') {
      storageHelpers.setCreationSessionId(sessionId);
    }
    return sessionId;
  }

  private getSessionId(): string {
    if (!this.sessionId) {
      // Use new session manager for consistency
      this.sessionId = getOrCreateSessionId();
    }
    return this.sessionId;
  }

  private getCreationSessionId(): string {
    if (!this.creationSessionId) {
      this.creationSessionId = this.generateCreationSessionId();
    }
    return this.creationSessionId;
  }

  /**
   * Track a resume view using the new client-tracking service
   */
  async trackResumeView(resumeId: string): Promise<void> {
    try {
      const sessionId = this.getSessionId();
      const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : '';
      const referrer = typeof document !== 'undefined' ? document.referrer : '';

      // Use new client-tracking service
      await trackView({
        resumeId,
        sessionId,
        userAgent,
        referrer
      });
    } catch (error) {
      console.error('❌ Error tracking view:', error);
    }
  }

  /**
   * Track a resume interaction using the new client-tracking service
   */
  async trackResumeInteraction(
    resumeId: string,
    interactionType: InteractionTypeValue,
    targetValue?: string,
    sectionName?: string
  ): Promise<void> {
    try {
      const sessionId = this.getSessionId();
      const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : '';

      // Use new client-tracking service
      await trackInteraction({
        resumeId,
        sessionId,
        interactionType,
        targetValue,
        sectionName,
        userAgent
      });
    } catch (error) {
      console.error('❌ Error tracking interaction:', error);
    }
  }

  /**
   * @deprecated Legacy method - use trackResumeInteraction directly
   */
  async trackResumeInteractionLegacy(
    resumeId: string,
    interactionType: string,
    targetValue?: string,
    sectionName?: string
  ): Promise<void> {
    try {
      const sessionId = this.getSessionId();
      const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : '';
      const referrer = typeof document !== 'undefined' ? document.referrer : '';

      // Use internal API route which forwards to Supabase when configured
      const response = await fetch(`/api/track-analytics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeId,
          sessionId,
          event: 'interaction',
          interactionType,
          targetValue,
          sectionName,
          userAgent,
          referrer
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to track interaction: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Error tracking interaction:', error);
    }
  }

  async updateViewDuration(resumeId: string, duration: number): Promise<void> {
    try {
      const sessionId = this.getSessionId();
      const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : '';

      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/track-analytics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          resumeId,
          sessionId,
          event: 'view',
          viewDuration: duration,
          userAgent
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update view duration: ${response.statusText}`);
      }

      console.log('✅ View duration updated successfully:', { resumeId, duration });
    } catch (error) {
      console.error('❌ Error updating view duration:', error);
    }
  }

  // Creation Analytics Methods
  async trackCreationEvent(eventType: string, eventData: CreationEventData = {}): Promise<void> {
    try {
      // Ensure session exists before tracking any event
      if (!this.sessionInitialized && !this.sessionInitializing) {
        console.warn('⚠️ Session not initialized, skipping event:', eventType);
        return;
      }

      // Wait for session initialization if in progress
      let waitCount = 0;
      while (this.sessionInitializing && waitCount < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        waitCount++;
      }

      if (!this.sessionInitialized) {
        console.error('❌ Session failed to initialize, cannot track event:', eventType);
        return;
      }

      const sessionId = this.getCreationSessionId();
      
      const response = await fetch('/api/analytics/creation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          event_type: eventType,
          step_number: eventData.step_number,
          step_name: eventData.step_name,
          time_spent_on_step: eventData.time_spent_on_step,
          template_id: eventData.template_id,
          theme_id: eventData.theme_id,
          save_success: eventData.save_success,
          save_error_message: eventData.save_error_message,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to track creation event: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Error tracking creation event:', error);
    }
  }

  // Specific creation tracking methods
  async trackCreationPageView(userId?: string): Promise<void> {
    await this.ensureSession(userId);
    return this.trackCreationEvent('page_view', {});
  }

  // Initialize session on first page view
  async trackInitialPageView(userId?: string): Promise<void> {
    const userChanged = this.currentUserId !== (userId || null);
    if (userChanged) {
      this.sessionInitialized = false;
      this.currentUserId = userId || null;
    }
    
    await this.ensureSession(userId);
    return this.trackCreationEvent('page_view', {});
  }

  // Ensure session record exists in database
  private async ensureSession(userId?: string): Promise<void> {
    // If already initialized or currently initializing, skip
    if (this.sessionInitialized) return;
    if (this.sessionInitializing) {
      // Wait for ongoing initialization
      await new Promise(resolve => setTimeout(resolve, 100));
      return this.ensureSession(userId); // Retry
    }

    this.sessionInitializing = true;

    try {
      const sessionId = this.getCreationSessionId();
      const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : '';
      const referrer = typeof document !== 'undefined' ? document.referrer : '';
      
      let isFirstTime = false;
      if (typeof window !== 'undefined') {
        if (userId) {
          isFirstTime = !storageHelpers.hasUserVisited(userId);
          if (isFirstTime) {
            storageHelpers.markUserVisited(userId);
          }
        } else {
          isFirstTime = !storageHelpers.hasSessionVisited(sessionId);
          if (isFirstTime) {
            storageHelpers.markSessionVisited(sessionId);
          }
        }
      }

      const response = await fetch('/api/analytics/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          user_id: userId || null,
          is_first_time_visitor: isFirstTime,
          user_agent: userAgent,
          referrer,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        // If session already exists (duplicate key error), that's OK
        if (error.details && error.details.includes('duplicate key')) {
          this.sessionInitialized = true;
        } else {
          throw new Error(`Failed to initialize session: ${response.statusText}`);
        }
      } else {
        this.sessionInitialized = true;
      }
    } catch (error) {
      console.error('❌ Error initializing session:', error);
    } finally {
      this.sessionInitializing = false;
    }
  }

  // Remove the helper method as we're passing userId directly
  async trackStepChange(stepNumber: number, stepName: string): Promise<void> {
    return this.trackCreationEvent('step_change', {
      step_number: stepNumber,
      step_name: stepName,
    });
  }

  async trackStepDuration(stepNumber: number, stepName: string, timeSpent: number): Promise<void> {
    return this.trackCreationEvent('step_duration', {
      step_number: stepNumber,
      step_name: stepName,
      time_spent_on_step: timeSpent,
    });
  }

  async trackTemplateSelection(templateId: string, currentStep: number): Promise<void> {
    return this.trackCreationEvent('template_selection', {
      template_id: templateId,
      step_number: currentStep,
    });
  }

  async trackThemeSelection(themeId: string, currentStep: number): Promise<void> {
    return this.trackCreationEvent('theme_selection', {
      theme_id: themeId,
      step_number: currentStep,
    });
  }

  async trackSaveAttempt(success: boolean, errorMessage?: string): Promise<void> {
    return this.trackCreationEvent('save_attempt', {
      save_success: success,
      save_error_message: errorMessage || undefined,
    });
  }

  async trackSessionEnd(): Promise<void> {
    return this.trackCreationEvent('session_end', {});
  }

  // Clear creation session (called after successful save)
  async clearCreationSession(): Promise<void> {
    if (typeof window !== 'undefined') {
      const sessionId = this.creationSessionId;
      
      // Mark session as completed
      if (sessionId && this.sessionInitialized) {
        try {
          await fetch('/api/analytics/session/complete', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              session_id: sessionId,
            }),
          });
        } catch (error) {
          console.error('❌ Error marking session complete:', error);
        }
      }
      
      storageHelpers.clearCreationSession();
      this.creationSessionId = null;
      this.sessionInitialized = false;
      this.sessionInitializing = false;
      this.currentUserId = null;
    }
  }
}

export const analyticsService = new AnalyticsService();
