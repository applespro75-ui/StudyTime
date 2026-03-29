# StudyTime AI
**Upload. Understand. Master.**

## Overview

StudyTime AI is a full-stack AI-powered study companion that transforms your PDFs and lecture notes into an interactive learning experience. Upload your study material and let AI help you understand and master content through summaries, mind maps, interactive chat, and adaptive quizzes.

## Features

- **📤 Smart Upload**: Upload PDFs or paste lecture notes for instant analysis
- **📋 AI-Powered Summaries**: Get structured topic summaries with key points
- **🗺️ Interactive Mind Maps**: Visualize concepts and their relationships
- **💬 Study Chat**: Ask questions about your material with AI assistance
- **🧩 Adaptive Quiz**: Test your knowledge with difficulty-adjusting questions
- **🎯 Progress Tracking**: Monitor your learning with scores and streaks
- **📊 Weak Topic Detection**: Identify and focus on areas that need improvement

## Tech Stack

### Frontend
- **React** - UI library
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **pdfjs-dist** - PDF text extraction
- **Lucide React** - Icons
- **Sonner** - Toast notifications

### Backend
- **FastAPI** - Python web framework
- **MongoDB** - Database for chat history
- **PyPDF2** - PDF text extraction
- **emergentintegrations** - Gemini API integration
- **Motor** - Async MongoDB driver

### AI
- **Google Gemini API** (gemini-2.5-flash) - Text generation and analysis (recommended)

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- Python (v3.11 or higher; 3.13 is confirmed)
- MongoDB (running locally or remote instance)
- Google Gemini API key (get yours at [Google AI Studio](https://aistudio.google.com/app/apikey))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/TitanXS75/StudyTime.git
   cd StudyTime
   ```

2. **Backend Setup**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

   Create a `.env` file in the backend directory:
   ```
   MONGO_URL="mongodb://localhost:27017"
   DB_NAME="studytime_db"
   CORS_ORIGINS="*"
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install --legacy-peer-deps
   ```

   Create a `.env` file in the frontend directory:
   ```
   VITE_BACKEND_URL=http://localhost:8001
   ```

4. **Start the Application**

   Terminal 1 (Backend):
   ```bash
   cd backend
   python server.py
   ```

   Terminal 2 (Frontend):
   ```bash
   cd frontend
   npm run dev
   ```

5. **Add Your API Key**
   - Click the settings icon (⚙️) in the top-right corner
   - Paste your Google Gemini API key
   - Click "Save API Key"

6. **Start Learning!**
   - Upload a PDF or paste your notes
   - Click "Analyze with AI"
   - Explore summaries, mind maps, chat, and quizzes

## How It Works

1. **Upload**: Upload a PDF or paste text containing your study material
2. **Analysis**: The AI analyzes content and generates:
   - Topic summaries with key points
   - Flashcards for quick review
   - Quiz questions with adaptive difficulty
   - Mind map structure for visual learning
3. **Interactive Learning**:
   - Review structured summaries
   - Explore visual mind maps
   - Ask questions via chat
   - Test yourself with adaptive quizzes

## Design Philosophy

StudyTime AI features an **academic/scholarly design theme** with:
- Modern blue learning palette (no brown hover/click states)
- Crisp, readable fonts and high contrast action elements
- Card-based layouts for organized content
- Smooth transitions and micro-animations

## Session Management (New)

Now supported:
- Multiple study sessions saved in localStorage (`study_sessions`)
- Each session persists: filename, extracted text, analysis output, createdAt
- Select active session from navbar dropdown
- Session-specific Summary / Mind Map / Chat / Quiz content
- Delete unneeded sessions with remove button

## API Endpoints

### Backend API
- `POST /api/upload` - Upload and extract text from PDF
- `POST /api/analyze` - Analyze text with Gemini AI
- `POST /api/chat` - Send chat message and get AI response
- `GET /api/chat/{session_id}` - Get chat history

## Environment Variables

### Backend
- `MONGO_URL` - MongoDB connection string
- `DB_NAME` - Database name
- `CORS_ORIGINS` - Allowed CORS origins

### Frontend
- `REACT_APP_BACKEND_URL` - Backend API URL

## License

MIT

## Acknowledgments

- Built with [Google Gemini API](https://ai.google.dev/)
- Designed for students who want to learn smarter, not harder

---

Made with ❤️ for learners everywhere
