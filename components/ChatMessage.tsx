'use client';

import { motion } from 'framer-motion';
import { Message } from '@/lib/gemini';
import { useEffect, useRef, useState } from 'react';

interface ChatMessageProps {
  message: Message;
  index: number;
}

// Simple markdown-like code block renderer
function renderContent(content: string) {
  const parts: (string | { type: 'code'; code: string; language?: string })[] = [];
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    // Add text before code block
    if (match.index > lastIndex) {
      const text = content.slice(lastIndex, match.index);
      if (text.trim()) {
        parts.push(text);
      }
    }
    
    // Add code block
    parts.push({
      type: 'code',
      code: match[2],
      language: match[1] || 'text',
    });
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text
  if (lastIndex < content.length) {
    const text = content.slice(lastIndex);
    if (text.trim()) {
      parts.push(text);
    }
  }
  
  // If no code blocks found, return original content
  if (parts.length === 0) {
    parts.push(content);
  }
  
  return parts;
}

export default function ChatMessage({ message, index }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const contentParts = renderContent(message.content);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.3) }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6 group`}
    >
      <div
        className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-4 shadow-lg ${
          isUser
            ? 'bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 text-white'
            : 'bg-gray-800/90 text-gray-100 border border-gray-700/50 backdrop-blur-sm'
        }`}
      >
        <div className="space-y-3">
          {contentParts.map((part, idx) => {
            if (typeof part === 'string') {
              return (
                <p
                  key={idx}
                  className="text-sm leading-relaxed whitespace-pre-wrap break-words"
                  style={{ wordBreak: 'break-word' }}
                >
                  {part.split('\n').map((line, lineIdx) => (
                    <span key={lineIdx}>
                      {line}
                      {lineIdx < part.split('\n').length - 1 && <br />}
                    </span>
                  ))}
                </p>
              );
            } else {
              return (
                <div key={idx} className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-gray-400 uppercase">
                      {part.language}
                    </span>
                    <button
                      onClick={() => copyToClipboard(part.code, idx)}
                      className="text-xs text-gray-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-gray-700/50"
                    >
                      {copiedIndex === idx ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <pre className="bg-gray-900/80 rounded-lg p-4 overflow-x-auto border border-gray-700/50">
                    <code className="text-xs font-mono text-gray-300 whitespace-pre">
                      {part.code}
                    </code>
                  </pre>
                </div>
              );
            }
          })}
        </div>
      </div>
    </motion.div>
  );
}

