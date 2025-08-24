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
            console.log("👁️ Section became visible:", sectionName);

            resumeService
              .trackResumeInteraction(
                resumeId,
                "section_view",
                "visible",
                sectionName
              )
              .then(() => {
                console.log(
                  "✅ Section view tracked successfully:",
                  sectionName
                );
                setHasBeenViewed(true);
                observer.disconnect(); // Only track once
              })
              .catch((error) => {
                console.error("❌ Failed to track section view:", error);
              });
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
    <div
      ref={sectionRef}
      className={className}
      data-analytics="section-tracker"
      data-resume-id={resumeId}
      data-section-name={sectionName}
    >
      {children}
    </div>
  );
};
