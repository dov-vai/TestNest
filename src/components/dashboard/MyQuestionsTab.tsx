'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Loader } from '@/components/ui/Loader';
import { Plus, Trash2, Edit } from 'lucide-react';
import { PaginationBar } from '../ui/PaginationBar';
import { CreateQuestionModal } from './CreateQuestionModal';
import { EditQuestionModal } from './EditQuestionModal';

interface Question {
  id: number;
  text: string;
  type: string;
  isPrivate: boolean;
  userId: number;
}

const ITEMS_PER_PAGE = 10;

export const MyQuestionsTab = () => {
  const { user } = useAuth();
  const fetchWithAuth = useAuthenticatedFetch();
  const [page, setPage] = useState(1);

  const fetcher = (url: string) => fetchWithAuth(url).then((res) => res.json());

  const offset = (page - 1) * ITEMS_PER_PAGE;
  // Use creator_id to fetch only my questions from server
  const {
    data: questions,
    error,
    isLoading,
    mutate,
  } = useSWR(user ? `/api/questions?limit=${ITEMS_PER_PAGE}&offset=${offset}&creator_id=${user.id}` : null, fetcher);

  const hasMore = questions && questions.length === ITEMS_PER_PAGE;

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [questionToEdit, setQuestionToEdit] = useState<number | null>(null);
  const [questionToDelete, setQuestionToDelete] = useState<number | null>(null);

  const openDeleteModal = (id: number) => {
    setQuestionToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const openEditModal = (id: number) => {
    setQuestionToEdit(id);
    setIsEditModalOpen(true);
  };

  const confirmDeleteQuestion = async () => {
    if (!questionToDelete) return;
    setIsDeleteModalOpen(false);
    try {
      await fetchWithAuth(`/api/questions/${questionToDelete}`, { method: 'DELETE' });
      mutate();
    } catch (e) {
      alert('Failed to delete');
    } finally {
      setQuestionToDelete(null);
    }
  };

  if (isLoading) return <Loader />;
  if (error) return <div>Error loading questions</div>;

  return (
    <div>
      <div className="mb-6 flex justify-end">
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-5 w-5" /> Create Question
        </Button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {questions.length === 0 ? (
            <li className="px-4 py-4 text-center text-gray-500">No questions found.</li>
          ) : (
            questions.map((q: Question) => (
              <li key={q.id} className="px-4 py-4 sm:px-6 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <p className="text-sm font-medium text-indigo-600">{q.text}</p>
                  <p className="text-xs text-gray-500">Type: {q.type}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(q.id)}
                    className="text-indigo-600 hover:text-indigo-800"
                    title="Edit question"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => openDeleteModal(q.id)}
                    className="text-red-600 hover:text-red-800"
                    title="Delete question"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      {questions && questions.length > 0 && (
        <PaginationBar currentPage={page} isNextDisabled={!hasMore} onPageChange={setPage} />
      )}

      <CreateQuestionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => mutate()}
      />

      <EditQuestionModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setQuestionToEdit(null);
        }}
        onSuccess={() => mutate()}
        questionId={questionToEdit}
      />

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
          Are you sure you want to delete this question? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};
