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
import { formatReferrer } from "@/lib/analytics/formatters";
import { PaginationControls } from "./PaginationControls";
import { usePagination } from "@/hooks/use-pagination";
import { ExternalLink, RefreshCw } from "lucide-react";
import type { ReferrerView } from "@/types/analytics";

interface ReferrerViewsTableProps {
  data: ReferrerView[];
  title?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function ReferrerViewsTable({
  data,
  title = "Top Referrers",
  onRefresh,
  isRefreshing = false,
}: ReferrerViewsTableProps) {
  const {
    paginatedData,
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    setPage,
    setPageSize,
  } = usePagination(data, 10);

  // Calculate total views for percentage calculation
  const totalViews = React.useMemo(() => {
    return data.reduce((sum, referrer) => sum + referrer.count, 0);
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <Card className="border-2 border-[#3498DB]/10 shadow-lg">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-3 sm:pb-4">
          <CardTitle className="text-base sm:text-lg md:text-xl text-[#2C3E50] dark:text-white">{title}</CardTitle>
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="w-full sm:w-auto"
            >
              <RefreshCw className={`h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="text-xs sm:text-sm hidden sm:inline">Refresh</span>
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 sm:py-8 text-muted-foreground text-xs sm:text-sm">
            No referrer data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-[#3498DB]/10 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-3 sm:pb-4">
        <CardTitle className="text-base sm:text-lg md:text-xl text-[#2C3E50] dark:text-white">{title}</CardTitle>
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="w-full sm:w-auto"
          >
            <RefreshCw className={`h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="text-xs sm:text-sm hidden sm:inline">Refresh</span>
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border-2 border-[#3498DB]/20 overflow-hidden">
          <Table>
            <TableHeader className="bg-gradient-to-br from-[#3498DB]/5 to-[#2C3E50]/5">
              <TableRow className="border-b border-[#3498DB]/20 hover:bg-transparent">
                <TableHead>Source</TableHead>
                <TableHead className="text-right">Views</TableHead>
                <TableHead className="text-right">Percentage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((referrer, index) => {
                const percentage = ((referrer.count / totalViews) * 100).toFixed(
                  1
                );
                
                const isUrl = (str: string) => {
                  try {
                    new URL(str);
                    return true;
                  } catch {
                    return false;
                  }
                };
                
                const displayName = formatReferrer(referrer.name);
                const showLink = isUrl(referrer.name);

                return (
                  <TableRow key={`${referrer.name}-${index}`} className="border-b border-[#3498DB]/10 hover:bg-[#3498DB]/5">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{displayName}</span>
                        {showLink && (
                          <a
                            href={referrer.name}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {referrer.count.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {percentage}%
                    </TableCell>
                  </TableRow>
                );
              })}
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
