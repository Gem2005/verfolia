import React from "react";
import { InsightItem } from "./InsightItem";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Activity,
  Award,
  Calendar,
} from "lucide-react";
import type { AnalyticsCalculations } from "@/hooks/use-analytics-calculations";

interface AnalyticsInsightsSectionProps {
  calculations: AnalyticsCalculations;
}

export function AnalyticsInsightsSection({
  calculations,
}: AnalyticsInsightsSectionProps) {
  const insights = [];

  // Growth insights
  if (calculations.viewsGrowthRate > 20) {
    insights.push({
      icon: TrendingUp,
      title: "Strong Growth",
      description: `Your views increased by ${calculations.viewsGrowthRate}% in the recent period. Keep up the good work!`,
      variant: "success" as const,
    });
  } else if (calculations.viewsGrowthRate < -20) {
    insights.push({
      icon: TrendingDown,
      title: "Declining Views",
      description: `Your views decreased by ${Math.abs(
        calculations.viewsGrowthRate
      )}%. Consider updating your content or sharing it more actively.`,
      variant: "warning" as const,
    });
  }

  // Quality insights
  if (calculations.qualityScore > 70) {
    insights.push({
      icon: Award,
      title: "High Quality Engagement",
      description: `Your quality score is ${calculations.qualityScore}/100. Visitors are spending good time on your resume.`,
      variant: "success" as const,
    });
  } else if (calculations.qualityScore < 40) {
    insights.push({
      icon: Target,
      title: "Improve Engagement",
      description: `Quality score: ${calculations.qualityScore}/100. Consider making your resume more engaging with better content or design.`,
      variant: "info" as const,
    });
  }

  // Retention insights
  if (calculations.retentionRate > 50) {
    insights.push({
      icon: Activity,
      title: "Great Retention",
      description: `${calculations.retentionRate}% of visitors stay for over a minute. Your content is engaging!`,
      variant: "success" as const,
    });
  } else if (calculations.retentionRate < 30) {
    insights.push({
      icon: Target,
      title: "Low Retention",
      description: `Only ${calculations.retentionRate}% of visitors stay for over a minute. Try to make your resume more captivating.`,
      variant: "warning" as const,
    });
  }

  // Consistency insights
  if (calculations.viewConsistency > 70) {
    insights.push({
      icon: Calendar,
      title: "Consistent Traffic",
      description: `You have views on ${calculations.viewConsistency}% of days. Your resume maintains steady visibility.`,
      variant: "success" as const,
    });
  }

  // Peak activity insights
  if (calculations.peakRatio > 3) {
    insights.push({
      icon: TrendingUp,
      title: "Viral Potential",
      description: `Your peak day had ${calculations.peakRatio}x the average views. This shows viral potential!`,
      variant: "info" as const,
    });
  }

  // Default insight if no specific insights
  if (insights.length === 0) {
    insights.push({
      icon: Activity,
      title: "Keep Building",
      description:
        "Your analytics are developing. Share your resume more to gain insights and improve visibility.",
      variant: "default" as const,
    });
  }

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border-2 border-[#3498DB]/20 shadow-xl shadow-[#3498DB]/10 overflow-hidden">
      <div className="bg-gradient-to-r from-[#2C3E50]/5 via-[#3498DB]/5 to-[#2C3E50]/5 border-b-2 border-[#3498DB]/20 p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-[#2C3E50] to-[#3498DB] shadow-lg shadow-[#3498DB]/30">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-xl font-bold text-[#2C3E50] dark:text-white">Intelligent Insights</h3>
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <InsightItem key={index} {...insight} />
          ))}
        </div>
      </div>
    </div>
  );
}
