# Lovable AI Chat Application

A modern, premium AI chat interface built with Next.js 14, TypeScript, Tailwind CSS, Framer Motion, and Google Gemini API.

## Features

- 🎨 Beautiful dark theme UI with smooth animations
- 💬 Real-time AI chat powered by Google Gemini
- 🔐 User authentication with MongoDB (Register/Login)
- 🔒 JWT token-based authentication
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
- **MongoDB** - Database for user storage
- **Mongoose** - MongoDB ODM
- **bcryptjs** - Password hashing
- **JWT** - Authentication tokens
- **Google Gemini API** - AI responses

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# MongoDB Connection String
# Get this from MongoDB Atlas (https://www.mongodb.com/cloud/atlas)
# Format: mongodb+srv://username:password@cluster.mongodb.net/database-name
MONGODB_URI=your_mongodb_connection_string

# JWT Secret Key (use a random string in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here
```

### Setting up MongoDB

1. **Option 1: MongoDB Atlas (Cloud - Recommended)**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free account
   - Create a new cluster (free tier available)
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password
   - Replace `<dbname>` with `lovable` (or your preferred database name)
   - Add the connection string to `.env.local` as `MONGODB_URI`

2. **Option 2: Local MongoDB**
   - Install MongoDB locally
   - Use connection string: `mongodb://localhost:27017/lovable`
   - Add to `.env.local` as `MONGODB_URI`

### Setting up JWT Secret

Generate a secure random string for `JWT_SECRET`:
```bash
# On macOS/Linux
openssl rand -base64 32

# Or use any random string generator
```

## License

MIT

