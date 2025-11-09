'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import UserProfile from './UserProfile';
import TokenDebugger from './TokenDebugger';

export default function AuthShowcase() {
  const { user, hasInitialized } = useAuth();
  const [showRegister, setShowRegister] = useState(false);

  if (!hasInitialized) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex flex-col gap-4 items-center w-full">
        <UserProfile />
        <TokenDebugger />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 items-center w-full">
      {showRegister ? <RegisterForm /> : <LoginForm />}

      <div className="text-center">
        <button
          onClick={() => setShowRegister(!showRegister)}
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          {showRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
        </button>
      </div>
    </div>
  );
}
