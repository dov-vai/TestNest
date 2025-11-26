'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X, LogOut, User, Bird } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function Header() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const getDesktopLinkClass = (path: string) => {
    const baseClass = 'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors';
    const activeClass = 'border-indigo-500 text-gray-900';
    const inactiveClass = 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700';

    return pathname === path ? `${baseClass} ${activeClass}` : `${baseClass} ${inactiveClass}`;
  };

  const getMobileLinkClass = (path: string) => {
    const baseClass = 'block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors';
    const activeClass = 'bg-indigo-50 border-indigo-500 text-indigo-700';
    const inactiveClass = 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700';

    return pathname === path ? `${baseClass} ${activeClass}` : `${baseClass} ${inactiveClass}`;
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center gap-2 text-indigo-600 font-bold text-xl">
                <Bird className="h-8 w-8" />
                TestNest
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link href="/tests" className={getDesktopLinkClass('/tests')}>
                Tests
              </Link>
              {user && (
                <Link href="/dashboard" className={getDesktopLinkClass('/dashboard')}>
                  My Dashboard
                </Link>
              )}
              {user && user.role === 'admin' && (
                <Link href="/admin" className={getDesktopLinkClass('/admin')}>
                  Admin
                </Link>
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-700">Hi, {user.name || user.email}</span>
                <Button variant="outline" size="sm" onClick={logout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden border-t border-gray-200">
          <div className="pt-2 pb-3 space-y-1">
            <Link href="/tests" onClick={() => setIsMenuOpen(false)} className={getMobileLinkClass('/tests')}>
              Tests
            </Link>
            {user && (
              <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} className={getMobileLinkClass('/dashboard')}>
                My Dashboard
              </Link>
            )}
            {user && user.role === 'admin' && (
              <Link href="/admin" onClick={() => setIsMenuOpen(false)} className={getMobileLinkClass('/admin')}>
                Admin
              </Link>
            )}
          </div>
          <div className="pt-4 pb-4 border-t border-gray-200">
            {user ? (
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <User className="h-8 w-8 rounded-full bg-gray-100 p-1 text-gray-600" />
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">{user.name || 'User'}</div>
                  <div className="text-sm font-medium text-gray-500">{user.email}</div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="ml-auto flex-shrink-0 bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <LogOut className="h-6 w-6" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 px-4">
                <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-center">
                    Login
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="primary" className="w-full justify-center">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
