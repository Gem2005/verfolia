import { v4 as uuidv4 } from 'uuid';

class AnalyticsService {
  private sessionId: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.sessionId = localStorage.getItem('session_id') || this.generateSessionId();
    }
  }

  private generateSessionId(): string {
    const sessionId = uuidv4();
    if (typeof window !== 'undefined') {
      localStorage.setItem('session_id', sessionId);
    }
    return sessionId;
  }

  private getSessionId(): string {
    if (!this.sessionId) {
      this.sessionId = this.generateSessionId();
    }
    return this.sessionId;
  }

  async trackResumeView(resumeId: string): Promise<void> {
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

      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/track-analytics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
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
}

export const analyticsService = new AnalyticsService();
