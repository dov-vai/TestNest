'use client';

import React, { useState, useEffect } from 'react';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Plus, Trash2, Check, Loader } from 'lucide-react';

interface Answer {
  id?: number;
  text: string;
  isCorrect: boolean;
  orderIdx: number;
}

interface EditQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  questionId: number | null;
}

export const EditQuestionModal: React.FC<EditQuestionModalProps> = ({ isOpen, onClose, onSuccess, questionId }) => {
  const fetchWithAuth = useAuthenticatedFetch();
  const [formLoading, setFormLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState('single');
  const [isPrivate, setIsPrivate] = useState(false);

  // Answers management
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [newAnswerText, setNewAnswerText] = useState('');

  // True/False specific
  const [trueFalseAnswer, setTrueFalseAnswer] = useState<boolean>(true);

  // Load question data when modal opens
  useEffect(() => {
    if (isOpen && questionId) {
      loadQuestionData();
    }
  }, [isOpen, questionId]);

  const loadQuestionData = async () => {
    if (!questionId) return;
    setDataLoading(true);
    try {
      // Fetch question details
      const qRes = await fetchWithAuth(`/api/questions/${questionId}`);
      if (!qRes.ok) throw new Error('Failed to fetch question');
      const question = await qRes.json();

      setQuestionText(question.text);
      setQuestionType(question.type);
      setIsPrivate(question.isPrivate);

      // Fetch answers
      const aRes = await fetchWithAuth(`/api/questions/${questionId}/answers`);
      if (!aRes.ok) throw new Error('Failed to fetch answers');
      const answersData = await aRes.json();

      if (question.type === 'true_false') {
        const trueAnswer = answersData.find((a: Answer) => a.text === 'True');
        setTrueFalseAnswer(trueAnswer?.isCorrect ?? true);
      }

      setAnswers(answersData);
    } catch (e) {
      console.error(e);
      alert('Failed to load question data');
    } finally {
      setDataLoading(false);
    }
  };

  const resetForm = () => {
    setQuestionText('');
    setQuestionType('single');
    setIsPrivate(false);
    setAnswers([]);
    setNewAnswerText('');
    setTrueFalseAnswer(true);
  };

  const addAnswer = () => {
    if (!newAnswerText.trim()) return;

    const newAnswer: Answer = {
      text: newAnswerText,
      isCorrect: questionType === 'single' ? answers.length === 0 : questionType === 'fill_blank',
      orderIdx: answers.length,
    };

    setAnswers([...answers, newAnswer]);
    setNewAnswerText('');
  };

  const removeAnswer = (index: number) => {
    setAnswers(answers.filter((_, i) => i !== index));
  };

  const toggleCorrect = (index: number) => {
    if (questionType === 'single') {
      // For single choice, only one can be correct
      setAnswers(
        answers.map((ans, i) => ({
          ...ans,
          isCorrect: i === index,
        }))
      );
    } else if (questionType === 'multi') {
      // For multiple choice, toggle the clicked one
      setAnswers(answers.map((ans, i) => (i === index ? { ...ans, isCorrect: !ans.isCorrect } : ans)));
    }
  };

  const isFormValid = () => {
    if (!questionText.trim()) return false;

    if (questionType === 'true_false') {
      return true;
    } else if (questionType === 'fill_blank') {
      return answers.length === 1;
    } else {
      // Single and multi choice
      if (answers.length < 2) return false;
      const hasCorrect = answers.some((ans) => ans.isCorrect);
      return hasCorrect;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!questionId) return;

    setFormLoading(true);
    try {
      // Update question
      const qRes = await fetchWithAuth(`/api/questions/${questionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: questionText,
          type: questionType,
          isPrivate,
        }),
      });

      if (!qRes.ok) throw new Error('Failed to update question');

      // Delete all existing answers
      const existingAnswers = await fetchWithAuth(`/api/questions/${questionId}/answers`);
      const existingAnswersData = await existingAnswers.json();
      for (const answer of existingAnswersData) {
        await fetchWithAuth(`/api/answers/${answer.id}`, { method: 'DELETE' });
      }

      // Create new answers based on question type
      if (questionType === 'true_false') {
        await fetchWithAuth('/api/answers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questionId: questionId,
            text: 'True',
            isCorrect: trueFalseAnswer === true,
            orderIdx: 0,
          }),
        });

        await fetchWithAuth('/api/answers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questionId: questionId,
            text: 'False',
            isCorrect: trueFalseAnswer === false,
            orderIdx: 1,
          }),
        });
      } else {
        // Create all other answers
        for (const answer of answers) {
          await fetchWithAuth('/api/answers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              questionId: questionId,
              text: answer.text,
              isCorrect: answer.isCorrect,
              orderIdx: answer.orderIdx,
            }),
          });
        }
      }

      resetForm();
      onSuccess();
      onClose();
    } catch (e) {
      console.error(e);
      alert('Failed to update question');
    } finally {
      setFormLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Question">
      {dataLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Question Text"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            required
            placeholder="Enter your question..."
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Question Type</label>
            <select
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={questionType}
              disabled
            >
              <option value="single">Single Choice</option>
              <option value="multi">Multiple Choice</option>
              <option value="true_false">True/False</option>
              <option value="fill_blank">Fill in Blank</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Question type cannot be changed after creation</p>
          </div>

          {/* True/False Specific UI */}
          {questionType === 'true_false' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Correct Answer</label>
              <div className="flex gap-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="trueFalse"
                    checked={trueFalseAnswer === true}
                    onChange={() => setTrueFalseAnswer(true)}
                    className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <span className="text-sm text-gray-700">True</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="trueFalse"
                    checked={trueFalseAnswer === false}
                    onChange={() => setTrueFalseAnswer(false)}
                    className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <span className="text-sm text-gray-700">False</span>
                </label>
              </div>
            </div>
          )}

          {/* Answer Management for Single, Multi, and Fill Blank */}
          {questionType !== 'true_false' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {questionType === 'fill_blank' ? 'Answer (only one allowed)' : 'Answers'}{' '}
                {questionType === 'multi' && '(select multiple correct answers)'}
              </label>

              {/* Add Answer Input */}
              {(questionType !== 'fill_blank' || answers.length === 0) && (
                <div className="flex gap-2 mb-3">
                  <Input
                    value={newAnswerText}
                    onChange={(e) => setNewAnswerText(e.target.value)}
                    placeholder="Type answer text..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addAnswer();
                      }
                    }}
                  />
                  <Button type="button" onClick={addAnswer} variant="outline" className="flex-shrink-0">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Answers List */}
              <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-md p-2">
                {answers.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No answers added yet. Add {questionType === 'fill_blank' ? '1 answer' : 'at least 2 answers'}.
                  </p>
                ) : (
                  answers.map((answer, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-2 p-2 rounded border ${
                        answer.isCorrect ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'
                      }`}
                    >
                      {/* Correct Marker */}
                      {questionType === 'single' ? (
                        <input
                          type="radio"
                          name="correctAnswer"
                          checked={answer.isCorrect}
                          onChange={() => toggleCorrect(index)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 cursor-pointer"
                        />
                      ) : questionType === 'multi' ? (
                        <input
                          type="checkbox"
                          checked={answer.isCorrect}
                          onChange={() => toggleCorrect(index)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                        />
                      ) : null}

                      {/* Answer Text */}
                      <span className="flex-1 text-sm text-gray-900">{answer.text}</span>

                      {/* Correct Badge */}
                      {answer.isCorrect && (
                        <span className="flex items-center text-xs text-green-600 font-medium">
                          <Check className="h-3 w-3 mr-1" /> Correct
                        </span>
                      )}

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => removeAnswer(index)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {questionType === 'fill_blank' && answers.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">Add 1 answer</p>
              )}
              {questionType !== 'fill_blank' && answers.length < 2 && (
                <p className="text-xs text-gray-500 mt-1">Add at least 2 answers for choice questions</p>
              )}
            </div>
          )}

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPrivate"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="isPrivate" className="ml-2 block text-sm text-gray-700">
              Make this question private
            </label>
          </div>

          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-2">
            <Button type="submit" isLoading={formLoading} disabled={!isFormValid()} className="w-full sm:w-auto">
              Update Question
            </Button>
            <Button type="button" variant="outline" onClick={handleClose} className="w-full sm:w-auto">
              Cancel
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
