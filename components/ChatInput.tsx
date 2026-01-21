'use client';

import { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky bottom-0 bg-gray-900/95 backdrop-blur-xl border-t border-gray-800/50 shadow-2xl"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask me anything... (Enter to send, Shift+Enter for new line)"
              disabled={disabled}
              rows={1}
              className="w-full px-5 py-4 pr-14 bg-gray-800/90 border border-gray-700/50 rounded-2xl text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-inner"
              style={{
                minHeight: '56px',
                maxHeight: '200px',
              }}
            />
            <div className="absolute right-4 bottom-4 text-xs text-gray-500">
              {input.length > 0 && (
                <span className="text-gray-400">{input.length}</span>
              )}
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={disabled || !input.trim()}
            className="h-14 px-6 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 text-white rounded-2xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover:shadow-lg hover:shadow-purple-500/25 transition-all disabled:hover:shadow-none"
          >
            <motion.svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-5 h-5"
              animate={disabled ? { rotate: 0 } : {}}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
              />
            </motion.svg>
            <span className="hidden sm:inline">Send</span>
          </motion.button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Lovable AI can help you build UI components, generate code, and refine ideas
        </p>
      </div>
    </motion.div>
  );
}

