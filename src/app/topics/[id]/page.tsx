'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { Button } from '@/components/ui/Button';
import { Loader } from '@/components/ui/Loader';
import { ArrowLeft, BookOpen, Lock, Unlock, PlayCircle } from 'lucide-react';
import Link from 'next/link';

interface Topic {
  id: number;
  title: string;
  description?: string;
  isPrivate: boolean;
  createdAt: string;
}

export default function TopicDetailPage() {
  const { id } = useParams();
  const { user, hasInitialized } = useAuth();
  const fetchWithAuth = useAuthenticatedFetch();
  const router = useRouter();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startingAttempt, setStartingAttempt] = useState(false);

  useEffect(() => {
    if (!hasInitialized) return;

    const fetchTopic = async () => {
      try {
        const response = await fetchWithAuth(`/api/topics/${id}`);
        if (!response.ok) {
          if (response.status === 403) {
            throw new Error('You do not have permission to view this topic.');
          }
          throw new Error('Failed to fetch topic details');
        }
        const data = await response.json();
        setTopic(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTopic();
    }
  }, [id, hasInitialized, fetchWithAuth]);

  const handleStartAttempt = async () => {
    setStartingAttempt(true);
    try {
      if (!user) {
        // Guest mode: navigate directly to attempt page with 'guest' id
        if (topic?.isPrivate) {
          router.push(`/login?redirect=/topics/${id}`);
          return;
        }
        router.push(`/attempts/guest?topicId=${id}`);
      } else {
        // Authenticated: create server-side attempt
        const response = await fetchWithAuth('/api/attempts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ topicId: Number(id) }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to start attempt');
        }

        const attempt = await response.json();
        router.push(`/attempts/${attempt.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start test');
    } finally {
      setStartingAttempt(false);
    }
  };

  if (loading) return <Loader />;
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <Link href="/">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Topics
          </Button>
        </Link>
      </div>
    );
  }
  if (!topic) return null;

  return (
    <div className="bg-white shadow sm:rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-primary-600 hover:text-primary-900 flex items-center mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Link>
          <div className="flex items-center text-sm text-gray-500">
            {topic.isPrivate ? (
              <span className="flex items-center text-amber-600 bg-amber-50 px-2 py-1 rounded">
                <Lock className="h-4 w-4 mr-1" /> Private
              </span>
            ) : (
              <span className="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded">
                <Unlock className="h-4 w-4 mr-1" /> Public
              </span>
            )}
          </div>
        </div>
        <h1 className="text-3xl font-bold leading-tight text-gray-900 flex items-center">
          <BookOpen className="h-8 w-8 mr-3 text-primary-600" />
          {topic.title}
        </h1>
        <p className="mt-4 text-lg text-gray-500">{topic.description}</p>
      </div>
      <div className="bg-gray-50 px-4 py-5 sm:p-6 flex flex-col sm:flex-row sm:justify-between items-center">
        <div className="mb-4 sm:mb-0 text-sm text-gray-500">
          Created on {new Date(topic.createdAt).toLocaleDateString()}
        </div>
        <Button size="lg" onClick={handleStartAttempt} isLoading={startingAttempt} className="w-full sm:w-auto">
          <PlayCircle className="mr-2 h-5 w-5" />
          Start Test
        </Button>
      </div>
    </div>
  );
}
