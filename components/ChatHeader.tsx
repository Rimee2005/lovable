'use client';

import { motion } from 'framer-motion';

export default function ChatHeader() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-10 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800"
    >
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <span className="text-white text-sm font-bold">L</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">Lovable AI</h1>
            <p className="text-xs text-gray-400">Design & Build Assistant</p>
          </div>
        </div>
      </div>
    </motion.header>
  );
}

