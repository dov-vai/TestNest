'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { Loader } from '@/components/ui/Loader';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Trash2, Lock, Unlock } from 'lucide-react';
import { PaginationBar } from '@/components/ui/PaginationBar';

interface Question {
  id: number;
  text: string;
  type: 'multi' | 'single' | 'true_false' | 'fill_blank';
  isPrivate: boolean;
  userId: number;
  createdAt: string;
}

const ITEMS_PER_PAGE = 10;

const questionTypeLabels: Record<string, string> = {
  single: 'Single Choice',
  multi: 'Multiple Choice',
  true_false: 'True/False',
  fill_blank: 'Fill in Blank',
};

export const AdminQuestionManagement = () => {
  const { accessToken } = useAuth();
  const fetchWithAuth = useAuthenticatedFetch();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<number | null>(null);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const offset = (page - 1) * ITEMS_PER_PAGE;
      const res = await fetchWithAuth(`/api/questions?limit=${ITEMS_PER_PAGE}&offset=${offset}`);
      if (!res.ok) throw new Error('Failed to fetch questions');
      const data = await res.json();
      setQuestions(data);
      setHasMore(data.length === ITEMS_PER_PAGE);
    } catch (e) {
      console.error(e);
      alert('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) fetchQuestions();
  }, [accessToken, page]);

  const openDeleteModal = (id: number) => {
    setQuestionToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteQuestion = async () => {
    if (!questionToDelete) return;
    setIsDeleteModalOpen(false);
    try {
      const res = await fetchWithAuth(`/api/questions/${questionToDelete}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete question');
      setQuestions((prev) => prev.filter((q) => q.id !== questionToDelete));
    } catch (e) {
      alert('Failed to delete question');
    } finally {
      setQuestionToDelete(null);
    }
  };

  if (loading && page === 1) return <Loader />;

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-4">All Questions Management</h2>

      {/* Desktop table view */}
      <div className="hidden md:block bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Question
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Type
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
            {questions.map((question) => (
              <tr key={question.id}>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900 max-w-md truncate">{question.text}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-500">{questionTypeLabels[question.type]}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {question.isPrivate ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800 flex items-center w-fit">
                      <Lock className="h-3 w-3 mr-1" /> Private
                    </span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 flex items-center w-fit">
                      <Unlock className="h-3 w-3 mr-1" /> Public
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">User #{question.userId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(question.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => openDeleteModal(question.id)}
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

      {/* Mobile card view */}
      <div className="md:hidden space-y-4">
        {questions.map((question) => (
          <div key={question.id} className="bg-white shadow rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 mb-2">{question.text}</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {questionTypeLabels[question.type]}
                  </span>
                  {question.isPrivate ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800 flex items-center">
                      <Lock className="h-3 w-3 mr-1" /> Private
                    </span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 flex items-center">
                      <Unlock className="h-3 w-3 mr-1" /> Public
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => openDeleteModal(question.id)}
                className="text-red-600 hover:text-red-900 ml-2"
                title="Delete"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>User #{question.userId}</span>
              <span>{new Date(question.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      {questions.length > 0 && <PaginationBar currentPage={page} isNextDisabled={!hasMore} onPageChange={setPage} />}

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Question"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={confirmDeleteQuestion} className="w-full sm:w-auto">
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-500">
          Are you sure you want to delete this question? This will also remove all associated answers and attempts.
        </p>
      </Modal>
    </div>
  );
};
