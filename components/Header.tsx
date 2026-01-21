'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Header() {
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
          
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/chat"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Chat
            </Link>
          </nav>
        </div>
      </div>
    </motion.header>
  );
}

