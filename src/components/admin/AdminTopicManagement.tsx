'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { Loader } from '@/components/ui/Loader';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Trash2, Eye, Lock, Unlock } from 'lucide-react';
import Link from 'next/link';
import { PaginationBar } from '@/components/ui/PaginationBar';

interface Topic {
  id: number;
  title: string;
  description?: string;
  isPrivate: boolean;
  userId: number;
  createdAt: string;
  user?: {
    name: string;
    email: string;
  };
}

const ITEMS_PER_PAGE = 10;

export const AdminTopicManagement = () => {
  const { accessToken } = useAuth();
  const fetchWithAuth = useAuthenticatedFetch();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [topicToDelete, setTopicToDelete] = useState<number | null>(null);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const offset = (page - 1) * ITEMS_PER_PAGE;
      const res = await fetchWithAuth(`/api/topics?limit=${ITEMS_PER_PAGE}&offset=${offset}`);
      if (!res.ok) throw new Error('Failed to fetch topics');
      const data = await res.json();
      setTopics(data);
      setHasMore(data.length === ITEMS_PER_PAGE);
    } catch (e) {
      console.error(e);
      alert('Failed to load topics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) fetchTopics();
  }, [accessToken, page]);

  const openDeleteModal = (id: number) => {
    setTopicToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteTopic = async () => {
    if (!topicToDelete) return;
    setIsDeleteModalOpen(false);
    try {
      const res = await fetchWithAuth(`/api/topics/${topicToDelete}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete topic');
      setTopics((prev) => prev.filter((t) => t.id !== topicToDelete));
    } catch (e) {
      alert('Failed to delete topic');
    } finally {
      setTopicToDelete(null);
    }
  };

  if (loading && page === 1) return <Loader />;

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-4">All Topics Management</h2>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Topic
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Visibility
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Creator ID
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Created
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {topics.map((topic) => (
              <tr key={topic.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{topic.title}</div>
                  <div className="text-sm text-gray-500 truncate max-w-xs">{topic.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {topic.isPrivate ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800 flex items-center w-fit">
                      <Lock className="h-3 w-3 mr-1" /> Private
                    </span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 flex items-center w-fit">
                      <Unlock className="h-3 w-3 mr-1" /> Public
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">User #{topic.userId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(topic.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    href={`/topics/${topic.id}`}
                    className="text-indigo-600 hover:text-indigo-900 mr-4 inline-block"
                    title="View"
                  >
                    <Eye className="h-5 w-5" />
                  </Link>
                  <button
                    onClick={() => openDeleteModal(topic.id)}
                    className="text-red-600 hover:text-red-900"
                    title="Delete"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {topics.length > 0 && <PaginationBar currentPage={page} isNextDisabled={!hasMore} onPageChange={setPage} />}

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Topic"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={confirmDeleteTopic} className="w-full sm:w-auto">
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-500">
          Are you sure you want to delete this topic? This will remove all associated questions and attempts.
        </p>
      </Modal>
    </div>
  );
};
