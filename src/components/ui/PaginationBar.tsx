import React from 'react';
import { Button } from '@/components/ui/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationBarProps {
  currentPage: number;
  /**
   * If true, disables the 'Next' button.
   * Useful when we know we've reached the end of the list.
   */
  isNextDisabled?: boolean;
  /**
   * Callback fired when a navigation button is clicked.
   * The parent component decides what to do (route, fetch, etc).
   */
  onPageChange: (newPage: number) => void;
}

export function PaginationBar({ currentPage, isNextDisabled = false, onPageChange }: PaginationBarProps) {
  return (
    <div className="flex justify-center items-center space-x-4 mt-8">
      <Button
        variant="outline"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="flex items-center"
        aria-label="Previous Page"
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Previous
      </Button>

      <span className="text-sm font-medium text-gray-700">Page {currentPage}</span>

      <Button
        variant="outline"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={isNextDisabled}
        className="flex items-center"
        aria-label="Next Page"
      >
        Next
        <ChevronRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
}
