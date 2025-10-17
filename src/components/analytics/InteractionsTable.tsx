import React, { useState } from "react";
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
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";

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
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function InteractionsTable({ 
  data, 
  itemsPerPage = 10,
  onRefresh,
  isRefreshing = false
}: InteractionsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Recent Interactions</CardTitle>
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

  // Sort data by most recent first
  const sortedData = [...data].sort(
    (a, b) => new Date(b.clicked_at).getTime() - new Date(a.clicked_at).getTime()
  );

  // Calculate pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = sortedData.slice(startIndex, endIndex);

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>Recent Interactions</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {sortedData.length} total interaction{sortedData.length !== 1 ? 's' : ''}
          </p>
        </div>
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
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Type / Section</TableHead>
                <TableHead>Details</TableHead>
                <TableHead className="text-right">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentData.map((interaction) => (
                <TableRow key={interaction.id}>
                  <TableCell className="text-xl">
                    {getInteractionIcon(interaction.interaction_type)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatInteractionType(interaction.interaction_type, interaction.section_name)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {interaction.interaction_type === 'section_view' ? (
                      <span className="text-sm">
                        Viewed {interaction.target_value || 'section'}
                      </span>
                    ) : interaction.target_value ? (
                      <span className="text-sm truncate max-w-[200px] inline-block">
                        {interaction.target_value}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground/50">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(interaction.clicked_at), {
                      addSuffix: true,
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(endIndex, sortedData.length)} of {sortedData.length}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground px-2">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
