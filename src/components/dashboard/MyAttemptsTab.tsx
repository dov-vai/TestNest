'use client';

import React from 'react';
import useSWR from 'swr';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { Loader } from '@/components/ui/Loader';
import Link from 'next/link';

interface Attempt {
  id: number;
  topicId: number;
  startedAt: string;
  submittedAt?: string;
  totalPoints: number;
  earnedPoints: number;
  isCompleted: boolean;
}

export const MyAttemptsTab: React.FC = () => {
  const { user } = useAuth();
  const fetchWithAuth = useAuthenticatedFetch();

  const fetcher = (url: string) => fetchWithAuth(url).then(res => {
      if(!res.ok) throw new Error("Failed to fetch attempts");
      return res.json();
  });

  const { data: attempts, error, isLoading } = useSWR(
    user ? '/api/attempts' : null, 
    fetcher
  );

  if (isLoading) return <Loader />;
  if (error) return <div>Error loading attempts</div>;

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {!attempts || attempts.length === 0 ? (
          <li className="px-4 py-4 sm:px-6 text-center text-gray-500">No attempts found.</li>
        ) : (
          attempts.map((attempt: Attempt) => (
            <li key={attempt.id}>
              <Link href={`/attempts/${attempt.id}`} className="block hover:bg-gray-50">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-indigo-600 truncate">
                      Topic ID: {attempt.topicId}
                    </p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          attempt.isCompleted
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {attempt.isCompleted ? 'Completed' : 'In Progress'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        Score: {attempt.earnedPoints} / {attempt.totalPoints}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <p>Started {new Date(attempt.startedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};