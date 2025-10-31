'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useResumeViewTracker } from '@/hooks/use-resume-view-tracker';
import type { InteractionTypeValue } from '@/types/analytics';

interface ResumeViewTrackerContextValue {
  sessionId: string;
  trackInteraction: (
    interactionType: InteractionTypeValue,
    targetValue?: string,
    sectionName?: string
  ) => void;
}

const ResumeViewTrackerContext = createContext<ResumeViewTrackerContextValue | null>(null);

export function useResumeTracking() {
  const context = useContext(ResumeViewTrackerContext);
  if (!context) {
    throw new Error('useResumeTracking must be used within ResumeViewTracker');
  }
  return context;
}

interface ResumeViewTrackerProps {
  resumeId: string;
  children: ReactNode;
}

/**
 * Wrapper component that enables analytics tracking for a resume
 * Automatically tracks initial view, duration, and provides interaction tracking to children
 * 
 * Usage:
 * ```tsx
 * <ResumeViewTracker resumeId={resume.id}>
 *   <YourResumeTemplate />
 * </ResumeViewTracker>
 * ```
 */
export function ResumeViewTracker({ resumeId, children }: ResumeViewTrackerProps) {
  const { sessionId, trackInteraction } = useResumeViewTracker(resumeId);

  return (
    <ResumeViewTrackerContext.Provider value={{ sessionId, trackInteraction }}>
      {children}
    </ResumeViewTrackerContext.Provider>
  );
}
