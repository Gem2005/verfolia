import { resumeService } from "@/services/resume-service";
import React from "react";

interface SectionViewTrackerProps {
  resumeId: string;
  sectionName: string;
  children: React.ReactNode;
  className?: string;
}

export const SectionViewTracker: React.FC<SectionViewTrackerProps> = ({
  resumeId,
  sectionName,
  children,
  className,
}) => {
  // Use Intersection Observer to track when a section becomes visible
  const sectionRef = React.useRef<HTMLDivElement | null>(null);
  const [hasBeenViewed, setHasBeenViewed] = React.useState(false);

  React.useEffect(() => {
    if (!sectionRef.current || hasBeenViewed) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasBeenViewed) {
            // Section is now visible, track the interaction
            resumeService.trackResumeInteraction(
              resumeId,
              "section_view",
              "visible",
              sectionName
            );
            setHasBeenViewed(true);
            observer.disconnect(); // Only track once
          }
        });
      },
      { threshold: 0.5 } // At least 50% of the section must be visible
    );

    observer.observe(sectionRef.current);

    return () => {
      observer.disconnect();
    };
  }, [resumeId, sectionName, hasBeenViewed]);

  return (
    <div ref={sectionRef} className={className}>
      {children}
    </div>
  );
};
