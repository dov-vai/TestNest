'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useCallback } from 'react';

export function useAuthenticatedFetch() {
  const { accessToken, refreshAccessToken, logout } = useAuth();

  return useCallback(async (input: RequestInfo | URL, init?: RequestInit) => {
    let token = accessToken;

    // Helper to make request
    const makeRequest = async (currentToken: string | null) => {
      const headers: HeadersInit = {
        ...init?.headers,
      };

      if (currentToken) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${currentToken}`;
      }

      return fetch(input, {
        ...init,
        headers,
      });
    };

    let response = await makeRequest(token);

    // If unauthorized, try refreshing token
    if (response.status === 401) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        // Get the new token from localStorage directly since state update might not have propagated
        const newToken = localStorage.getItem('accessToken');
        response = await makeRequest(newToken);
      } else {
         // If refresh failed, logout is handled by refreshAccessToken, but we can force it or let caller handle it.
         // refreshAccessToken in AuthContext already calls logout() on failure.
      }
    }

    return response;
  }, [accessToken, refreshAccessToken, logout]);
}

