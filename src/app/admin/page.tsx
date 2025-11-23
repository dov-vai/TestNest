'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { UserManagement } from '@/components/admin/UserManagement';
import { AdminTopicManagement } from '@/components/admin/AdminTopicManagement';
import { Users, BookOpen } from 'lucide-react';

export default function AdminDashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'users' | 'topics'>('users');

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== 'admin') {
    return <div className="p-8 text-center">Loading admin access...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500">Manage users and content across the platform.</p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('users')}
            className={`${
              activeTab === 'users'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <Users className="mr-2 h-5 w-5" />
            User Management
          </button>
          <button
            onClick={() => setActiveTab('topics')}
            className={`${
              activeTab === 'topics'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <BookOpen className="mr-2 h-5 w-5" />
            Topic Management
          </button>
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === 'users' ? <UserManagement /> : <AdminTopicManagement />}
      </div>
    </div>
  );
}

