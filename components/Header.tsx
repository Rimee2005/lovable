'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { isAuthenticated, getUser, removeAuth } from '@/lib/auth';
import { useRouter, usePathname } from 'next/navigation';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ email: string; name?: string } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
    setUser(getUser());
  }, []);

  useEffect(() => {
    // Close mobile menu when route changes
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    removeAuth();
    setIsLoggedIn(false);
    setUser(null);
    setMobileMenuOpen(false);
    router.push('/');
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-transparent"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-gradient-to-br from-red-500 via-orange-500 to-pink-500 flex items-center justify-center shadow-lg">
                <svg
                  className="w-5 h-5 md:w-6 md:h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
            </motion.div>
            <span className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Lovable
            </span>
          </Link>
          

          {/* Right Side - Auth Buttons */}
          <div className="flex items-center gap-3">
            {isLoggedIn && user ? (
              <>
                {/* User Menu - Desktop */}
                <div className="hidden md:flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm text-white max-w-[150px] truncate">
                      {user.email}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium text-white/90 hover:text-white border border-white/20 rounded-lg hover:bg-white/10 transition-all"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/chat"
                  className="hidden sm:block px-4 py-2 text-sm font-medium text-white/90 hover:text-white transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/chat"
                  className="px-4 py-2 text-sm font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg backdrop-blur-sm transition-all"
                >
                  Get started
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Toggle menu"
            >
              <motion.svg
                animate={{ rotate: mobileMenuOpen ? 90 : 0 }}
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </motion.svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-full left-0 right-0 bg-gray-900/95 backdrop-blur-xl border-b border-gray-800 shadow-xl z-50 lg:hidden"
            >
              <div className="px-4 py-4 space-y-1">
                {isLoggedIn && user && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 border border-white/20 mb-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm text-white truncate flex-1">
                      {user.email}
                    </span>
                  </div>
                )}
                {!isLoggedIn && (
                  <>
                    <Link
                      href="/chat"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-all font-medium"
                    >
                      Log in
                    </Link>
                    <Link
                      href="/chat"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 bg-white/10 border border-white/20 text-white font-semibold rounded-lg text-center hover:bg-white/20 transition-all"
                    >
                      Get started
                    </Link>
                  </>
                )}
                {isLoggedIn && (
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-all font-medium"
                  >
                    Logout
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

