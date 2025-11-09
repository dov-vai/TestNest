'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

export default function TokenDebugger() {
  const { accessToken } = useAuth();
  const [showToken, setShowToken] = useState(false);

  if (!accessToken) return null;

  // Decode JWT to show payload (for demo purposes only - don't do this in production!)
  const decodeJWT = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      return null;
    }
  };

  const payload = decodeJWT(accessToken);
  const expiresAt = payload?.exp ? new Date(payload.exp * 1000).toLocaleString() : 'Unknown';
  const issuedAt = payload?.iat ? new Date(payload.iat * 1000).toLocaleString() : 'Unknown';

  return (
    <div className="w-full max-w-md p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900/50 text-xs">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-sm">Token Debug Info</h3>
        <button
          onClick={() => setShowToken(!showToken)}
          className="text-blue-600 dark:text-blue-400 hover:underline text-xs"
        >
          {showToken ? 'Hide' : 'Show'} Token
        </button>
      </div>

      <div className="space-y-1 text-gray-700 dark:text-gray-300">
        <div>
          <span className="font-medium">Type:</span> {payload?.type || 'Unknown'}
        </div>
        <div>
          <span className="font-medium">User ID:</span> {payload?.userId || 'Unknown'}
        </div>
        <div>
          <span className="font-medium">Role:</span>{' '}
          <span className="capitalize font-semibold text-blue-600 dark:text-blue-400">
            {payload?.role || 'Unknown'}
          </span>
        </div>
        <div>
          <span className="font-medium">Email:</span> {payload?.email || 'Unknown'}
        </div>
        <div>
          <span className="font-medium">Issued:</span> {issuedAt}
        </div>
        <div>
          <span className="font-medium">Expires:</span> {expiresAt}
        </div>
      </div>

      {showToken && (
        <div className="mt-3 p-2 bg-black/5 dark:bg-white/5 rounded break-all font-mono text-[10px]">{accessToken}</div>
      )}
    </div>
  );
}
