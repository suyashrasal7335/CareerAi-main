# CareerAI - AI Career Path Copilot

> **"Your AI-powered roadmap from student to career."**

CareerAI is a production-grade full-stack AI career guidance and placement preparation platform built specifically for college students and fresh graduates. It analyzes student academic credentials, current coding skills, aptitude interests, and placement timelines to deliver explainable career matches, visual skill gap matrices, month-by-month interactive roadmaps, ATS resume evaluation, and real-time AI mock interviews.

---

## 🌟 Key Features

1. **Explainable AI Career Recommendation Engine**
   - Transparent match scoring (e.g., 87% fit) calculated from verified skills, academic coursework, and preferences.
   - Grounded explanations: reveals *why* a role matches, exact strengths, and critical gaps to bridge.
   - 13 pre-loaded in-demand tracks: AI/ML Engineer, Full Stack Developer, Data Analyst, Data Scientist, Cybersecurity Analyst, Cloud Engineer, DevOps Engineer, UI/UX Designer, Product Manager, Mobile App Developer, Software Developer, Business Analyst, and Database Engineer.

2. **Context-Aware AI Career Chatbot**
   - Powered by `@google/genai` with `gemini-3.8-flash`.
   - Mentoring persona with student profile awareness (degree, CGPA, target career, and current skills injected automatically).
   - Real-time conversation management, code snippets, suggested queries, and chat history persistence.

3. **Visual Skill Gap Analysis Matrix**
   - Direct comparison of verified student skills vs. recruiter expectations.
   - Clear classification into *Strong*, *Developing*, and *Missing* skills.
   - For every missing skill: explains why it matters, prerequisites, estimated hours, and recommended learning sequence.

4. **Personalized 6-Month Roadmaps with Active Progress Tracking**
   - Month-by-month milestones with specific topics, goals, and capstone project deliverables.
   - Interactive task checklists with live status updates (*Not Started*, *In Progress*, *Completed*).
   - Changes automatically recalculate the Placement Readiness Score across the student dashboard.

5. **AI Resume & ATS Keyword Analyzer**
   - Evaluates resume text against target career descriptions.
   - Generates overall quality score (0–100) and ATS compatibility score.
   - Highlights high-yield missing keywords and provides bullet-point rewrites following the Google X-Y-Z formula.

6. **Interactive AI Mock Interview Simulator**
   - Select role, round type (Technical, System Design, HR, Behavioral), and difficulty level.
   - AI serves questions sequentially, evaluates answers with scores (1–10), constructive critique, ideal candidate model answers, and follow-ups.
   - Concludes with an official Placement Interview Report breaking down technical depth, communication, and problem-solving.

7. **Placement Readiness Score**
   - Transparent aggregate indicator combining Skills Coverage (25%), Capstone Projects (25%), ATS Resume (20%), Mock Interviews (15%), and Roadmap Tasks (15%).

---

## 🛠️ Architecture & Tech Stack

```text
┌────────────────────────────────────────────────────────┐
│                    React 19 Frontend                   │
│   (TypeScript, Tailwind CSS, Lucide Icons, Vite)       │
└───────────────────────────▲────────────────────────────┘
                            │ REST / JSON (JWT Auth)
┌───────────────────────────▼────────────────────────────┐
│                  Express.js Backend                    │
│   (Auth Middleware, Career Matching Engine, REST APIs) │
├───────────────────────────┬────────────────────────────┤
│     Storage Layer         │      AI Service Layer      │
│  (Persistent JSON Store   │   (@google/genai SDK with  │
│   + MongoDB URI Support)  │     gemini-3.8-flash)      │
└───────────────────────────┴────────────────────────────┘
```

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Plus Jakarta Sans typography.
- **Backend**: Node.js, Express.js, TypeScript via `tsx`.
- **Database**: Document store in `./data/careerai_db.json` with file persistence + full support for remote MongoDB Atlas connection strings via `MONGODB_URI`.
- **Authentication**: JSON Web Tokens (JWT) and `bcryptjs` password hashing.
- **AI**: Google GenAI TypeScript SDK (`@google/genai`) configured server-side with structured prompt engineering and robust fallback handlers.

---

## 🚀 Quick Start

### 1. Installation

```bash
npm install
```

### 2. Configure Environment Variables

Create `.env` based on `.env.example`:

```env
GEMINI_API_KEY="your-gemini-api-key"
JWT_SECRET="your-secure-jwt-secret-key"
PORT=3000
AI_MODEL="gemini-3.8-flash"
MONGODB_URI=""
```

### 3. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## 👤 Instant Demo Account

For rapid evaluation and testing without registering, use the one-click demo login button or sign in with:

- **Email**: `demo@careerai.dev`
- **Password**: `password123`
- Pre-loaded with: 3rd Year B.Tech CSE student profile, verified skills (Python, SQL, C++, Git), active AI/ML roadmap, sample resume evaluation, and chat history.

---

## 📡 REST API Endpoints

### Authentication & Profile
- `POST /api/auth/register` — Register student account
- `POST /api/auth/login` — Sign in and receive JWT token
- `GET  /api/auth/me` — Get current authenticated user
- `PUT  /api/profile` — Update skills, goals, preferences

### Chat & Mentorship
- `POST /api/chat` — Send query to CareerAI chatbot
- `GET  /api/chat/history` — Get user conversation history
- `GET  /api/chat/:id` — Get specific conversation messages
- `DELETE /api/chat/:id` — Delete conversation

### Career Intelligence
- `GET  /api/careers` — List all 13 supported career tracks
- `GET  /api/careers/:id` — Detailed career syllabus & market data
- `POST /api/careers/recommend` — Calculate explainable match scores
- `POST /api/assessment` — Submit multi-question career assessment
- `GET  /api/skill-gap` — Visual skill gap audit for target career

### Roadmaps & Placement
- `GET  /api/roadmap` — Get active month-by-month roadmap
- `POST /api/roadmap/generate` — Generate AI personalized roadmap
- `PUT  /api/roadmap/task/:id` — Toggle deliverable completion status
- `GET  /api/roadmap/daily-plan` — Get "What should I learn today?" 60-min plan
- `GET  /api/projects` — Filterable portfolio project blueprints
- `GET  /api/resources` — Curated learning resources directory
- `POST /api/resume/analyze` — Audit resume text for ATS readiness
- `POST /api/interview/start` — Start mock interview session
- `POST /api/interview/answer` — Submit and evaluate interview answer
- `GET  /api/placement-readiness` — Calculate composite readiness score

---

## 🧪 Testing

Run automated backend unit and integration tests:

```bash
npx tsx server/tests/test_api.ts
```

---

## 🔒 Security & AI Safety

- Passwords hashed using standard `bcryptjs` salt rounds; passwords never stored or logged in plain text.
- API keys strictly confined to the server environment; never exposed to browser bundles.
- Transparent explainable scores rather than subjective employment guarantees.
- Salary estimates explicitly labeled as indicative market projections.
