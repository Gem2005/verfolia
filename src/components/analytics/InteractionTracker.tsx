import React, { useCallback } from "react";
import { resumeService } from "@/services/resume-service";
import { useScrollTracking } from "@/hooks/use-scroll-tracking";

interface InteractionTrackerProps {
  resumeId: string;
  sectionName?: string;
  children: React.ReactNode;
  interactionTypes?: {
    click?: boolean;
    hover?: boolean;
    scroll?: boolean;
  };
  className?: string;
}

export const InteractionTracker: React.FC<InteractionTrackerProps> = ({
  resumeId,
  sectionName,
  children,
  interactionTypes = { click: true },
  className,
}) => {
  const { onScroll, hasTracked } = useScrollTracking({
    resumeId,
    sectionName,
    threshold: 80, // track when user has scrolled through 80% of content
  });

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!interactionTypes.click) return;

      const target = e.target as HTMLElement;
      const targetValue =
        target.textContent || target.getAttribute("data-value") || undefined;

      resumeService
        .trackResumeInteraction(resumeId, "click", targetValue, sectionName)
        .catch(console.error);
    },
    [resumeId, sectionName, interactionTypes.click]
  );

  const handleMouseEnter = useCallback(() => {
    if (!interactionTypes.hover) return;

    resumeService
      .trackResumeInteraction(resumeId, "hover", undefined, sectionName)
      .catch(console.error);
  }, [resumeId, sectionName, interactionTypes.hover]);

  return (
    <div
      className={className}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onScroll={onScroll}
      data-testid="interaction-tracker"
    >
      {children}
    </div>
  );
};
