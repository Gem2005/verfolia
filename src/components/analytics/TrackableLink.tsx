import { analyticsService } from "@/services/analytics-service";
import Link from "next/link";
import React from "react";

interface TrackableLinkProps {
  href: string;
  resumeId: string;
  interactionType?: string;
  sectionName?: string;
  className?: string;
  children: React.ReactNode;
  target?: string;
  rel?: string;
}

export const TrackableLink: React.FC<TrackableLinkProps> = ({
  href,
  resumeId,
  interactionType = "link_click",
  sectionName,
  children,
  className,
  target,
  rel,
}) => {
  const handleClick = () => {
    try {
      console.log("🔗 Tracking link click:", {
        resumeId,
        interactionType,
        targetValue: href,
        sectionName,
      });

      analyticsService
        .trackResumeInteraction(resumeId, interactionType, href, sectionName)
        .catch((err: Error) => {
          console.error("❌ Failed to track link interaction:", err);
        });
    } catch (err: unknown) {
      console.error(
        "❌ Error tracking interaction:",
        err instanceof Error ? err.message : err
      );
    }
  };

  return (
    <Link
      href={href}
      className={className}
      onClick={handleClick}
      target={target}
      rel={rel}
      data-analytics="trackable-link"
      data-resume-id={resumeId}
      data-interaction-type={interactionType}
      data-section-name={sectionName}
    >
      {children}
    </Link>
  );
};
