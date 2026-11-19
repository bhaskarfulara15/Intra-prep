# AI Interview Preparation Platform 🚀

A modern, full-stack, AI-powered interview preparation web platform tailored for college students, freshers, and job seekers. Practice Quantitative Aptitude, Technical CS/Programming, HR, Job Description-based, and Resume-tailored interviews with real-time AI question generation and evaluation.

---

## 🌟 Key Features

- **Full Authentication**: Secure registration, login, JWT token verification, and bcrypt password hashing.
- **5 Interview Categories**:
  - Quantitative Aptitude (Percentages, Profit/Loss, Time & Work, Speed/Distance, Probability, etc.)
  - Technical Interview (Java, Python, C++, JS, DSA, DBMS, OS, Networks, OOP, System Design, SQL)
  - HR & Behavioral (Situational, leadership, teamwork, behavioral STAR questions)
  - Job Description-Based (Paste JD; AI extracts skills & crafts targeted questions)
  - Resume-Based (Upload PDF/DOCX; AI interrogates real projects, tech stack, and experience)
- **Multi-Provider Free-Tier AI Architecture**:
  - Primary: Google Gemini API (gemini-1.5-flash / gemini-2.0-flash / gemini-2.5-flash free tier)
  - Alternative: Groq API (free high-speed inference)
  - Offline Fallback Engine: Curated question & evaluation fallback bank when quotas expire
- **Dynamic Assessment**:
  - Timed distraction-free interview simulator
  - Multidimensional scoring (Technical Accuracy, Conceptual Understanding, Relevance, Completeness, Clarity)
  - Instant granular feedback: What went well, what was missing, ideal model answer, study concepts
- **Analytics & History**:
  - Performance tracking with Recharts
  - Category breakdown, strengths & weaknesses analysis, printable/reviewable report cards

---

## 🏗️ Architecture & Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, React Router DOM v6, Axios, Lucide React, Recharts
- **Backend**: Node.js, Express.js (ES Modules), REST APIs, JWT, bcryptjs, Multer, Zod
- **Database**: MySQL 8.0+ via `mysql2/promise` with normalized relational schema
- **Resume Parsing**: `pdf-parse` (PDF) and `mammoth` (DOCX)
- **AI Engine**: Modular provider adapter supporting Google Gemini & Groq with automatic fallback

---

## 📂 Project Structure

```text
mini_project/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Full route pages
│   │   ├── layouts/        # App & Auth layout wrappers
│   │   ├── services/       # Axios API client
│   │   ├── context/        # Auth & State contexts
│   │   ├── hooks/          # Custom React hooks
│   │   ├── assets/         # Images & static assets
│   │   ├── App.jsx         # App router & providers
│   │   └── main.jsx        # Entry point
│   └── package.json
│
├── server/                 # Express REST API backend
│   ├── src/
│   │   ├── config/         # DB & Environment configs
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Auth, error, upload, validation
│   │   ├── models/         # Database query helpers
│   │   ├── routes/         # Express routers
│   │   ├── services/       # AI provider & resume parsers
│   │   ├── utils/          # Helpers & fallback data
│   │   └── server.js       # Express server entry
│   ├── uploads/            # Temporary secure resume uploads
│   └── package.json
│
├── database/
│   └── schema.sql          # MySQL database schema DDL
├── .gitignore
└── README.md
```

---

## ⚡ Quick Start

### 1. Database Setup
Ensure MySQL Server is running locally or connect to a cloud MySQL instance:
```bash
mysql -u root -p < database/schema.sql
```

### 2. Backend Setup
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your MySQL credentials and free GEMINI_API_KEY
npm run dev
```

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.
