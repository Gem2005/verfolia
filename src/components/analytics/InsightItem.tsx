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
    default: "bg-white/60 dark:bg-gray-800/60 border-[#3498DB]/30 hover:border-[#3498DB]/60",
    success: "bg-green-50/80 dark:bg-green-950/40 border-green-500/40 hover:border-green-500/70",
    warning: "bg-yellow-50/80 dark:bg-yellow-950/40 border-yellow-500/40 hover:border-yellow-500/70",
    info: "bg-blue-50/80 dark:bg-blue-950/40 border-[#3498DB]/40 hover:border-[#3498DB]/70",
  };

  const iconBgStyles = {
    default: "from-[#2C3E50] to-[#3498DB] shadow-[#3498DB]/30",
    success: "from-green-600 to-green-500 shadow-green-500/30",
    warning: "from-yellow-600 to-yellow-500 shadow-yellow-500/30",
    info: "from-blue-600 to-blue-500 shadow-blue-500/30",
  };

  return (
    <div
      className={`flex items-start gap-4 p-5 rounded-xl border-2 ${variantStyles[variant]} backdrop-blur-sm transition-all duration-300 hover:shadow-lg group`}
    >
      <div className={`p-3 rounded-xl bg-gradient-to-br ${iconBgStyles[variant]} shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-base mb-1.5 text-[#2C3E50] dark:text-white">{title}</h4>
        <p className="text-sm text-[#34495E] dark:text-gray-400 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
