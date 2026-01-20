# Lovable AI Chat Application

A modern, premium AI chat interface built with Next.js 14, TypeScript, Tailwind CSS, Framer Motion, and Google Gemini API.

## Features

- 🎨 Beautiful dark theme UI with smooth animations
- 💬 Real-time AI chat powered by Google Gemini
- 🚀 Built with Next.js 14 App Router
- 📱 Responsive design
- ✨ Typing indicators and loading states
- 🎯 Clean, production-ready code

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Google Gemini API key

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file in the root directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
app/
 ├── api/
 │    └── chat/
 │         └── route.ts          # API endpoint for chat
 ├── page.tsx                     # Main chat page
 ├── layout.tsx                   # Root layout
 └── globals.css                  # Global styles

components/
 ├── ChatHeader.tsx               # Header component
 ├── ChatMessage.tsx              # Message bubble component
 └── ChatInput.tsx                # Input component

lib/
 └── gemini.ts                    # Gemini API integration
```

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Google Gemini API** - AI responses

## Environment Variables

- `GEMINI_API_KEY` - Your Google Gemini API key (required)

## License

MIT

