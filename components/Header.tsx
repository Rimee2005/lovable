'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { isAuthenticated, getUser, removeUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function Header() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ email: string } | null>(null);

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
    setUser(getUser());
  }, []);

  const handleLogout = () => {
    removeUser();
    setIsLoggedIn(false);
    setUser(null);
    router.push('/');
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800/50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20"
            >
              <span className="text-white text-sm font-bold">L</span>
            </motion.div>
            <span className="text-lg font-semibold text-white">Lovable AI</span>
          </Link>
          
          <nav className="flex items-center gap-4">
            {isLoggedIn && user && (
              <div className="hidden md:flex items-center gap-3 text-sm">
                <div className="flex items-center gap-2 text-gray-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>{user.email}</span>
                </div>
              </div>
            )}
            <Link
              href="/chat"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Chat
            </Link>
            {isLoggedIn && (
              <button
                onClick={handleLogout}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Logout
              </button>
            )}
          </nav>
        </div>
      </div>
    </motion.header>
  );
}

