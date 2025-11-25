'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Loader } from '@/components/ui/Loader';
import { Plus, Trash2 } from 'lucide-react';

interface Question {
  id: number;
  text: string;
  type: string;
  isPrivate: boolean;
  userId: number;
}

export const MyQuestionsTab = () => {
  const { user } = useAuth();
  const fetchWithAuth = useAuthenticatedFetch();

  const fetcher = (url: string) => fetchWithAuth(url).then(res => res.json());

  const { data, error, isLoading, mutate } = useSWR(
    user ? '/api/questions' : null, 
    fetcher
  );

  const questions: Question[] = data ? data.filter((q: Question) => q.userId === user?.id) : [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [qForm, setQForm] = useState({ text: '', type: 'single', isPrivate: false });
  const [answerText, setAnswerText] = useState('');

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const qRes = await fetchWithAuth('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(qForm),
      });
      
      if (!qRes.ok) throw new Error('Failed to create question');
      const newQ = await qRes.json();

      if (answerText) {
         await fetchWithAuth('/api/answers', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({
                 questionId: newQ.id,
                 text: answerText,
                 isCorrect: true,
                 orderIdx: 0
             })
         });
      }

      mutate(); // Refresh the list automatically
      setIsModalOpen(false);
      setQForm({ text: '', type: 'single', isPrivate: false });
      setAnswerText('');
    } catch (e) {
      alert('Failed to create question');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteQuestion = async (id: number) => {
    if (!confirm('Delete this question?')) return;
    try {
      await fetchWithAuth(`/api/questions/${id}`, { method: 'DELETE' });
      mutate();
    } catch (e) {
      alert('Failed to delete');
    }
  };

  if (isLoading) return <Loader />;
  if (error) return <div>Error loading questions</div>;

  return (
    <div>
      <div className="mb-6 flex justify-end">
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-5 w-5" /> Create Question
        </Button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {questions.length === 0 ? (
             <li className="px-4 py-4 text-center text-gray-500">No questions found.</li>
          ) : (
            questions.map(q => (
              <li key={q.id} className="px-4 py-4 sm:px-6 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <p className="text-sm font-medium text-indigo-600">{q.text}</p>
                  <p className="text-xs text-gray-500">Type: {q.type}</p>
                </div>
                <button onClick={() => handleDeleteQuestion(q.id)} className="text-red-600 hover:text-red-800">
                  <Trash2 className="h-5 w-5" />
                </button>
              </li>
            ))
          )}
        </ul>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Question"
      >
        <form onSubmit={handleCreateQuestion} className="space-y-4">
           <Input 
             label="Question Text"
             value={qForm.text}
             onChange={e => setQForm({...qForm, text: e.target.value})}
             required
           />
           
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
             <select 
               className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
               value={qForm.type}
               onChange={e => setQForm({...qForm, type: e.target.value})}
             >
               <option value="single">Single Choice</option>
               <option value="multi">Multiple Choice</option>
               <option value="true_false">True/False</option>
               <option value="fill_blank">Fill in Blank</option>
             </select>
           </div>

           <Input 
             label="Correct Answer (Quick Add)"
             placeholder="Enter the correct answer text"
             value={answerText}
             onChange={e => setAnswerText(e.target.value)}
           />

           <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
             <Button type="submit" isLoading={formLoading} className="w-full sm:ml-3 sm:w-auto">Create</Button>
             <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="mt-3 w-full sm:mt-0 sm:w-auto">Cancel</Button>
           </div>
        </form>
      </Modal>
    </div>
  );
};