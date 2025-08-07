import { resumeService } from "@/services/resume-service";
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
      resumeService.trackResumeInteraction(
        resumeId,
        interactionType,
        href,
        sectionName
      );
    } catch (error) {
      console.error("Error tracking interaction:", error);
    }
  };

  return (
    <Link
      href={href}
      className={className}
      onClick={handleClick}
      target={target}
      rel={rel}
    >
      {children}
    </Link>
  );
};
