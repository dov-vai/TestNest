'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TopicList } from '@/components/topics/TopicList';
import { PaginationBar } from '@/components/ui/PaginationBar';

export function TestsView({ page }: { page: number }) {
  const router = useRouter();
  const [hasMore, setHasMore] = useState(true);

  const handlePageChange = (newPage: number) => {
    router.push(`/tests/${newPage}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Available Tests</h1>
      </div>

      <TopicList page={page} itemsPerPage={10} onDataLoaded={(_, isFullPage) => setHasMore(isFullPage)} />

      {/* Pass the custom handler here */}
      <PaginationBar currentPage={page} isNextDisabled={!hasMore} onPageChange={handlePageChange} />
    </div>
  );
}
