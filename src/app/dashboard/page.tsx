'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Loader } from '@/components/ui/Loader';
import { FileText, History, HelpCircle } from 'lucide-react';
import { MyTopicsTab } from '@/components/dashboard/MyTopicsTab';
import { MyAttemptsTab } from '@/components/dashboard/MyAttemptsTab';
import { MyQuestionsTab } from '@/components/dashboard/MyQuestionsTab';

export default function DashboardPage() {
  const { user, accessToken } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'topics' | 'attempts' | 'questions'>('topics');

  useEffect(() => {
    if (!user && !accessToken) {
        router.push('/login');
    }
  }, [user, accessToken, router]);

  if (!user) return <Loader />;

  return (
    <div>
      <div className="mb-8 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('topics')}
            className={`${
              activeTab === 'topics'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <FileText className="mr-2 h-5 w-5" />
            My Topics
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`${
              activeTab === 'questions'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <HelpCircle className="mr-2 h-5 w-5" />
            My Questions
          </button>
          <button
            onClick={() => setActiveTab('attempts')}
            className={`${
              activeTab === 'attempts'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <History className="mr-2 h-5 w-5" />
            My Attempts
          </button>
        </nav>
      </div>


      {activeTab === 'topics' && <MyTopicsTab />}

      {activeTab === 'questions' && <MyQuestionsTab />}

      {activeTab === 'attempts' && <MyAttemptsTab />}
    </div>
  );
}