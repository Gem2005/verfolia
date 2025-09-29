import { v4 as uuidv4 } from 'uuid';
import { storageHelpers } from '@/utils/storage';

// Interface for creation analytics events
interface CreationEventData {
  step_number?: number;
  step_name?: string;
  time_spent_on_step?: number;
  template_id?: string;
  theme_id?: string;
  total_time_on_page?: number;
  is_first_time_visitor?: boolean;
  save_success?: boolean;
  save_error_message?: string;
}

class AnalyticsService {
  private sessionId: string | null = null;
  private creationSessionId: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.sessionId = storageHelpers.getSessionId() || this.generateSessionId();
      this.creationSessionId = storageHelpers.getCreationSessionId() || this.generateCreationSessionId();
    }
  }

  /**
   * Check if analytics tracking is allowed
   */
  private canTrack(): boolean {
    const consent = storageHelpers.getAnalyticsConsent();
    return consent === true; // Only track if explicitly consented
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
      this.sessionId = this.generateSessionId();
    }
    return this.sessionId;
  }

  private getCreationSessionId(): string {
    if (!this.creationSessionId) {
      this.creationSessionId = this.generateCreationSessionId();
    }
    return this.creationSessionId;
  }

  async trackResumeView(resumeId: string): Promise<void> {
    if (!this.canTrack()) {
      console.log('Analytics tracking skipped - no consent');
      return;
    }

    try {
      const sessionId = this.getSessionId();
      const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : '';
      const referrer = typeof document !== 'undefined' ? document.referrer : '';

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
          userAgent,
          referrer
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to track view: ${response.statusText}`);
      }

      console.log('✅ View tracked successfully:', { resumeId });
    } catch (error) {
      console.error('❌ Error tracking view:', error);
    }
  }

  async trackResumeInteraction(
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

      console.log('✅ Interaction tracked successfully:', {
        resumeId,
        interactionType,
        targetValue,
        sectionName
      });
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
    if (!this.canTrack()) {
      console.log('Creation analytics tracking skipped - no consent');
      return;
    }

    try {
      const sessionId = this.getCreationSessionId();
      const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : '';
      const referrer = typeof document !== 'undefined' ? document.referrer : '';

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
          total_time_on_page: eventData.total_time_on_page,
          is_first_time_visitor: eventData.is_first_time_visitor,
          save_success: eventData.save_success,
          save_error_message: eventData.save_error_message,
          user_agent: userAgent,
          referrer,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to track creation event: ${response.statusText}`);
      }

      console.log('✅ Creation event tracked successfully:', { eventType, eventData });
    } catch (error) {
      console.error('❌ Error tracking creation event:', error);
    }
  }

  // Specific creation tracking methods
  async trackCreationPageView(totalTimeOnPage: number, userId?: string): Promise<void> {
    // Check if this is first time for this specific user or session
    let isFirstTime = false;
    
    if (typeof window !== 'undefined') {
      if (userId) {
        // If user is logged in, check user-specific flag
        isFirstTime = !storageHelpers.hasUserVisited(userId);
        if (isFirstTime) {
          storageHelpers.markUserVisited(userId);
        }
      } else {
        // If not logged in, use session-specific flag
        const sessionId = this.getCreationSessionId();
        isFirstTime = !storageHelpers.hasSessionVisited(sessionId);
        if (isFirstTime) {
          storageHelpers.markSessionVisited(sessionId);
        }
      }
    }

    return this.trackCreationEvent('page_view', {
      total_time_on_page: totalTimeOnPage,
      is_first_time_visitor: isFirstTime,
    });
  }

  // Also add an initial page view method for when the page first loads
  async trackInitialPageView(userId?: string): Promise<void> {
    let isFirstTime = false;
    
    if (typeof window !== 'undefined') {
      if (userId) {
        // If user is logged in, check user-specific flag
        isFirstTime = !storageHelpers.hasUserVisited(userId);
        console.log(`🔍 Analytics: User ${userId} first time visit: ${isFirstTime}`);
        if (isFirstTime) {
          storageHelpers.markUserVisited(userId);
        }
      } else {
        // If not logged in, use session-specific flag
        const sessionId = this.getCreationSessionId();
        isFirstTime = !storageHelpers.hasSessionVisited(sessionId);
        console.log(`🔍 Analytics: Anonymous session first time visit: ${isFirstTime}`);
        if (isFirstTime) {
          storageHelpers.markSessionVisited(sessionId);
        }
      }
    }

    return this.trackCreationEvent('page_view', {
      total_time_on_page: 0, // Initial view, no time spent yet
      is_first_time_visitor: isFirstTime,
    });
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
      save_error_message: errorMessage || null,
    });
  }

  async trackSessionEnd(totalTimeOnPage: number): Promise<void> {
    return this.trackCreationEvent('session_end', {
      total_time_on_page: totalTimeOnPage,
    });
  }

  // Clear creation session (called after successful save)
  clearCreationSession(): void {
    if (typeof window !== 'undefined') {
      storageHelpers.clearCreationSession();
      this.creationSessionId = null;
    }
  }
}

export const analyticsService = new AnalyticsService();
