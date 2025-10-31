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
import { Flag } from "./Flag";
import { formatCountry } from "@/lib/analytics/formatters";
import { PaginationControls } from "./PaginationControls";
import { usePagination } from "@/hooks/use-pagination";
import type { CountryView } from "@/types/analytics";

interface CountryViewsTableProps {
  data: CountryView[];
  title?: string;
}

export function CountryViewsTable({
  data,
  title = "Views by Country",
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
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-base sm:text-lg md:text-xl text-[#2C3E50] dark:text-white">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 sm:py-8 text-muted-foreground text-xs sm:text-sm">
            No country data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-[#3498DB]/10 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="text-base sm:text-lg md:text-xl text-[#2C3E50] dark:text-white">{title}</CardTitle>
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
