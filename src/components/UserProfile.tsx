'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function UserProfile() {
  const { user, logout, refreshAccessToken } = useAuth();

  if (!user) return null;

  return (
    <div className="flex flex-col gap-4 w-full max-w-md p-6 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800/50">
      <h2 className="text-2xl font-bold text-center">Welcome!</h2>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-sm text-gray-600 dark:text-gray-400">Name:</span>
          <span className="text-lg font-semibold">{user.name || 'Not provided'}</span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-sm text-gray-600 dark:text-gray-400">Email:</span>
          <span className="text-lg font-semibold">{user.email}</span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-sm text-gray-600 dark:text-gray-400">Role:</span>
          <span className="text-lg font-semibold capitalize">{user.role}</span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
          <span
            className={`text-lg font-semibold ${user.isActive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
          >
            {user.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-sm text-gray-600 dark:text-gray-400">Member since:</span>
          <span className="text-lg font-semibold">{new Date(user.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <button
          onClick={() => refreshAccessToken()}
          className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          Refresh Token
        </button>
        <button
          onClick={logout}
          className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
