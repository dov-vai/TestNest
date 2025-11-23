import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Plus, Trash2 } from 'lucide-react';

interface Question {
  id: number;
  text: string;
  type: string;
  isPrivate: boolean;
  userId: number;
}

export const MyQuestionsTab = () => {
  const { accessToken, user } = useAuth();
  const fetchWithAuth = useAuthenticatedFetch();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  
  // Simplified Question Form (Just text and type for now, adding answers would require nested form)
  const [qForm, setQForm] = useState({ text: '', type: 'single', isPrivate: false });
  // To properly add answers, we'd need:
  // 1. Create Question -> returns ID
  // 2. Create Answers using ID
  // For this demo, I'll just create the question shell. 
  // Or I can add a simple "Correct Answer" and "Wrong Answers" input and handle multiple API calls.
  const [answerText, setAnswerText] = useState('');

  const fetchQuestions = async () => {
    try {
      const res = await fetchWithAuth('/api/questions');
      const data = await res.json();
      // Filter for my questions (assuming API returns all public + my private, but we want only MINE)
      // The API listQuestions returns all unless filtered?
      // Let's assume we filter by userId on client for now.
      if (user) {
        setQuestions(data.filter((q: Question) => q.userId === user.id));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) fetchQuestions();
  }, [accessToken]);

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      // 1. Create Question
      const qRes = await fetchWithAuth('/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(qForm),
      });
      
      if (!qRes.ok) throw new Error('Failed to create question');
      const newQ = await qRes.json();

      // 2. Add Answer (Optional for demo, but good to have at least one)
      if (answerText) {
         await fetchWithAuth('/api/answers', {
             method: 'POST',
             headers: {
                 'Content-Type': 'application/json',
             },
             body: JSON.stringify({
                 questionId: newQ.id,
                 text: answerText,
                 isCorrect: true, // Assume correct for the quick-add
                 orderIdx: 0
             })
         });
      }

      fetchQuestions();
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
      await fetchWithAuth(`/api/questions/${id}`, {
        method: 'DELETE',
      });
      setQuestions(prev => prev.filter(q => q.id !== id));
    } catch (e) {
      alert('Failed to delete');
    }
  };

  if (loading) return <div>Loading questions...</div>;

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
             // Note: This is a simplified way to add ONE answer. Real UI would allow adding multiple options.
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

