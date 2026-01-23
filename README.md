# CareerForgeAI

> An AI-powered career guidance platform that analyzes developer skills against job requirements and provides personalized learning recommendations.

[![Next.js](https://img.shields.io/badge/Next.js-16.1.4-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Vercel AI SDK](https://img.shields.io/badge/Vercel%20AI%20SDK-6.0.42-purple)](https://sdk.vercel.ai/)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Architecture](#architecture)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)

## 🎯 Overview

CareerForgeAI is a modern web application that helps developers identify skill gaps and receive personalized career guidance. The platform allows users to upload their resume (PDF) or describe their skills, then uses AI to analyze them against job postings and provide actionable recommendations.

### Key Capabilities

- **Resume Analysis**: Upload PDF resumes for automated skill extraction
- **Skill Gap Analysis**: Compare your skills against job requirements
- **Learning Recommendations**: Get prioritized learning paths with suggested resources
- **Real-time Chat Interface**: ChatGPT-style UI with streaming AI responses
- **Mock Job Postings**: Test against realistic job requirements

## ✨ Features

### Core Features

- ✅ **PDF Resume Upload**: Server-side text extraction from PDF files
- ✅ **AI-Powered Analysis**: Google Gemini integration for skill gap analysis
- ✅ **Streaming Responses**: Real-time AI response streaming
- ✅ **Markdown Support**: Rich text formatting for AI responses
- ✅ **Responsive Design**: Mobile-first, collapsible sidebar
- ✅ **Chat History**: Track previous conversations (UI ready)
- ✅ **Modern UI**: Built with shadcn/ui components and Tailwind CSS

### AI Analysis Output

The AI provides structured analysis including:

1. **Skill Gaps**: Missing skills required for the position
2. **Weak Skills**: Skills that need strengthening
3. **Recommended Learning Path**: Prioritized skills with resources and timeline
4. **Strength Areas**: Skills you already have that match requirements

## 🛠 Tech Stack

### Frontend

- **Framework**: [Next.js 16.1.4](https://nextjs.org/) (App Router)
- **Language**: [TypeScript 5.0](https://www.typescriptlang.org/)
- **UI Library**: [React 19.2.3](https://react.dev/)
- **Styling**: [Tailwind CSS 4.0](https://tailwindcss.com/)
- **Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Markdown**: [react-markdown](https://github.com/remarkjs/react-markdown)

### Backend

- **AI SDK**: [Vercel AI SDK 6.0.42](https://sdk.vercel.ai/)
- **AI Provider**: [Google Gemini 2.5 Flash Lite](https://ai.google.dev/)
- **PDF Processing**: [pdf-parse](https://www.npmjs.com/package/pdf-parse)
- **Runtime**: Node.js (via Next.js API Routes)

### Development Tools

- **Linting**: ESLint with Next.js config
- **Type Checking**: TypeScript strict mode
- **Package Manager**: npm

## 📁 Project Structure

```
career-forge-ai/
├── src/
│   ├── app/
│   │   ├── chat/
│   │   │   └── route.ts          # AI chat API endpoint
│   │   ├── globals.css            # Global styles with shadcn/ui variables
│   │   ├── layout.tsx             # Root layout component
│   │   └── page.tsx               # Main chat interface
│   ├── components/
│   │   ├── chat-input.tsx        # Chat input with PDF upload
│   │   ├── chat-message.tsx       # Message display component
│   │   ├── sidebar.tsx             # Sidebar navigation
│   │   └── ui/                    # shadcn/ui components
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       └── separator.tsx
│   ├── data/
│   │   └── mock-jobs.ts           # Mock LinkedIn job postings
│   └── lib/
│       ├── pdf-extractor.ts       # PDF text extraction utility
│       └── utils.ts                # Utility functions (cn helper)
├── public/                         # Static assets
├── .env.local                     # Environment variables (not in git)
├── next.config.ts                 # Next.js configuration
├── tsconfig.json                  # TypeScript configuration
└── package.json                   # Dependencies and scripts
```

## 🚀 Getting Started

### Prerequisites

- **Node.js**: 18.x or higher
- **npm**: 9.x or higher (or yarn/pnpm)
- **Google AI API Key**: Get one from [Google AI Studio](https://aistudio.google.com/app/apikey)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd career-forge-ai
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:

   ```env
   GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
   ```

   > **Note**: Replace `your_api_key_here` with your actual Google AI API key.

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google AI API key for Gemini model | Yes |

### Getting Your API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and add it to `.env.local`

## 🏗 Architecture

### Application Flow

```
User Input (Text/PDF)
    ↓
Client (page.tsx)
    ↓
FormData → POST /chat
    ↓
Server Route (route.ts)
    ├─→ PDF Extraction (if PDF uploaded)
    ├─→ Mock Job Posting Selection
    ├─→ Prompt Engineering
    └─→ AI Stream (Google Gemini)
    ↓
Streaming Response
    ↓
Client (Real-time UI Update)
    ↓
Markdown Rendering
```

### Key Components

#### Client-Side (`src/app/page.tsx`)

- Manages chat state and messages
- Handles PDF file uploads
- Processes streaming AI responses
- Updates UI in real-time

#### Server-Side (`src/app/chat/route.ts`)

- Receives FormData (text + optional PDF)
- Extracts text from PDF files
- Selects mock job posting
- Constructs AI prompts for skill gap analysis
- Streams responses using Vercel AI SDK

#### PDF Processing (`src/lib/pdf-extractor.ts`)

- Server-side PDF text extraction
- Uses `pdf-parse` library
- Returns plain text for AI analysis

## 📡 API Documentation

### POST `/chat`

Main API endpoint for chat interactions.

#### Request

**Content-Type**: `multipart/form-data`

| Field | Type | Description |
|-------|------|-------------|
| `message` | string | User's text message (optional if PDF provided) |
| `pdf` | File | PDF file upload (optional) |
| `messages` | string | JSON string of previous messages for context |

#### Response

**Content-Type**: `text/plain` (streaming)

Returns a streaming text response from the AI model.

#### Example Request

```typescript
const formData = new FormData()
formData.append("message", "I know React, TypeScript, and Node.js")
formData.append("pdf", pdfFile) // optional
formData.append("messages", JSON.stringify(previousMessages))

const response = await fetch("/chat", {
  method: "POST",
  body: formData,
})
```

#### Example Response

Streaming text response with skill gap analysis:

```
# Skill Gap Analysis

## Skill Gaps
- Docker and containerization
- Kubernetes orchestration
- AWS cloud services

## Recommended Learning Path
1. **Docker Fundamentals** (2-3 weeks)
   - Official Docker documentation
   - Hands-on practice with containers
...
```

## 💻 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Next.js recommended configuration
- **Components**: Functional components with TypeScript
- **Styling**: Tailwind CSS utility classes
- **File Naming**: kebab-case for files, PascalCase for components

### Adding New Features

1. **New UI Components**: Add to `src/components/`
2. **New API Routes**: Add to `src/app/api/` or `src/app/[route]/route.ts`
3. **Utilities**: Add to `src/lib/`
4. **Mock Data**: Add to `src/data/`

### Testing

Currently, the project uses manual testing. For production, consider adding:

- Unit tests (Jest/Vitest)
- Integration tests (Playwright)
- E2E tests (Cypress)

## 🚢 Deployment

### Vercel (Recommended)

1. **Push to GitHub**

   ```bash
   git push origin main
   ```

2. **Import to Vercel**

   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your repository

3. **Add Environment Variables**

   - In Vercel project settings
   - Add `GOOGLE_GENERATIVE_AI_API_KEY`
   - Redeploy

4. **Deploy**

   Vercel will automatically deploy on every push to main.

### Other Platforms

The application can be deployed to any platform that supports Next.js:

- **Netlify**: Use Next.js plugin
- **Railway**: Automatic Next.js detection
- **Docker**: Build with `next build` and serve with `next start`

### Build Configuration

```bash
# Production build
npm run build

# The output will be in .next/
# Serve with:
npm start
```

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines

- Follow existing code style
- Add TypeScript types for all new code
- Update documentation for new features
- Test thoroughly before submitting PR

## 📝 License

This project is private and proprietary.

## 🙏 Acknowledgments

- [Vercel AI SDK](https://sdk.vercel.ai/) for excellent AI integration
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Next.js](https://nextjs.org/) for the amazing framework
- [Google Gemini](https://ai.google.dev/) for powerful AI capabilities

## 📧 Support

For issues, questions, or contributions, please open an issue on the repository.

---

**Built with ❤️ using Next.js and AI**
