import { resumeService } from "@/services/resume-service";
import React from "react";

interface SectionViewTrackerProps {
  resumeId: string;
  sectionName: string;
  children: React.ReactNode;
  className?: string;
  /**
   * Disable tracking for preview/creation contexts
   * Set to true when template is being used in create-resume page or preview mode
   */
  disableTracking?: boolean;
}

export const SectionViewTracker: React.FC<SectionViewTrackerProps> = ({
  resumeId,
  sectionName,
  children,
  className,
  disableTracking = false,
}) => {
  const sectionRef = React.useRef<HTMLDivElement | null>(null);
  const viewStartTimeRef = React.useRef<number | null>(null);
  const totalViewDurationRef = React.useRef<number>(0);
  const isVisibleRef = React.useRef<boolean>(false);

  // Track section view duration
  React.useEffect(() => {
    // Skip tracking if disabled (e.g., in creation/preview mode)
    if (disableTracking || !sectionRef.current) return;

    // Skip tracking if no valid resumeId (indicates preview/creation mode)
    if (!resumeId || resumeId === '') return;

    const element = sectionRef.current;

    // IntersectionObserver to track when section is visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Section became visible - start timing
            if (!isVisibleRef.current) {
              isVisibleRef.current = true;
              viewStartTimeRef.current = Date.now();
            }
          } else {
            // Section became hidden - calculate duration
            if (isVisibleRef.current && viewStartTimeRef.current !== null) {
              isVisibleRef.current = false;
              const duration = Math.floor((Date.now() - viewStartTimeRef.current) / 1000);
              totalViewDurationRef.current += duration;
              viewStartTimeRef.current = null;

              // Track section view duration if spent more than 1 second
              if (duration > 1) {
                resumeService
                  .trackResumeInteraction(
                    resumeId,
                    "section_view_duration",
                    `${duration}s`,
                    sectionName
                  )
                  .catch((error) => {
                    console.error("❌ Failed to track section duration:", error);
                  });
              }
            }
          }
        });
      },
      { threshold: 0.5 } // Track when 50% of section is visible
    );

    observer.observe(element);

    // Cleanup function to track final duration
    return () => {
      observer.disconnect();
      
      // If section was visible when component unmounts, track that duration
      if (isVisibleRef.current && viewStartTimeRef.current !== null) {
        const duration = Math.floor((Date.now() - viewStartTimeRef.current) / 1000);
        if (duration > 1) {
          resumeService
            .trackResumeInteraction(
              resumeId,
              "section_view_duration",
              `${duration}s`,
              sectionName
            )
            .catch((error) => {
              console.error("❌ Failed to track section duration:", error);
            });
        }
      }
    };
  }, [resumeId, sectionName, disableTracking]);

  // Track section clicks
  React.useEffect(() => {
    if (disableTracking || !sectionRef.current) return;
    if (!resumeId || resumeId === '') return;

    const handleClick = () => {
      // Track section click interaction
      resumeService
        .trackResumeInteraction(
          resumeId,
          "section_click",
          sectionName,
          sectionName
        )
        .catch((error) => {
          console.error("❌ Failed to track section click:", error);
        });
    };

    const element = sectionRef.current;
    element.addEventListener('click', handleClick);

    return () => {
      element.removeEventListener('click', handleClick);
    };
  }, [resumeId, sectionName, disableTracking]);

  return (
    <div
      ref={sectionRef}
      className={className}
      data-analytics="section-tracker"
      data-resume-id={resumeId}
      data-section-name={sectionName}
      data-tracking-disabled={disableTracking}
    >
      {children}
    </div>
  );
};
