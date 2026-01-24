import { GoogleGenerativeAI } from '@google/generative-ai';

export interface Message {
  role: 'user' | 'ai';
  content: string;
}

const SYSTEM_PROMPT = `You are Lovable AI, a senior full-stack engineer and product designer.

CRITICAL REQUIREMENTS:
- ALWAYS generate React/Next.js code when users ask for UI components, pages, or features
- NEVER provide plain HTML/CSS - always use React components with TypeScript
- Use Next.js 14 App Router patterns (server components, client components with 'use client')
- Use Tailwind CSS for all styling (NO inline <style> tags, NO separate CSS files)
- Provide complete, production-ready code with proper imports
- Include TypeScript types and interfaces
- Use modern React patterns (hooks, functional components)
- Make components reusable and well-structured

When users request UI components (like login pages, forms, dashboards, etc.):
1. Create a Next.js component file (e.g., LoginPage.tsx)
2. Use 'use client' directive for interactive components
3. Use Tailwind CSS classes for all styling
4. Include proper TypeScript types
5. Add proper form handling, validation, and state management
6. Make it responsive and accessible
7. Include all necessary imports

Example structure:
\`\`\`tsx
'use client';

import { useState } from 'react';

export default function ComponentName() {
  // Component code with Tailwind CSS
}
\`\`\`

You help users design UI, generate clean production-ready Next.js/React code,
refine product ideas, and improve UX.
You always respond clearly, step-by-step, and beautifully.
Focus on Next.js, React, TypeScript, Tailwind CSS, and modern frontend development.`;

// Helper function to retry with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Only retry on 503 (Service Unavailable) or overloaded errors
      const isRetryable = 
        error.message?.includes('503') ||
        error.message?.includes('Service Unavailable') ||
        error.message?.includes('overloaded') ||
        error.message?.includes('try again later');
      
      if (!isRetryable || attempt === maxRetries - 1) {
        throw error;
      }
      
      // Exponential backoff: 1s, 2s, 4s
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

export async function generateAIResponse(messages: Message[]): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set in environment variables');
  }

  // First, try to get available models from the API
  let modelNames: string[] = [];
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
      { method: 'GET' }
    );
    if (response.ok) {
      const data = await response.json();
      modelNames = data.models
        ?.filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
        ?.map((m: any) => m.name.replace('models/', '')) || [];
    }
  } catch (error) {
    console.warn('Could not fetch available models, using defaults');
  }

  // Fallback to common model names if API call failed
  if (modelNames.length === 0) {
    modelNames = ['gemini-pro', 'gemini-1.5-pro', 'gemini-1.5-flash'];
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Filter out the initial AI greeting message if present
  const conversationMessages = messages.filter((msg, idx) => {
    if (idx === 0 && msg.role === 'ai') {
      return false;
    }
    return true;
  });

  // Build chat history - include system prompt in the first user message
  const historyMessages = conversationMessages.slice(0, -1);
  
  let history: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>;
  
  if (historyMessages.length === 0) {
    // First message - include system prompt
    history = [];
  } else {
    // Build history with system prompt included at the start
    history = [
      {
        role: 'user' as const,
        parts: [{ text: SYSTEM_PROMPT }],
      },
      {
        role: 'model' as const,
        parts: [{ text: 'Understood. I\'m ready to help you design UI, generate code, and refine product ideas.' }],
      },
      ...historyMessages.map((msg) => {
        const role: 'user' | 'model' = msg.role === 'user' ? 'user' : 'model';
        return {
          role: role,
          parts: [{ text: msg.content }],
        };
      }),
    ];
  }

  // Get the last user message
  const lastMessage = conversationMessages[conversationMessages.length - 1];
  
  if (!lastMessage || lastMessage.role !== 'user') {
    throw new Error('Last message must be from user');
  }

  // For the first message, include system prompt in the user message
  let messageToSend = lastMessage.content;
  if (history.length === 0) {
    messageToSend = `${SYSTEM_PROMPT}\n\nUser: ${lastMessage.content}`;
  }

  // Try each model name until one works (using SDK with retry logic)
  let lastError: any;
  for (const modelName of modelNames) {
    try {
      const result = await retryWithBackoff(async () => {
        const model = genAI.getGenerativeModel({ model: modelName });
        const chat = model.startChat({ history: history });
        const result = await chat.sendMessage(messageToSend);
        const response = await result.response;
        return response.text();
      });
      return result;
    } catch (error: any) {
      lastError = error;
      // If it's a 404, try the next model
      if (error.message?.includes('404') || error.message?.includes('not found')) {
        continue;
      }
      // If it's a 503 and we've exhausted retries, try next model
      if (error.message?.includes('503') || error.message?.includes('overloaded')) {
        continue;
      }
      // For other errors, throw immediately
      throw error;
    }
  }
  
  // If SDK failed, try REST API directly as fallback with retry logic
  console.warn('SDK failed, trying REST API directly');
  for (const modelName of modelNames) {
    try {
      const result = await retryWithBackoff(async () => {
        // Build the request payload for REST API
        const contents: any[] = [];
        
        // Add history
        if (history.length > 0) {
          contents.push(...history);
        }
        
        // Add current message
        contents.push({
          role: 'user',
          parts: [{ text: messageToSend }],
        });

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: contents,
              systemInstruction: {
                parts: [{ text: SYSTEM_PROMPT }],
              },
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!text) {
          throw new Error('No text in response');
        }

        return text;
      });
      
      return result;
    } catch (error: any) {
      lastError = error;
      // If it's a 404, try the next model
      if (error.message?.includes('404') || error.message?.includes('not found')) {
        continue;
      }
      // If it's a 503 and we've exhausted retries, try next model
      if (error.message?.includes('503') || error.message?.includes('overloaded')) {
        continue;
      }
      // For other errors, continue to next model
      continue;
    }
  }
  
  // If all models failed, throw a helpful error
  const isOverloaded = lastError?.message?.includes('503') || 
                       lastError?.message?.includes('overloaded') ||
                       lastError?.message?.includes('Service Unavailable');
  
  if (isOverloaded) {
    throw new Error(
      `The Gemini API is currently overloaded. Please try again in a few moments. ` +
      `\n\nLast error: ${lastError?.message || 'Service Unavailable'}\n` +
      `\nThe API tried to retry automatically but the service is still busy. ` +
      `This usually resolves within a minute or two.`
    );
  }
  
  throw new Error(
    `None of the available models (${modelNames.join(', ')}) are accessible with your API key. ` +
    `Last error: ${lastError?.message || 'Unknown error'}. ` +
    `\n\nTroubleshooting steps:\n` +
    `1. Visit /api/list-models to see which models are available for your API key\n` +
    `2. Check your API key at https://makersuite.google.com/app/apikey\n` +
    `3. Ensure your API key has the necessary permissions\n` +
    `4. Try creating a new API key if the current one doesn't work`
  );
}

