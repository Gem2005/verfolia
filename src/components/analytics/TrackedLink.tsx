'use client';

import { type AnchorHTMLAttributes, type ReactNode } from 'react';
import { useResumeTracking } from './ResumeViewTracker';
import type { InteractionTypeValue } from '@/types/analytics';

interface TrackedLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: ReactNode;
  interactionType?: InteractionTypeValue;
  sectionName?: string;
}

/**
 * Tracked link component that automatically logs click analytics
 * Determines interaction type based on href (email, phone, or external link)
 * 
 * Usage:
 * ```tsx
 * <TrackedLink href="mailto:john@example.com" sectionName="contact">
 *   Email Me
 * </TrackedLink>
 * 
 * <TrackedLink href="https://github.com/user" sectionName="social">
 *   GitHub
 * </TrackedLink>
 * ```
 */
export function TrackedLink({
  href,
  children,
  interactionType,
  sectionName,
  onClick,
  ...props
}: TrackedLinkProps) {
  const { trackInteraction } = useResumeTracking();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Determine interaction type if not provided
    let type: InteractionTypeValue = interactionType || 'link_click';
    
    if (!interactionType) {
      if (href.startsWith('mailto:')) {
        type = 'email_click';
      } else if (href.startsWith('tel:')) {
        type = 'phone_click';
      } else if (href.includes('linkedin.com') || href.includes('github.com') || 
                 href.includes('twitter.com') || href.includes('facebook.com')) {
        type = 'social_link_click';
      }
    }

    // Track the interaction
    trackInteraction(type, href, sectionName);

    // Call original onClick if provided
    onClick?.(e);
  };

  return (
    <a href={href} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}
