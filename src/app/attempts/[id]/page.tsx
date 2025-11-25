'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { Button } from '@/components/ui/Button';
import { Loader } from '@/components/ui/Loader';
import { Modal } from '@/components/ui/Modal';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
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
  answerId?: number | null;
  userAnswerText?: string | null;
  isCorrect?: boolean;
}

export default function AttemptPage() {
  const { id } = useParams();
  const { accessToken, user } = useAuth();
  const fetchWithAuth = useAuthenticatedFetch();

  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answersMap, setAnswersMap] = useState<Record<number, UserAnswer>>({});
  const [submitting, setSubmitting] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  const fetchAttemptData = useCallback(async () => {
    try {
      // 1. Fetch Attempt
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

      // 2. Fetch Questions for Topic
      const questionsRes = await fetchWithAuth(`/api/topics/${attemptData.topicId}/questions`);
      if (!questionsRes.ok) throw new Error('Failed to fetch questions');
      const questionsData = await questionsRes.json();

      // 3. Fetch Answers (Options) for Topic
      const optionsRes = await fetchWithAuth(`/api/topics/${attemptData.topicId}/answers`);
      if (!optionsRes.ok) throw new Error('Failed to fetch options');
      const optionsData = await optionsRes.json();

      // 4. Merge Questions and Options
      const mergedQuestions = questionsData.map((q: any) => ({
        id: q.id, // This is the linkId (topicQuestionId)
        questionId: q.question.id,
        text: q.question.text,
        type: q.question.type,
        points: q.points,
        options: optionsData.filter((opt: any) => opt.questionId === q.question.id),
      }));

      setQuestions(mergedQuestions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [id, fetchWithAuth]);

  useEffect(() => {
    if (accessToken) {
      fetchAttemptData();
    } else if (!user) {
        // Redirect to login if no user (since attempt requires auth)
        // But wait, useEffect runs on mount.
    }
  }, [accessToken, fetchAttemptData, user]);


  const handleAnswerChange = (questionId: number, value: string | number) => {
    if (attempt?.isCompleted) return;

    setAnswersMap((prev) => {
        const current = prev[questionId] || { topicQuestionId: questionId };
        let updated: UserAnswer;

        // Find question type to know how to update
        const question = questions.find(q => q.id === questionId);
        if (!question) return prev;

        if (question.type === 'fill_blank') {
             updated = { ...current, userAnswerText: String(value), answerId: null };
        } else {
            // For single, multi, true_false, value is answerId
             updated = { ...current, answerId: Number(value), userAnswerText: null };
        }
        
        return { ...prev, [questionId]: updated };
    });
  };

  const submitAnswer = async (questionId: number, answerId: number | null = null, userAnswerText: string | null = null) => {
    if (!answerId && !userAnswerText) return;

    try {
        const res = await fetchWithAuth(`/api/attempts/${id}/answers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                topicQuestionId: questionId,
                answerId: answerId,
                userAnswerText: userAnswerText,
            }),
        });
        
        if (!res.ok) {
            console.error("Failed to save answer");
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

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <div className="mb-8 flex items-center justify-between">
        <Link href="/dashboard" className="text-indigo-600 flex items-center">
           <ArrowLeft className="h-4 w-4 mr-1" /> Dashboard
        </Link>
        {isReview && (
             <div className="text-2xl font-bold text-gray-900">
                 Score: <span className={attempt.earnedPoints >= attempt.totalPoints / 2 ? 'text-green-600' : 'text-red-600'}>
                     {attempt.earnedPoints} / {attempt.totalPoints}
                 </span>
             </div>
        )}
      </div>

      <div className="space-y-8">
        {questions.map((q, index) => {
           const userAnswer = answersMap[q.id];
           const isCorrect = userAnswer?.isCorrect; // Only available if review
           
           // Determine correct answer text for review
           // Note: logic kept from previous version
           
           return (
             <div key={q.id} className={`bg-white shadow rounded-lg p-6 border-l-4 ${
                 isReview 
                    ? isCorrect ? 'border-green-500' : 'border-red-500'
                    : 'border-indigo-500'
             }`}>
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
                            onBlur={(e) => submitAnswer(q.id, q.options[0].id, e.target.value)}
                            disabled={isReview}
                            placeholder="Type your answer..."
                        />
                    ) : (
                        q.options.map(opt => (
                            <label key={opt.id} className={`flex items-center p-3 rounded-md border ${
                                userAnswer?.answerId === opt.id 
                                    ? 'bg-indigo-50 border-indigo-200' 
                                    : 'border-gray-200 hover:bg-gray-50'
                            } cursor-pointer`}>
                                <input 
                                    type={q.type === 'multi' ? 'checkbox' : 'radio'}
                                    name={`question-${q.id}`}
                                    value={opt.id}
                                    checked={userAnswer?.answerId === opt.id}
                                    onChange={() => {
                                        handleAnswerChange(q.id, opt.id);
                                        // For radio, auto submit
                                        if (q.type !== 'multi') {
                                          submitAnswer(q.id, opt.id, null);
                                        }
                                    }}
                                    disabled={isReview}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                />
                                <span className="ml-3 text-gray-700">{opt.text}</span>
                            </label>
                        ))
                    )}
                </div>

                {isReview && !isCorrect && (
                    <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md flex items-center">
                        <XCircle className="h-5 w-5 mr-2" />
                        <span>Incorrect</span>
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
