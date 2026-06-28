# JobTracker

AI-powered job application tracker that helps you manage your job search, tailor resumes, practice interviews, and improve your applications — all in one place.

---

## Live Demo

**Application:** https://job-tracker-jt.vercel.app

**Frontend Hosting:** Vercel

**Backend Hosting:** Render

**Repository:** https://github.com/TechBhaskar05/Job-Tracker

---

## Overview

Job hunting involves tracking multiple applications, tailoring each resume, researching companies, and preparing for interviews. JobTracker centralises everything into a single AI-powered platform. It combines Large Language Models (LLMs), semantic search via vector embeddings, and automated agents to help you manage your entire job search lifecycle.

---

## Features

| Feature | Description | Status |
| ------- | ----------- | ------ |
| Kanban Job Board | Drag-and-drop board to manage applications across stages | ✅ |
| Company Research | Auto-researches company culture and news when you add a job | ✅ |
| Resume Tailor | AI rewrites resume bullets to match a job description | ✅ |
| Mock Interview | Role-specific mock interviews with evaluation and voice input | ✅ |
| ATS Analyser | Scores resume fit against a job description from PDF upload | ✅ |
| Career Roadmap | Identifies skill gaps and builds a 5-step learning plan | ✅ |
| Quiz Generator | Generates MCQs on any technical topic for self-testing | ✅ |
| Follow-up Scheduler | Auto-detects stale applications and drafts follow-up emails | ✅ |
| Dashboard | Application stats and weekly chart showing job search activity | ✅ |

---

## Tech Stack

### Frontend

- React 19
- Vite
- Tailwind CSS
- React Router
- Axios
- Recharts
- @dnd-kit (drag and drop)

### Backend

- Node.js
- Express 5

### Database

- MongoDB Atlas

### Authentication

- JWT (JSON Web Tokens)

### AI Stack

- LangChain.js
- Pinecone (vector database)
- Groq API (LLaMA 3)
- HuggingFace (embeddings)
- Tavily (web search)

---

## Architecture

```
Browser (React)
     │
     │ HTTP REST (axios)
     │ Polling every 3s for agent results
     ▼
Express API (port 5000)
     │
     ├── Auth (/api/auth)
     ├── Jobs (/api/jobs)
     ├── Agents (/api/agents)
     ├── Interview (/api/interview)
     ├── ATS (/api/ats)
     ├── Quiz (/api/quiz)
     ├── Roadmap (/api/roadmap)
     └── Notifications (/api/notifications)
     │
     │  AI Agents:
     │  research · tailor · interview · ats
     │  quiz · roadmap · embeddings
     │
     ├── MongoDB Atlas
     └── External APIs (Groq, Pinecone, Tavily, HuggingFace)
```

---

## Feature Flows

### Job Management Flow

```
User adds a job via modal
       │
       ▼
POST /api/jobs → Job saved to MongoDB
       │
       ├── Card appears on Kanban board
       │
       └── Research agent fires in background
               │
               ▼
         Company info appears in job detail
```

### Resume Tailor Flow

```
User clicks "Tailor Resume"
       │
       ▼
POST /api/agents/tailor
       │
       ▼
Embed JD → Search Pinecone for relevant resume chunks
       │
       ▼
Groq rewrites chunks to fit the job description
       │
       ▼
Tailored resume displayed in job detail
```

### Mock Interview Flow

```
User starts interview for a role
       │
       ▼
AI generates first question
       │
       ▼
User answers (text or voice)
       │
       ▼
AI evaluates score + feedback
       │
       ▼
Next question generated (loop up to 10)
```

### ATS Analyser Flow

```
User uploads PDF resume + pastes job description
       │
       ▼
POST /api/ats/analyse
       │
       ▼
PDF text extracted → Groq compares vs JD
       │
       ▼
Score (0-100) + present/missing keywords + recommendations
```

### Career Roadmap Flow

```
User clicks "Generate Roadmap"
       │
       ▼
Analyses last 10 saved jobs
       │
       ▼
Identifies top 5 skill gaps
       │
       ▼
Builds 5-step learning plan with resources
```

---

## Project Structure

```
Job-Tracker/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── lib/
│   │   └── assets/
│   ├── index.html
│   └── vite.config.js
│
├── server/
│   ├── src/
│   │   ├── agents/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── middleware/
│   │   ├── lib/
│   │   └── utils/
│   ├── app.js
│   └── index.js
│
└── README.md
```

---

## Deployment

| Service | Platform |
| ------- | -------- |
| Frontend | Vercel |
| Backend | Render |
| Database | MongoDB Atlas |
| Vector Database | Pinecone |
| LLM | Groq API |

---

## Local Setup

### Clone Repository

```bash
git clone https://github.com/your-username/Job-Tracker.git
cd Job-Tracker
```

### Frontend Setup

```bash
cd client
npm install
npm run dev
```

### Backend Setup

```bash
cd server
npm install
npm run dev
```

---

## Environment Variables

Create a `.env` file inside the `server` directory.

```env
PORT=5000
MONGODB_URI=
JWT_SECRET=
GROQ_API_KEY=
PINECONE_API_KEY=
PINECONE_INDEX=
HUGGINGFACE_API_KEY=
TAVILY_API_KEY=
```

Create a `.env` file inside the `client` directory.

```env
VITE_API_URL=http://localhost:5000
```

---

## Key Highlights

- LangChain-orchestrated AI agents for research, tailoring, interviews, and analysis
- Semantic resume matching via Pinecone vector search
- JWT authentication with ownership-scoped data access
- Drag-and-drop Kanban board for application tracking
- Voice-enabled mock interviews using Web Speech API
- Automated cron-based follow-up detection and notification

---

## Future Improvements

- Real-time collaboration for interview prep
- AI-powered cover letter generation
- Salary insights and negotiation tips
- Chrome extension to save jobs with one click
- Mobile app with push notifications

---

If you found this project useful, consider giving it a ⭐ on GitHub.
