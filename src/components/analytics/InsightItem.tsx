import React from "react";
import { LucideIcon } from "lucide-react";

interface InsightItemProps {
  icon: LucideIcon;
  title: string;
  description: string;
  variant?: "default" | "success" | "warning" | "info";
}

export function InsightItem({
  icon: Icon,
  title,
  description,
  variant = "default",
}: InsightItemProps) {
  const variantStyles = {
    default: "bg-card border-border",
    success: "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800",
    warning: "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800",
    info: "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800",
  };

  const iconStyles = {
    default: "text-muted-foreground",
    success: "text-green-600 dark:text-green-400",
    warning: "text-yellow-600 dark:text-yellow-400",
    info: "text-blue-600 dark:text-blue-400",
  };

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border ${variantStyles[variant]}`}
    >
      <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${iconStyles[variant]}`} />
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm mb-1">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
