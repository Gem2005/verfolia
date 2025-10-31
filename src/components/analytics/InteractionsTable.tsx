import React, { useState, useMemo } from "react";
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
import { formatDistanceToNow } from "date-fns";
import { ArrowUpDown } from "lucide-react";
import { PaginationControls } from "./PaginationControls";
import { usePagination } from "@/hooks/use-pagination";

interface Interaction {
  id: string;
  clicked_at: string;
  interaction_type: string;
  section_name?: string | null;
  target_value?: string | null;
}

interface InteractionsTableProps {
  data: Interaction[];
  itemsPerPage?: number;
}

export function InteractionsTable({ 
  data, 
  itemsPerPage = 10,
}: InteractionsTableProps) {
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  
  // Sort data by clicked_at
  const sortedData = useMemo(() => {
    const sorted = [...data];
    sorted.sort((a, b) => {
      const dateA = new Date(a.clicked_at).getTime();
      const dateB = new Date(b.clicked_at).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
    return sorted;
  }, [data, sortOrder]);

  const {
    paginatedData,
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    setPage,
    setPageSize,
  } = usePagination(sortedData, itemsPerPage);

  if (!data || data.length === 0) {
    return (
      <Card className="border-2 border-[#3498DB]/10 shadow-lg">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-base sm:text-lg md:text-xl text-[#2C3E50] dark:text-white">Recent Interactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 sm:py-8 text-muted-foreground text-xs sm:text-sm">
            No interactions recorded yet
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatInteractionType = (type: string, sectionName?: string | null) => {
    if (type === 'section_view' && sectionName) {
      // Remove "custom_" prefix and format section name
      const cleanName = sectionName.replace(/^custom_/i, '');
      return cleanName
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }

    // Format other interaction types
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <Card className="border-2 border-[#3498DB]/10 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-3 sm:pb-4">
        <CardTitle className="text-base sm:text-lg md:text-xl text-[#2C3E50] dark:text-white">Recent Interactions</CardTitle>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
            className="flex-1 sm:flex-initial"
          >
            <ArrowUpDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-2" />
            <span className="text-xs sm:text-sm">{sortOrder === 'newest' ? 'Newest' : 'Oldest'}</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border-2 border-[#3498DB]/20 overflow-hidden">
          <Table>
            <TableHeader className="bg-gradient-to-br from-[#3498DB]/5 to-[#2C3E50]/5">
              <TableRow className="border-b border-[#3498DB]/20 hover:bg-transparent">
                <TableHead className="text-xs sm:text-sm">Type</TableHead>
                <TableHead className="text-xs sm:text-sm">Details</TableHead>
                <TableHead className="text-right text-xs sm:text-sm">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((interaction) => (
                <TableRow key={interaction.id} className="border-b border-[#3498DB]/10 hover:bg-[#3498DB]/5">
                  <TableCell className="font-medium text-xs sm:text-sm">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="text-base sm:text-lg">{getInteractionIcon(interaction.interaction_type)}</span>
                      <span className="whitespace-nowrap">{formatInteractionType(interaction.interaction_type, interaction.section_name)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs sm:text-sm max-w-[200px]">
                    {interaction.interaction_type === 'section_view' ? (
                      <span className="truncate block">
                        Viewed {interaction.target_value || 'section'}
                      </span>
                    ) : interaction.target_value ? (
                      <span className="truncate block">
                        {interaction.target_value}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/50">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-[10px] sm:text-xs md:text-sm text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(new Date(interaction.clicked_at), {
                      addSuffix: true,
                    })}
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

const getInteractionIcon = (type: string) => {
  switch (type) {
    case 'section_view':
      return '👁️';
    case 'email_click':
      return '📧';
    case 'phone_click':
      return '📞';
    case 'link_click':
      return '🔗';
    case 'download':
      return '⬇️';
    case 'social_link_click':
      return '👥';
    default:
      return '👆';
  }
};
