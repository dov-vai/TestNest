'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { QuestionCard } from '@/components/questions/QuestionCard';
import { Loader } from '@/components/ui/Loader';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { PaginationBar } from '@/components/ui/PaginationBar';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Question {
  id: number;
  text: string;
  type: 'multi' | 'single' | 'true_false' | 'fill_blank';
  isPrivate: boolean;
  userId: number;
}

interface Answer {
  id: number;
  questionId: number;
  text: string;
  isCorrect: boolean;
  orderIdx: number;
}

interface QuestionWithAnswers extends Question {
  answers: Answer[];
}

const ITEMS_PER_PAGE = 9; // 3x3 grid on desktop

export default function AddQuestionsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { accessToken, hasInitialized } = useAuth();
  const fetchWithAuth = useAuthenticatedFetch();

  const [page, setPage] = useState(1);
  const [questions, setQuestions] = useState<QuestionWithAnswers[]>([]);
  const [topicQuestions, setTopicQuestions] = useState<number[]>([]); // IDs already in topic
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Modal state for adding question
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [addingQuestionId, setAddingQuestionId] = useState<number | null>(null);
  const [points, setPoints] = useState(10);

  useEffect(() => {
    if (!hasInitialized) return;
    fetchData();
  }, [hasInitialized, page, accessToken, id]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch questions already in topic
      const tqRes = await fetchWithAuth(`/api/topics/${id}/questions`);
      if (!tqRes.ok) throw new Error('Failed to fetch topic questions');
      const topicQuestionsData = await tqRes.json();
      const existingIds = topicQuestionsData.map((tq: any) => tq.question.id);
      setTopicQuestions(existingIds);

      // Fetch all available questions with answers in a single request
      const offset = (page - 1) * ITEMS_PER_PAGE;
      const qRes = await fetchWithAuth(`/api/questions?limit=${ITEMS_PER_PAGE}&offset=${offset}&include_answers=true`);
      if (!qRes.ok) throw new Error('Failed to fetch questions');
      const questionsWithAnswers: QuestionWithAnswers[] = await qRes.json();

      setHasMore(questionsWithAnswers.length === ITEMS_PER_PAGE);
      setQuestions(questionsWithAnswers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = (question: Question) => {
    setSelectedQuestion(question);
    setPoints(10);
    setIsAddModalOpen(true);
  };

  const handleAddQuestion = async () => {
    if (!selectedQuestion) return;

    setAddingQuestionId(selectedQuestion.id);
    setIsAddModalOpen(false);

    try {
      const res = await fetchWithAuth(`/api/topics/${id}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId: selectedQuestion.id,
          points: Number(points),
          orderIdx: topicQuestions.length,
        }),
      });

      if (!res.ok) throw new Error('Failed to add question');

      // Add to existing IDs to filter it out
      setTopicQuestions((prev) => [...prev, selectedQuestion.id]);
      setSelectedQuestion(null);
    } catch (err) {
      alert('Failed to add question to topic');
    } finally {
      setAddingQuestionId(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter out questions already in topic
  const availableQuestions = questions.filter((q) => !topicQuestions.includes(q.id));

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => fetchData()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <Link href={`/topics/${id}/manage`} className="text-primary-600 hover:text-primary-900 flex items-center mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Manage Questions
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Add Existing Questions</h1>
        <p className="mt-2 text-sm sm:text-base text-gray-600">Browse and select questions to add to your topic</p>
      </div>

      {availableQuestions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <h3 className="mt-2 text-sm font-medium text-gray-900">No available questions</h3>
          <p className="mt-1 text-sm text-gray-500">
            All questions have been added to this topic, or no questions exist yet.
          </p>
          <div className="mt-6">
            <Link href={`/topics/${id}/manage`}>
              <Button variant="outline">Back to Manage</Button>
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {availableQuestions.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                answers={question.answers}
                onAdd={() => openAddModal(question)}
                isAdding={addingQuestionId === question.id}
                showAddButton={true}
              />
            ))}
          </div>

          <PaginationBar currentPage={page} isNextDisabled={!hasMore} onPageChange={handlePageChange} />
        </>
      )}

      {/* Add Question Modal with Points */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedQuestion(null);
        }}
        title="Add Question to Topic"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddModalOpen(false);
                setSelectedQuestion(null);
              }}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button onClick={handleAddQuestion} className="w-full sm:w-auto">
              Add Question
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-700 mb-2">
              <strong>Question:</strong> {selectedQuestion?.text}
            </p>
            <p className="text-xs text-gray-500">
              Type: {selectedQuestion ? questionTypeLabels[selectedQuestion.type] : ''}
            </p>
          </div>

          <Input
            label="Points"
            type="number"
            value={points}
            onChange={(e) => setPoints(Number(e.target.value))}
            min={0}
            placeholder="Enter points for this question"
          />
        </div>
      </Modal>
    </div>
  );
}

const questionTypeLabels: Record<string, string> = {
  single: 'Single Choice',
  multi: 'Multiple Choice',
  true_false: 'True/False',
  fill_blank: 'Fill in Blank',
};
