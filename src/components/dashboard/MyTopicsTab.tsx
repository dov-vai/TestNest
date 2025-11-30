'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Loader } from '@/components/ui/Loader';
import { Plus, Edit2, Trash2, FileText, Lock, Unlock } from 'lucide-react';
import Link from 'next/link';
import { TextArea } from '../ui/TextArea';
import { PaginationBar } from '../ui/PaginationBar';

interface Topic {
  id: number;
  title: string;
  description?: string;
  isPrivate: boolean;
  userId: number;
}

const ITEMS_PER_PAGE = 6;

export const MyTopicsTab: React.FC = () => {
  const { user } = useAuth();
  const fetchWithAuth = useAuthenticatedFetch();
  const [page, setPage] = useState(1);

  const fetcher = (url: string) =>
    fetchWithAuth(url).then((res) => {
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    });

  const offset = (page - 1) * ITEMS_PER_PAGE;
  // Use creator_id to fetch only my topics from server
  const {
    data: topics,
    error,
    isLoading,
    mutate,
  } = useSWR(user ? `/api/topics?limit=${ITEMS_PER_PAGE}&offset=${offset}&creator_id=${user.id}` : null, fetcher);

  const hasMore = topics && topics.length === ITEMS_PER_PAGE;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [topicForm, setTopicForm] = useState({ title: '', description: '', isPrivate: false });
  const [formLoading, setFormLoading] = useState(false);
  const [confirmTopicId, setConfirmTopicId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleCreateOrUpdateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const url = editingTopic ? `/api/topics/${editingTopic.id}` : '/api/topics';
      const method = editingTopic ? 'PATCH' : 'POST';

      const res = await fetchWithAuth(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(topicForm),
      });

      if (!res.ok) throw new Error('Failed to save topic');

      setIsModalOpen(false);
      resetForm();
      mutate();
    } catch (err) {
      alert('Error saving topic');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteTopic = async (id: number) => {
    setDeleting(true);
    try {
      const res = await fetchWithAuth(`/api/topics/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      mutate();
      setConfirmTopicId(null);
    } catch (err) {
      alert('Error deleting topic');
    } finally {
      setDeleting(false);
    }
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (topic: Topic) => {
    setEditingTopic(topic);
    setTopicForm({
      title: topic.title,
      description: topic.description || '',
      isPrivate: topic.isPrivate,
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingTopic(null);
    setTopicForm({ title: '', description: '', isPrivate: false });
  };

  if (isLoading) return <Loader />;
  if (error) return <div>Error loading topics.</div>;

  return (
    <div>
      <div className="mb-6 flex justify-end">
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-5 w-5" /> Create New Topic
        </Button>
      </div>

      {!topics || topics.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">You haven't created any topics yet.</p>
        </div>
      ) : (
        <>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {topics.map((topic: Topic) => (
                <li key={topic.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <Link href={`/topics/${topic.id}`} className="block">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-primary-600 truncate">{topic.title}</p>
                          {topic.isPrivate ? (
                            <Lock className="h-4 w-4 text-amber-600 flex-shrink-0" title="Private" />
                          ) : (
                            <Unlock className="h-4 w-4 text-green-600 flex-shrink-0" title="Public" />
                          )}
                        </div>
                        {topic.description && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{topic.description}</p>
                        )}
                      </Link>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Link
                        href={`/topics/${topic.id}/manage`}
                        className="text-green-600 hover:text-green-800"
                        title="Manage questions"
                      >
                        <FileText className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => openEditModal(topic)}
                        className="text-primary-600 hover:text-primary-800"
                        title="Edit topic"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setConfirmTopicId(topic.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete topic"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <PaginationBar currentPage={page} isNextDisabled={!hasMore} onPageChange={setPage} />
        </>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTopic ? 'Edit Topic' : 'Create New Topic'}
      >
        <form onSubmit={handleCreateOrUpdateTopic} className="space-y-4">
          <Input
            label="Title"
            value={topicForm.title}
            onChange={(e) => setTopicForm({ ...topicForm, title: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <TextArea
              rows={3}
              value={topicForm.description}
              onChange={(e) => setTopicForm({ ...topicForm, description: e.target.value })}
            />
          </div>
          <div className="flex items-center">
            <input
              id="isPrivate"
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              checked={topicForm.isPrivate}
              onChange={(e) => setTopicForm({ ...topicForm, isPrivate: e.target.checked })}
            />
            <label htmlFor="isPrivate" className="ml-2 block text-sm text-gray-900">
              Private Topic
            </label>
          </div>
          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <Button type="submit" className="w-full sm:ml-3 sm:w-auto" isLoading={formLoading}>
              Save
            </Button>
            <Button
              type="button"
              variant="outline"
              className="mt-3 w-full sm:mt-0 sm:w-auto"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
      <Modal
        isOpen={confirmTopicId !== null}
        onClose={() => {
          if (!deleting) setConfirmTopicId(null);
        }}
        title="Delete Topic"
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirmTopicId(null)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button
              onClick={() => confirmTopicId !== null && handleDeleteTopic(confirmTopicId)}
              isLoading={deleting}
              className="w-full sm:w-auto"
            >
              Yes, Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-500">
          Are you sure you want to delete this topic? This will delete all questions and attempts associated with it.
        </p>
      </Modal>
    </div>
  );
};
