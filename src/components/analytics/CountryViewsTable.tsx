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
import { Flag } from "./Flag";
import { formatCountry } from "@/lib/analytics/formatters";
import { PaginationControls } from "./PaginationControls";
import { usePagination } from "@/hooks/use-pagination";
import type { CountryView } from "@/types/analytics";

interface CountryViewsTableProps {
  data: CountryView[];
  title?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function CountryViewsTable({
  data,
  title = "Views by Country",
  onRefresh,
  isRefreshing = false,
}: CountryViewsTableProps) {
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
            No country data available
          </div>
        </CardContent>
      </Card>
    );
  }

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
                <TableHead className="w-[60px]">Flag</TableHead>
                <TableHead>Country</TableHead>
                <TableHead className="text-right">Views</TableHead>
                <TableHead className="text-right">Percentage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((country) => {
                // Calculate total views across all countries
                const totalViews = data.reduce((sum, c) => sum + c.count, 0);
                const percentage = ((country.count / totalViews) * 100).toFixed(1);
                
                return (
                  <TableRow key={country.name} className="border-b border-[#3498DB]/10 hover:bg-[#3498DB]/5">
                    <TableCell>
                      <Flag countryCode={country.name} />
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCountry(country.name)}
                    </TableCell>
                    <TableCell className="text-right">
                      {country.count.toLocaleString()}
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
