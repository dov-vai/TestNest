'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { Button } from '@/components/ui/Button';
import { Loader } from '@/components/ui/Loader';
import { Modal } from '@/components/ui/Modal';
import { ArrowLeft, BookOpen, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

interface Question {
  id: number; // linkId
  questionId: number; // actual question id
  text: string;
  type: 'multi' | 'single' | 'true_false' | 'fill_blank';
  points: number;
  options: AnswerOption[];
}

interface AnswerOption {
  id: number;
  questionId: number;
  text: string;
  isCorrect?: boolean;
}

interface Attempt {
  id: number;
  topicId: number;
  isCompleted: boolean;
  totalPoints: number;
  earnedPoints: number;
  answers?: UserAnswer[]; // From GET /attempts/{id}
}

interface UserAnswer {
  topicQuestionId: number;
  answerIds?: number[];
  userAnswerText?: string | null;
  isCorrect?: boolean;
}

export default function AttemptPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const { accessToken, user } = useAuth();
  const fetchWithAuth = useAuthenticatedFetch();

  const isGuestMode = id === 'guest';
  const topicId = searchParams.get('topicId');

  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answersMap, setAnswersMap] = useState<Record<number, UserAnswer>>({});
  const [submitting, setSubmitting] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [guestCompleted, setGuestCompleted] = useState(false);

  const fetchAttemptData = useCallback(async () => {
    try {
      if (isGuestMode) {
        if (!topicId) {
          throw new Error('Topic ID is required for guest mode');
        }

        // For guests, create a fake attempt object
        const attemptObj = {
          id: 0,
          topicId: Number(topicId),
          isCompleted: guestCompleted,
          totalPoints: 0, // Will be calculated after fetching questions
          earnedPoints: 0,
        };

        // Fetch Questions for Topic (public endpoint)
        const questionsRes = await fetch(`/api/topics/${topicId}/questions`);
        if (!questionsRes.ok) throw new Error('Failed to fetch questions');
        const questionsData = await questionsRes.json();

        // Fetch Answers (Options) for Topic (public endpoint)
        const optionsRes = await fetch(`/api/topics/${topicId}/answers`);
        if (!optionsRes.ok) throw new Error('Failed to fetch options');
        const optionsData = await optionsRes.json();

        // Merge Questions and Options
        const mergedQuestions = questionsData.map((q: any) => ({
          id: q.id,
          questionId: q.question.id,
          text: q.question.text,
          type: q.question.type,
          points: q.points,
          options: optionsData
            .filter((opt: any) => opt.questionId === q.question.id)
            .map((opt: any) => ({
              id: opt.id,
              questionId: opt.questionId,
              text: opt.text,
              isCorrect: guestCompleted ? opt.isCorrect : undefined,
            })),
        }));

        setQuestions(mergedQuestions);

        // Calculate total points
        const total = mergedQuestions.reduce((sum: number, q: any) => sum + q.points, 0);
        attemptObj.totalPoints = total;

        // If completed, preserve the earned points from state
        if (guestCompleted && attempt) {
          attemptObj.earnedPoints = attempt.earnedPoints;
        }

        setAttempt(attemptObj);
      } else {
        // Authenticated mode - fetch from API
        const attemptRes = await fetchWithAuth(`/api/attempts/${id}`);
        if (!attemptRes.ok) throw new Error('Failed to fetch attempt');
        const attemptData = await attemptRes.json();
        setAttempt(attemptData);

        // Populate initial answers map
        const initialAnswers: Record<number, UserAnswer> = {};
        if (attemptData.answers) {
          attemptData.answers.forEach((ans: UserAnswer) => {
            initialAnswers[ans.topicQuestionId] = ans;
          });
        }
        setAnswersMap(initialAnswers);

        // Fetch Questions for Topic
        const questionsRes = await fetchWithAuth(`/api/topics/${attemptData.topicId}/questions`);
        if (!questionsRes.ok) throw new Error('Failed to fetch questions');
        const questionsData = await questionsRes.json();

        // Fetch Answers (Options) for Topic
        const optionsRes = await fetchWithAuth(`/api/topics/${attemptData.topicId}/answers`);
        if (!optionsRes.ok) throw new Error('Failed to fetch options');
        const optionsData = await optionsRes.json();

        // Merge Questions and Options
        const mergedQuestions = questionsData.map((q: any) => ({
          id: q.id,
          questionId: q.question.id,
          text: q.question.text,
          type: q.question.type,
          points: q.points,
          options: optionsData
            .filter((opt: any) => opt.questionId === q.question.id)
            .map((opt: any) => ({
              id: opt.id,
              questionId: opt.questionId,
              text: opt.text,
              isCorrect: attemptData.isCompleted ? opt.isCorrect : undefined,
            })),
        }));

        setQuestions(mergedQuestions);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [id, topicId, isGuestMode, guestCompleted, fetchWithAuth]);

  useEffect(() => {
    if (isGuestMode || accessToken) {
      fetchAttemptData();
    } else if (!user) {
      // Redirect to login if not guest mode and no user
    }
  }, [accessToken, fetchAttemptData, user, isGuestMode]);

  const handleAnswerChange = (questionId: number, value: string | number, isChecked?: boolean) => {
    if (attempt?.isCompleted) return;

    setAnswersMap((prev) => {
      const current = prev[questionId] || { topicQuestionId: questionId };
      let updated: UserAnswer;

      // Find question type to know how to update
      const question = questions.find((q) => q.id === questionId);
      if (!question) return prev;

      if (question.type === 'fill_blank') {
        updated = { ...current, userAnswerText: String(value), answerIds: [] };
      } else if (question.type === 'multi') {
        // For multi-select, toggle the answer in the array
        const currentIds = current.answerIds || [];
        const answerId = Number(value);

        let newIds: number[];
        if (isChecked) {
          // Add if not already present
          newIds = currentIds.includes(answerId) ? currentIds : [...currentIds, answerId];
        } else {
          // Remove if present
          newIds = currentIds.filter((id) => id !== answerId);
        }

        updated = { ...current, answerIds: newIds, userAnswerText: null };
      } else {
        // For single, true_false, value is single answerId
        updated = { ...current, answerIds: [Number(value)], userAnswerText: null };
      }

      return { ...prev, [questionId]: updated };
    });
  };

  const submitAnswer = async (questionId: number, answerIds: number[] = [], userAnswerText: string | null = null) => {
    if (answerIds.length === 0 && !userAnswerText) return;

    // For guest mode, answers are only stored in local state
    if (isGuestMode) return;

    try {
      const res = await fetchWithAuth(`/api/attempts/${id}/answers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topicQuestionId: questionId,
          answerIds: answerIds,
          userAnswerText: userAnswerText,
        }),
      });

      if (!res.ok) {
        console.error('Failed to save answer');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleFinishClick = () => {
    setIsSubmitModalOpen(true);
  };

  const confirmFinish = async () => {
    setIsSubmitModalOpen(false);
    setSubmitting(true);
    try {
      if (isGuestMode) {
        // For guest mode, fetch correct answers and calculate score locally
        if (!topicId) return;

        // Fetch correct answers from API
        const optionsRes = await fetch(`/api/topics/${topicId}/answers`);
        if (!optionsRes.ok) throw new Error('Failed to fetch options');
        const optionsData = await optionsRes.json();

        let earnedPoints = 0;
        const updatedAnswers: Record<number, UserAnswer> = { ...answersMap };

        questions.forEach((q) => {
          const userAnswer = answersMap[q.id];
          if (!userAnswer) return;

          // Get correct options for this question
          const correctOptions = optionsData.filter((opt: any) => opt.questionId === q.questionId && opt.isCorrect);

          if (q.type === 'fill_blank' && userAnswer.userAnswerText) {
            // Check if text answer matches any correct option
            const isCorrect = correctOptions.some(
              (opt: any) => opt.text.toLowerCase().trim() === userAnswer.userAnswerText?.toLowerCase().trim()
            );
            if (isCorrect) {
              earnedPoints += q.points;
            }
            updatedAnswers[q.id] = { ...userAnswer, isCorrect };
          } else if (userAnswer.answerIds && userAnswer.answerIds.length > 0) {
            const correctAnswerIds = correctOptions.map((opt: any) => opt.id);

            let isCorrect = false;
            if (q.type === 'multi') {
              // Multi-select: exact match required
              const selectedSet = new Set(userAnswer.answerIds);
              const correctSet = new Set(correctAnswerIds);
              isCorrect = selectedSet.size === correctSet.size && [...selectedSet].every((id) => correctSet.has(id));
            } else {
              // Single-select: check if selected answer is in correct answers
              isCorrect = correctAnswerIds.includes(userAnswer.answerIds[0]);
            }

            if (isCorrect) {
              earnedPoints += q.points;
            }
            updatedAnswers[q.id] = { ...userAnswer, isCorrect };
          }
        });

        // Update all answers at once
        setAnswersMap(updatedAnswers);

        setAttempt((prev) =>
          prev
            ? {
                ...prev,
                isCompleted: true,
                earnedPoints,
              }
            : null
        );
        setGuestCompleted(true);
      } else {
        // Authenticated mode
        const res = await fetchWithAuth(`/api/attempts/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ isCompleted: true }),
        });

        if (!res.ok) throw new Error('Failed to complete attempt');

        // Refresh data to show results
        await fetchAttemptData();
      }

      window.scrollTo(0, 0);
    } catch (err) {
      alert('Error finishing test');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;
  if (error) return <div className="text-center text-red-500 py-12">{error}</div>;
  if (!attempt) return null;

  const isReview = attempt.isCompleted;

  // Handle case when there are no questions
  if (questions.length === 0) {
    return (
      <div className="max-w-3xl mx-auto pb-12">
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <BookOpen className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Questions Available</h2>
          <p className="text-gray-500 mb-6">This topic doesn&apos;t have any questions yet. Please check back later.</p>
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Topics
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <div className="mb-8 flex items-center justify-between">
        {isReview && (
          <div className="text-2xl font-bold text-gray-900">
            Score:{' '}
            <span className={attempt.earnedPoints >= attempt.totalPoints / 2 ? 'text-green-600' : 'text-red-600'}>
              {attempt.earnedPoints} / {attempt.totalPoints}
            </span>
          </div>
        )}
      </div>

      <div className="space-y-8">
        {questions.map((q, index) => {
          const userAnswer = answersMap[q.id];
          const isCorrect = userAnswer?.isCorrect; // Only available if review

          // Find correct answers for display in review mode
          const correctOptions = isReview ? q.options.filter((opt) => opt.isCorrect) : [];
          const correctAnswerText =
            correctOptions.length > 0 ? correctOptions.map((opt) => opt.text).join(', ') : 'N/A';

          return (
            <div
              key={q.id}
              className={`bg-white shadow rounded-lg p-6 border-l-4 ${
                isReview ? (isCorrect ? 'border-green-500' : 'border-red-500') : 'border-primary-500'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {index + 1}. {q.text}
                </h3>
                <span className="text-sm text-gray-500 font-medium">{q.points} pts</span>
              </div>

              <div className="space-y-3">
                {q.type === 'fill_blank' ? (
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={userAnswer?.userAnswerText || ''}
                    onChange={(e) => {
                      handleAnswerChange(q.id, e.target.value);
                    }}
                    onBlur={(e) => submitAnswer(q.id, [], e.target.value)}
                    disabled={isReview}
                    placeholder="Type your answer..."
                  />
                ) : (
                  q.options.map((opt) => {
                    const isSelected = userAnswer?.answerIds?.includes(opt.id) || false;

                    return (
                      <label
                        key={opt.id}
                        className={`flex items-center p-3 rounded-md border ${
                          isSelected ? 'bg-primary-50 border-primary-200' : 'border-gray-200 hover:bg-gray-50'
                        } cursor-pointer`}
                      >
                        <input
                          type={q.type === 'multi' ? 'checkbox' : 'radio'}
                          name={`question-${q.id}`}
                          value={opt.id}
                          checked={isSelected}
                          onChange={(e) => {
                            if (q.type === 'multi') {
                              handleAnswerChange(q.id, opt.id, e.target.checked);
                            } else {
                              handleAnswerChange(q.id, opt.id);
                              // For radio, auto submit
                              submitAnswer(q.id, [opt.id], null);
                            }
                          }}
                          onBlur={() => {
                            // For multi-select, submit on blur to save selections
                            if (q.type === 'multi') {
                              const currentAnswerIds = answersMap[q.id]?.answerIds || [];
                              submitAnswer(q.id, currentAnswerIds, null);
                            }
                          }}
                          disabled={isReview}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                        />
                        <span className="ml-3 text-gray-700">{opt.text}</span>
                      </label>
                    );
                  })
                )}
              </div>

              {isReview && !isCorrect && (
                <div className="mt-4 space-y-2">
                  <div className="p-3 bg-red-50 text-red-700 rounded-md flex items-center">
                    <XCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                    <span>Incorrect</span>
                  </div>
                  {q.type === 'fill_blank' && correctOptions.length > 0 && (
                    <div className="p-3 bg-green-50 text-green-700 rounded-md">
                      <p className="font-medium mb-1">Correct answer(s):</p>
                      <p>{correctAnswerText}</p>
                    </div>
                  )}
                  {q.type !== 'fill_blank' && correctOptions.length > 0 && (
                    <div className="p-3 bg-green-50 text-green-700 rounded-md">
                      <p className="font-medium mb-1">Correct answer(s):</p>
                      <p>{correctAnswerText}</p>
                    </div>
                  )}
                </div>
              )}
              {isReview && isCorrect && (
                <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <span>Correct</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!isReview && (
        <div className="mt-8 flex justify-end">
          <Button size="lg" onClick={handleFinishClick} isLoading={submitting}>
            Submit Test
          </Button>
        </div>
      )}

      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title="Finish Test"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsSubmitModalOpen(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={confirmFinish} isLoading={submitting} className="w-full sm:w-auto">
              Yes, Submit
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-500">
          Are you sure you want to finish the test? You cannot change your answers after submitting.
        </p>
      </Modal>
    </div>
  );
}
