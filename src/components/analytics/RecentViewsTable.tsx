import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { formatDate } from "@/lib/analytics/formatters";
import { PaginationControls } from "./PaginationControls";
import { usePagination } from "@/hooks/use-pagination";
import type { View } from "@/types/analytics";
import { Flag } from "./Flag";

interface RecentViewsTableProps {
  data: View[];
  title?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function RecentViewsTable({
  data,
  title = "Recent Views",
  onRefresh,
  isRefreshing = false,
}: RecentViewsTableProps) {
  const {
    paginatedData,
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    setPage,
    setPageSize,
  } = usePagination(data, 10);

  if (!data || data.length === 0) {
    return (
      <Card className="border-2 border-[#3498DB]/10 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg sm:text-xl text-[#2C3E50] dark:text-white">{title}</CardTitle>
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No recent views
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatDuration = (seconds: number | undefined) => {
    if (!seconds) return "N/A";
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <Card className="border-2 border-[#3498DB]/10 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg sm:text-xl text-[#2C3E50] dark:text-white">{title}</CardTitle>
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border-2 border-[#3498DB]/20 overflow-hidden">
          <Table>
            <TableHeader className="bg-gradient-to-br from-[#3498DB]/5 to-[#2C3E50]/5">
              <TableRow className="border-b border-[#3498DB]/20 hover:bg-transparent">
                <TableHead>Date & Time</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Referrer</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((view) => (
                <TableRow key={view.id} className="border-b border-[#3498DB]/10 hover:bg-[#3498DB]/5">
                  <TableCell className="font-medium">
                    {formatDate(view.viewed_at)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {view.country && <Flag countryCode={view.country} />}
                      <span>
                        {view.city
                          ? `${view.city}, ${view.country || "Unknown"}`
                          : view.country || "Unknown"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={
                        (view.view_duration || 0) >= 60
                          ? "text-green-600 dark:text-green-400 font-medium"
                          : ""
                      }
                    >
                      {formatDuration(view.view_duration)}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-[200px] truncate">
                    {view.referrer || "Direct"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </CardContent>
    </Card>
  );
}
