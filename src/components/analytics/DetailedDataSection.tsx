import React from "react";
import dynamic from "next/dynamic";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CountryViewsTable } from "./CountryViewsTable";
import { ReferrerViewsTable } from "./ReferrerViewsTable";
import { RecentViewsTable } from "./RecentViewsTable";
import { InteractionsTable } from "./InteractionsTable";
import type { AnalyticsData } from "@/types/analytics";

// Lazy load chart components - only load when tab is opened
const InteractionPieChart = dynamic(
  () => import("./InteractionPieChart").then((mod) => ({ default: mod.InteractionPieChart })),
  { 
    ssr: false,
    loading: () => <div className="h-64 bg-gray-50 animate-pulse rounded-lg flex items-center justify-center">Loading chart...</div>
  }
);

const ReferrerBarChart = dynamic(
  () => import("./ReferrerBarChart").then((mod) => ({ default: mod.ReferrerBarChart })),
  { 
    ssr: false,
    loading: () => <div className="h-64 bg-gray-50 animate-pulse rounded-lg flex items-center justify-center">Loading chart...</div>
  }
);

interface DetailedDataSectionProps {
  analyticsData: AnalyticsData;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function DetailedDataSection({
  analyticsData,
  onRefresh,
  isRefreshing = false,
}: DetailedDataSectionProps) {
  return (
    <Tabs defaultValue="views" className="space-y-4">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="views">Recent Views</TabsTrigger>
        <TabsTrigger value="countries">Countries</TabsTrigger>
        <TabsTrigger value="referrers">Referrers</TabsTrigger>
        <TabsTrigger value="interactions">Interactions</TabsTrigger>
      </TabsList>

      <TabsContent value="views" className="space-y-4">
        <RecentViewsTable data={analyticsData.views} onRefresh={onRefresh} isRefreshing={isRefreshing} />
      </TabsContent>

      <TabsContent value="countries" className="space-y-4">
        <div className="grid gap-6 md:grid-cols-2">
          <CountryViewsTable data={analyticsData.summary.viewsByCountry} onRefresh={onRefresh} isRefreshing={isRefreshing} />
          {analyticsData.summary.viewsByCountry.length > 0 && (
            <div>
              <InteractionPieChart
                data={analyticsData.summary.viewsByCountry.slice(0, 6)}
                title="Top Countries Distribution"
              />
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="referrers" className="space-y-4">
        <div className="grid gap-6 md:grid-cols-2">
          <ReferrerViewsTable data={analyticsData.summary.viewsByReferrer} onRefresh={onRefresh} isRefreshing={isRefreshing} />
          {analyticsData.summary.viewsByReferrer.length > 0 && (
            <div>
              <ReferrerBarChart
                data={analyticsData.summary.viewsByReferrer}
                maxItems={10}
              />
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="interactions" className="space-y-4">
        {analyticsData.interactions.length > 0 ? (
          <div className="grid gap-6">
            {/* Summary charts first */}
            {analyticsData.summary.interactionsByType.length > 0 && (
              <div className="grid gap-6 md:grid-cols-2">
                <InteractionPieChart
                  data={analyticsData.summary.interactionsByType}
                />
                <div className="rounded-lg border bg-card p-6">
                  <h3 className="font-semibold mb-4">Interaction Summary</h3>
                  <div className="space-y-3">
                    {analyticsData.summary.interactionsByType.map((type) => {
                      // Format the name - capitalize and replace underscores
                      const formattedName = type.name
                        .split('_')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                        .join(' ');
                      
                      return (
                        <div
                          key={type.name}
                          className="flex justify-between items-center"
                        >
                          <span className="text-sm">
                            {formattedName}
                          </span>
                          <span className="font-semibold">{type.count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
            
            {/* Detailed interactions table below charts */}
            <InteractionsTable 
              data={analyticsData.interactions} 
              itemsPerPage={10}
              onRefresh={onRefresh}
              isRefreshing={isRefreshing}
            />
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No interactions recorded yet
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
