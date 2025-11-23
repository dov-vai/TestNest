'use client';

import React, { useEffect, useState } from 'react';
import { TopicCard } from './TopicCard';
import { Loader } from '@/components/ui/Loader';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';

interface Topic {
  id: number;
  title: string;
  description?: string;
  isPrivate: boolean;
}

export function TopicList() {
  const { accessToken, hasInitialized } = useAuth();
  const fetchWithAuth = useAuthenticatedFetch();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasInitialized) return;

    const fetchTopics = async () => {
      try {
        const response = await fetchWithAuth('/api/topics');
        if (!response.ok) {
          throw new Error('Failed to fetch topics');
        }
        const data = await response.json();
        setTopics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, [accessToken, hasInitialized, fetchWithAuth]);

  if (loading) return <Loader />;
  
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  if (topics.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <h3 className="mt-2 text-sm font-medium text-gray-900">No topics found</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new topic.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {topics.map((topic) => (
        <TopicCard key={topic.id} topic={topic} />
      ))}
    </div>
  );
}
