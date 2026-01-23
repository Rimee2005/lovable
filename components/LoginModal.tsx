'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { setAuth } from '@/lib/auth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: { id: string; email: string; name?: string }) => void;
}

export default function LoginModal({ isOpen, onClose, onLogin }: LoginModalProps) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      if (isRegisterMode) {
        // Register
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password, name: name.trim() || undefined }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Registration failed');
        }

        // After registration, automatically log in
        const loginResponse = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        const loginData = await loginResponse.json();

        if (!loginResponse.ok) {
          throw new Error(loginData.error || 'Auto-login failed');
        }

        // Store auth token and user
        setAuth(loginData.token, loginData.user);
        onLogin(loginData.user);
      } else {
        // Login
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Login failed');
        }

        // Store auth token and user
        setAuth(data.token, data.user);
        onLogin(data.user);
      }

      // Reset form
      setEmail('');
      setPassword('');
      setName('');
      setIsRegisterMode(false);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    {isRegisterMode ? 'Create account' : 'Welcome back'}
                  </h2>
                  <p className="text-sm text-gray-400">
                    {isRegisterMode ? 'Sign up to start building' : 'Sign in to continue building'}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
                >
                  <p className="text-sm text-red-400">{error}</p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {isRegisterMode && (
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                      Name (optional)
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                  {isRegisterMode && (
                    <p className="mt-1 text-xs text-gray-500">Minimum 6 characters</p>
                  )}
                </div>

                {!isRegisterMode && (
                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 text-gray-400">
                      <input type="checkbox" className="rounded border-gray-700 bg-gray-800" />
                      <span>Remember me</span>
                    </label>
                    <a href="#" className="text-purple-400 hover:text-purple-300 transition-colors">
                      Forgot password?
                    </a>
                  </div>
                )}

                <motion.button
                  type="submit"
                  disabled={isLoading || !email.trim() || !password.trim()}
                  whileHover={{ scale: isLoading ? 1 : 1.02 }}
                  whileTap={{ scale: isLoading ? 1 : 0.98 }}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isLoading
                    ? isRegisterMode
                      ? 'Creating account...'
                      : 'Signing in...'
                    : isRegisterMode
                    ? 'Create account'
                    : 'Sign in'}
                </motion.button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-400">
                  {isRegisterMode ? 'Already have an account? ' : "Don't have an account? "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegisterMode(!isRegisterMode);
                      setError('');
                      setEmail('');
                      setPassword('');
                      setName('');
                    }}
                    className="text-purple-400 hover:text-purple-300 transition-colors font-medium"
                  >
                    {isRegisterMode ? 'Sign in' : 'Sign up'}
                  </button>
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

