'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getUser, removeAuth } from '@/lib/auth';

export default function ChatHeader() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
    setUser(getUser());
  }, []);

  const handleLogout = () => {
    removeAuth();
    setIsLoggedIn(false);
    setUser(null);
    router.push('/');
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-xl border-b border-gray-800/50 shadow-lg"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 md:h-18">
          <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              whileHover={{ scale: 1.05 }}
              className="relative"
            >
              <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <span className="text-white text-lg md:text-xl font-bold">L</span>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900 animate-pulse" />
            </motion.div>
            <div className="hidden sm:block">
              <h1 className="text-lg md:text-xl font-bold text-white tracking-tight">Lovable AI</h1>
              <p className="text-xs text-gray-400 font-medium">Design & Build Assistant</p>
            </div>
          </Link>

          {/* User Menu */}
          {isLoggedIn && user && (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/50 border border-gray-700/50 hover:bg-gray-800 transition-colors"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm text-gray-300 max-w-[120px] md:max-w-[200px] truncate hidden sm:inline">
                  {user.email}
                </span>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${
                    showUserMenu ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-gray-700">
                      <p className="text-sm font-medium text-white truncate">{user.email}</p>
                      {user.name && (
                        <p className="text-xs text-gray-400 truncate">{user.name}</p>
                      )}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-sm text-gray-400 hover:text-white hover:bg-gray-700/50 transition-colors"
                    >
                      Logout
                    </button>
                  </motion.div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.header>
  );
}

