'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { Button } from '@/components/ui/Button';
import { Loader } from '@/components/ui/Loader';
import { Modal } from '@/components/ui/Modal';
import { CreateQuestionModal } from '@/components/dashboard/CreateQuestionModal';
import { EditQuestionModal } from '@/components/dashboard/EditQuestionModal';
import { ArrowLeft, Plus, Trash2, Edit } from 'lucide-react';
import Link from 'next/link';

interface TopicQuestion {
  id: number; // linkId
  question: {
    id: number;
    text: string;
    type: string;
  };
  points: number;
  orderIdx: number;
}

export default function ManageTopicPage() {
  const { id } = useParams();
  const { user, accessToken } = useAuth();
  const fetchWithAuth = useAuthenticatedFetch();
  const router = useRouter();

  const [topicQuestions, setTopicQuestions] = useState<TopicQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [questionToEdit, setQuestionToEdit] = useState<number | null>(null);
  const [questionToUnlink, setQuestionToUnlink] = useState<number | null>(null);

  // "Create Question" Form
  const [createQuestionPoints, setCreateQuestionPoints] = useState(10);

  const fetchData = async () => {
    try {
      const tqRes = await fetchWithAuth(`/api/topics/${id}/questions`);
      if (!tqRes.ok) throw new Error('Failed to fetch topic questions');
      setTopicQuestions(await tqRes.json());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) fetchData();
  }, [accessToken, id]);

  const openDeleteModal = (linkId: number) => {
    setQuestionToUnlink(linkId);
    setIsDeleteModalOpen(true);
  };

  const openEditModal = (questionId: number) => {
    setQuestionToEdit(questionId);
    setIsEditModalOpen(true);
  };

  const confirmUnlink = async () => {
    if (!questionToUnlink) return;
    setIsDeleteModalOpen(false);
    try {
      await fetchWithAuth(`/api/topics/${id}/questions/${questionToUnlink}`, {
        method: 'DELETE',
      });
      setTopicQuestions((prev) => prev.filter((tq) => tq.id !== questionToUnlink));
    } catch (e) {
      alert('Failed to unlink');
    } finally {
      setQuestionToUnlink(null);
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <Link href="/dashboard" className="text-indigo-600 flex items-center">
          <ArrowLeft className="h-4 w-4 mr-1" /> Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Manage Questions</h1>
        <div className="flex gap-2">
          <Button onClick={() => setIsCreateModalOpen(true)} variant="outline">
            <Plus className="mr-2 h-5 w-5" /> Create Question
          </Button>
          <Link href={`/topics/${id}/manage/add`}>
            <Button>
              <Plus className="mr-2 h-5 w-5" /> Add Existing
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {topicQuestions.length === 0 ? (
            <li className="px-4 py-12 text-center text-gray-500">No questions in this topic yet. Add some!</li>
          ) : (
            topicQuestions.map((tq, index) => (
              <li key={tq.id} className="px-4 py-4 sm:px-6 flex items-center justify-between hover:bg-gray-50">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-indigo-600 truncate">
                      {index + 1}. {tq.question.text}
                    </p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {tq.points} pts
                      </p>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">Type: {tq.question.type}</p>
                </div>
                <div className="ml-4 flex-shrink-0 flex gap-2">
                  <button
                    onClick={() => openEditModal(tq.question.id)}
                    className="text-indigo-600 hover:text-indigo-900"
                    title="Edit question"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => openDeleteModal(tq.id)}
                    className="text-red-600 hover:text-red-900"
                    title="Remove from topic"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      <CreateQuestionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchData}
        topicId={id}
        initialPoints={createQuestionPoints}
      />

      <EditQuestionModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setQuestionToEdit(null);
        }}
        onSuccess={fetchData}
        questionId={questionToEdit}
      />

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Remove Question"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={confirmUnlink} className="w-full sm:w-auto">
              Remove
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-500">Are you sure you want to remove this question from the topic?</p>
      </Modal>
    </div>
  );
}
