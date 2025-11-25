'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { TopicCard } from '@/components/topics/TopicCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Loader } from '@/components/ui/Loader';
import { Plus, Edit2, Trash2, FileText } from 'lucide-react';
import Link from 'next/link';
import { TextArea } from '../ui/TextArea';

interface Topic {
  id: number;
  title: string;
  description?: string;
  isPrivate: boolean;
  userId: number;
}

export const MyTopicsTab: React.FC = () => {
  const { user } = useAuth();
  const fetchWithAuth = useAuthenticatedFetch();
  
  const fetcher = (url: string) => fetchWithAuth(url).then((res) => {
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
  });

  const { data, error, isLoading, mutate } = useSWR(
    user ? '/api/topics' : null, 
    fetcher
  );

  // Filter client-side
  const topics: Topic[] = data ? data.filter((t: any) => t.userId === user?.id) : [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [topicForm, setTopicForm] = useState({ title: '', description: '', isPrivate: false });
  const [formLoading, setFormLoading] = useState(false);

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
    if (!confirm('Are you sure? This will delete all questions and attempts associated with this topic.')) return;
    try {
      const res = await fetchWithAuth(`/api/topics/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      mutate();
    } catch (err) {
      alert('Error deleting topic');
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

      {topics.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">You haven't created any topics yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic) => (
            <div key={topic.id} className="relative group">
              <TopicCard topic={topic} />
              <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link
                  href={`/topics/${topic.id}/manage`}
                  className="p-1 bg-white rounded-full shadow hover:bg-gray-100 text-green-600"
                  title="Manage Questions"
                >
                  <FileText className="h-4 w-4" />
                </Link>
                <button
                  onClick={(e) => { e.preventDefault(); openEditModal(topic); }}
                  className="p-1 bg-white rounded-full shadow hover:bg-gray-100 text-indigo-600"
                  title="Edit"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => { e.preventDefault(); handleDeleteTopic(topic.id); }}
                  className="p-1 bg-white rounded-full shadow hover:bg-gray-100 text-red-600"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
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
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
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
    </div>
  );
};