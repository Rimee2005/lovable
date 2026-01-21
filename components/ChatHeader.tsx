'use client';

import { motion } from 'framer-motion';

export default function ChatHeader() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-xl border-b border-gray-800/50 shadow-lg"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="relative"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <span className="text-white text-lg font-bold">L</span>
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900 animate-pulse" />
          </motion.div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Lovable AI</h1>
            <p className="text-xs text-gray-400 font-medium">Design & Build Assistant</p>
          </div>
        </div>
      </div>
    </motion.header>
  );
}

