'use client';

import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { useResumeTracking } from './ResumeViewTracker';
import type { InteractionTypeValue } from '@/types/analytics';

interface TrackedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  interactionType: InteractionTypeValue;
  targetValue?: string;
  sectionName?: string;
}

/**
 * Tracked button component that automatically logs click analytics
 * Use for important resume actions like download, share, etc.
 * 
 * Usage:
 * ```tsx
 * <TrackedButton 
 *   interactionType="download" 
 *   targetValue="resume.pdf"
 *   sectionName="header"
 * >
 *   Download Resume
 * </TrackedButton>
 * ```
 */
export function TrackedButton({
  children,
  interactionType,
  targetValue,
  sectionName,
  onClick,
  ...props
}: TrackedButtonProps) {
  const { trackInteraction } = useResumeTracking();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Track the interaction
    trackInteraction(interactionType, targetValue, sectionName);

    // Call original onClick if provided
    onClick?.(e);
  };

  return (
    <button onClick={handleClick} {...props}>
      {children}
    </button>
  );
}
