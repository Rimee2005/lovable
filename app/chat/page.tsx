'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import ChatHeader from '@/components/ChatHeader';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import LoginModal from '@/components/LoginModal';
import { Message } from '@/lib/gemini';
import { isAuthenticated, getToken } from '@/lib/auth';

const DEFAULT_GREETING =
  "Hello! I'm Lovable AI. How can I help you design and build something amazing today?";

const GREETING_VARIANTS: string[] = [
  DEFAULT_GREETING,
  'Tell me what you want to build and I will sketch the UI and code for you.',
  'Describe your product idea and I will turn it into clean React/Next.js components.',
  'What are we designing today – a dashboard, landing page, or full app?',
  'Share a rough idea and I will help refine the UX and generate production-ready code.',
];

const PROMPT_SUGGESTIONS: { title: string; prompt: string }[] = [
  {
    title: 'Build a Portfolio',
    prompt:
      'Build a clean personal portfolio website with sections for hero, projects grid, about, and contact form. Use modern UI patterns and responsive layout.',
  },
  {
    title: 'Create a Landing Page',
    prompt:
      'Create a beautiful SaaS landing page with a hero section, features grid, pricing table, testimonials, and call-to-action sections. Make it conversion-focused.',
  },
  {
    title: 'Build a Dashboard',
    prompt:
      'Design an admin dashboard with sidebar navigation, stats cards, charts area, and a recent activity table. Focus on clarity and usability.',
  },
  {
    title: 'Design a Product Page',
    prompt:
      'Design a product detail page with gallery, description, specs, reviews, and add-to-cart section. Make it feel premium and easy to scan.',
  },
];

function getRandomGreeting() {
  return GREETING_VARIANTS[Math.floor(Math.random() * GREETING_VARIANTS.length)];
}

function ChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMessage = searchParams.get('message');
  const hasSentInitial = useRef(false);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ai',
      content: DEFAULT_GREETING,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = async () => {
      const authed = isAuthenticated();
      setIsLoggedIn(authed);
      if (!authed) {
        setShowLoginModal(true);
      }

      // Try to load previous conversation if authenticated
      try {
        const token = getToken();
        if (token) {
          const res = await fetch('/api/chat/history', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            if (data.messages && Array.isArray(data.messages) && data.messages.length > 0) {
              setMessages(data.messages);
              return;
            }
          }
        }
      } catch (historyError) {
        console.warn('Failed to load chat history', historyError);
      }

      // After hydration, randomize the initial greeting on the client only
      const randomGreeting = getRandomGreeting();
      if (randomGreeting !== DEFAULT_GREETING) {
        setMessages((prev) => {
          if (prev.length === 1 && prev[0].role === 'ai') {
            return [
              {
                ...prev[0],
                content: randomGreeting,
              },
            ];
          }
          return prev;
        });
      }
    };

    init();
  }, []);

  const handleLogin = (user: { id: string; email: string; name?: string }) => {
    setIsLoggedIn(true);
    setShowLoginModal(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (content: string) => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    // Add user message immediately
    const userMessage: Message = { role: 'user', content };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    // Failsafe timeout so loader doesn't spin forever
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          content:
            'The AI is taking longer than expected. Please check your connection or try again in a moment.',
        },
      ]);
    }, 45000);

    try {
      const token = getToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!response.ok) {
        // Try to parse error, but handle non-JSON responses
        let errorMessage = 'Failed to get response';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const aiMessage: Message = { role: 'ai', content: data.message };
      setMessages([...updatedMessages, aiMessage]);
    } catch (error: any) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        role: 'ai',
        content:
          error.message ||
          'Sorry, I encountered an error. Please make sure your GEMINI_API_KEY is set in .env.local and try again.',
      };
      setMessages([...updatedMessages, errorMessage]);
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  };

  // Send initial message if provided (only once)
  useEffect(() => {
    if (initialMessage && !hasSentInitial.current && messages.length === 1) {
      hasSentInitial.current = true;
      handleSend(initialMessage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMessage]);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950">
      <ChatHeader />
      
      <main className="flex-1 overflow-y-auto relative">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)] pointer-events-none" />
        
        {/* Prompt suggestions row */}
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-2">
          <div className="flex gap-3 overflow-x-auto pb-2">
            {PROMPT_SUGGESTIONS.map((item) => (
              <button
                key={item.title}
                type="button"
                onClick={() => {
                  if (!isLoggedIn) {
                    setShowLoginModal(true);
                    return;
                  }
                  handleSend(item.prompt);
                }}
                className="whitespace-nowrap px-4 py-2 rounded-full border border-gray-700/70 bg-gray-900/80 text-sm text-gray-100 hover:border-purple-500 hover:bg-gray-800/90 transition-colors"
              >
                {item.title}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 relative">
          {messages.length === 1 && messages[0].role === 'ai' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12 mb-8"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-orange-500/20 border border-purple-500/20 mb-4">
                <svg
                  className="w-8 h-8 text-purple-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Welcome to Lovable AI</h2>
              <p className="text-gray-400 max-w-md mx-auto">
                I can help you design UI components, generate React/Next.js code, and bring your ideas to life.
              </p>
            </motion.div>
          )}
          
          {messages.map((message, index) => (
            <ChatMessage key={index} message={message} index={index} />
          ))}
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start mb-6"
            >
              <div className="bg-gray-800/90 border border-gray-700/50 rounded-2xl px-5 py-4 shadow-lg backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <motion.div
                      className="w-2.5 h-2.5 bg-purple-400 rounded-full"
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                    />
                    <motion.div
                      className="w-2.5 h-2.5 bg-pink-400 rounded-full"
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                    />
                    <motion.div
                      className="w-2.5 h-2.5 bg-orange-400 rounded-full"
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                    />
                  </div>
                  <span className="text-sm text-gray-400 font-medium">AI is thinking...</span>
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </main>

      {!isLoggedIn && (
        <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-40">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 border border-gray-700 rounded-2xl p-8 max-w-md mx-4 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-purple-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Login Required</h3>
            <p className="text-gray-400 mb-6">
              Please sign in to access the chat interface
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowLoginModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl"
            >
              Sign In
            </motion.button>
          </motion.div>
        </div>
      )}

      <ChatInput onSend={handleSend} disabled={isLoading || !isLoggedIn} />

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => {
          if (!isLoggedIn) {
            router.push('/');
          } else {
            setShowLoginModal(false);
          }
        }}
        onLogin={handleLogin}
      />
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <ChatContent />
    </Suspense>
  );
}

