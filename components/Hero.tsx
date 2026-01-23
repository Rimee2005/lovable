'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import LoginModal from './LoginModal';
import { isAuthenticated, getUser, verifyAuth } from '@/lib/auth';

export default function Hero() {
  const router = useRouter();
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    // Verify authentication status on mount
    const checkAuth = async () => {
      const user = await verifyAuth();
      setIsLoggedIn(!!user);
    };
    checkAuth();
  }, []);

  const handleLogin = (user: { id: string; email: string; name?: string }) => {
    setIsLoggedIn(true);
    setShowLoginModal(false);
    setShowLoginPrompt(false);
    // Refresh page to update auth state
    window.location.reload();
  };

  const handleInputFocus = () => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      setIsFocused(false);
      setTimeout(() => setShowLoginModal(true), 300);
    } else {
      setIsFocused(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      setShowLoginModal(true);
      return;
    }
    setInputValue(e.target.value);
  };

  const handleStartBuilding = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    if (inputValue.trim()) {
      // Navigate to chat with the input as initial message
      router.push(`/chat?message=${encodeURIComponent(inputValue.trim())}`);
    } else {
      router.push('/chat');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleStartBuilding();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 pt-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl w-full text-center"
      >
        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight"
        >
          Build products by{' '}
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
            describing them
          </span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-xl sm:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed"
        >
          Turn ideas into beautiful UIs and code using AI
        </motion.p>

        {/* Input-like CTA Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mb-6"
        >
          <div
            className={`relative max-w-2xl mx-auto transition-all duration-300 ${
              isFocused && isLoggedIn
                ? 'ring-2 ring-purple-500/50 shadow-2xl shadow-purple-500/20'
                : showLoginPrompt
                ? 'ring-2 ring-yellow-500/50 shadow-2xl shadow-yellow-500/20'
                : 'ring-1 ring-gray-800'
            }`}
          >
            <input
              type="text"
              value={isLoggedIn ? inputValue : ''}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              onFocus={handleInputFocus}
              onBlur={() => {
                setIsFocused(false);
                setTimeout(() => setShowLoginPrompt(false), 200);
              }}
              placeholder={isLoggedIn ? "Describe what you want to build..." : "Login to continue..."}
              className="w-full px-6 py-5 sm:px-8 sm:py-6 bg-gray-900/50 border border-gray-800 rounded-2xl text-white placeholder-gray-500 text-lg sm:text-xl focus:outline-none backdrop-blur-sm cursor-pointer"
              readOnly={!isLoggedIn}
            />
            {isFocused && isLoggedIn && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 pointer-events-none"
              />
            )}
            {showLoginPrompt && !isLoggedIn && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-yellow-500/90 text-white px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap shadow-lg"
              >
                Please login to continue
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-yellow-500/90" />
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleStartBuilding}
            className="group px-8 py-4 sm:px-10 sm:py-5 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white text-lg sm:text-xl font-semibold rounded-2xl shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300 flex items-center gap-2 mx-auto"
          >
            Start building
            <motion.span
              initial={{ x: 0 }}
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="inline-block"
            >
              →
            </motion.span>
          </motion.button>
        </motion.div>

        {/* Subtle hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-8 text-sm text-gray-500"
        >
          {isLoggedIn ? 'Press Enter to start' : 'Sign in to start building'}
        </motion.p>

        {/* User info if logged in */}
        {isLoggedIn && getUser() && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-400"
          >
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Signed in as {getUser()?.email}</span>
          </motion.div>
        )}
      </motion.div>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => {
          setShowLoginModal(false);
          setShowLoginPrompt(false);
        }}
        onLogin={handleLogin}
      />
    </div>
  );
}

