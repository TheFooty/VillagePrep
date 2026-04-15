# VillagePrep — Complete Overhaul Implementation Plan

> **Goal**: Transform VillagePrep from a working prototype into a production-grade, competitive AI study platform on par with Quizlet & Studocu. This document is designed to be handed off to an AI agent for autonomous execution.
>
> **AI Provider**: Gemini 1.5 Flash via `GEMINI_API_KEY`. Do NOT switch to OpenRouter or any other provider.

---

## Current State Assessment

### What Exists
VillagePrep is a Next.js 16 + Supabase + TailwindCSS app with:
- **Landing page**, **email OTP login** (Resend), **teacher portal**, **student portal** — all in a **single 1,956-line `page.tsx`**
- 13 API routes: `ai`, `auth`, `classes`, `enroll`, `folders`, `notes`, `parse-pdf`, `progress`, `study-set-content`, `study-set-files`, `study-sets`, `user-data`, `youtube`
- AI via Gemini 1.5 Flash (direct REST, no streaming)
- File parsing: DOCX (mammoth), text, images (Tesseract OCR) — **PDF is disabled**
- YouTube transcript extraction
- Study tools: AI notes, flashcards, quiz, study plan, podcast script, summary, chat

### Critical Problems Found

| Category | Issue | Severity |
|---|---|---|
| **Architecture** | Entire app is one 1,956-line file. Zero components, no separation | 🔴 Critical |
| **Security** | API keys exposed in `.env.local` committed to Git. Auth stores OTP code in plain cookies. No session tokens, no JWT, no middleware protection. Any user can access any other user's data by changing email in requests | 🔴 Critical |
| **Auth** | Cookie-based OTP with no server-side session. Verification code stored in plain cookie (visible to client). No rate limiting. Duplicate `/app/auth/route.ts` returns 501 | 🔴 Critical |
| **AI** | Gemini API key needs to be added to `.env.local` as `GEMINI_API_KEY`. No streaming. Hardcoded content limits (3-8k chars). No conversation memory | 🟡 High |
| **PDF Parsing** | disabled — returns error. This is a core feature gap | 🔴 Critical |
| **Data Persistence** | Mix of localStorage + Supabase + in-memory store. Race conditions between cloud sync and local sync. `saveToCloud` fires on every state change (no debouncing) | 🟡 High |
| **Teacher Portal** | Extremely basic — only create class, no editing, no student management, no analytics | 🟡 High |
| **Progress Tracking** | API exists but never called from frontend | 🟡 High |
| **Layout/Metadata** | Title says "Create Next App". No real SEO, OG tags, or sitemap | 🟡 High |
| **State Management** | 30+ `useState` hooks in StudentPortal. No context, no state management | 🟡 High |
| **Mobile** | Semi-responsive but tab bar overflows on mobile, chat is cramped | 🟠 Medium |
| **Generated Content** | Generated flashcards/notes/quizzes are ephemeral — lost on page reload unless manually saved via study-set-content API (which is never called from frontend) | 🟡 High |
| **Error Handling** | Mix of `alert()`, `prompt()`, custom Toast — inconsistent | 🟠 Medium |
| **Markdown** | Custom regex parser is fragile — strips code blocks, broken table parsing | 🟠 Medium |
| **Testing** | Zero tests | 🟠 Medium |

---

## User Review Required

> [!CAUTION]
> **API Keys are committed to Git.** The `.env.local` file at the root contains your Supabase URL, Supabase anon key, OpenRouter API key, and Resend API key. These should be rotated immediately and added to `.gitignore`. The inner `VillagePrep-main/.env.local` should also not be committed.

> [!IMPORTANT]
> **AI will work once `GEMINI_API_KEY` is added to `.env.local`.** The AI route correctly uses Gemini 1.5 Flash. The user will add the API key themselves. Do NOT change the provider.

> [!WARNING]
> **Authentication is insecure.** The OTP code is stored in a plain browser cookie. Anyone who inspects cookies can see the login code. This must be replaced with server-side session management using Supabase Auth or a JWT-based approach.

---

## Phase 1: Security & Foundation (Priority: 🔴 CRITICAL)

### 1A. Fix Secrets & Git Hygiene

#### [MODIFY] [.gitignore](file:///c:/Users/vmydu/Downloads/VillagePrep-main/.gitignore)
- Remove `VillagePrep-main/` (this is the actual project!)
- Add proper entries: `.env`, `.env.local`, `.env*.local`, `node_modules/`, `.next/`, `.vercel/`

#### [DELETE] [.env.local](file:///c:/Users/vmydu/Downloads/VillagePrep-main/.env.local) (root level — duplicate)
- Move to inner project directory, ensure it's gitignored
- Rotate ALL compromised keys

#### [MODIFY] [.env.local](file:///c:/Users/vmydu/Downloads/VillagePrep-main/VillagePrep-main/.env.local)
- Ensure `GEMINI_API_KEY` placeholder is present (user will fill in the real key)
- Add `NEXTAUTH_SECRET` or equivalent session secret

---

### 1B. Real Authentication System

#### [NEW] `lib/auth.ts`
- Implement proper server-side session management
- Option A: Use Supabase Auth (magic link or OTP) — **recommended**, removes need for custom auth entirely
- Option B: If keeping custom: store OTP in Supabase with expiry, not in cookies. Use signed HTTP-only session cookies or JWTs after verification

#### [MODIFY] [route.ts](file:///c:/Users/vmydu/Downloads/VillagePrep-main/VillagePrep-main/app/api/auth/route.ts)
- Remove cookie-based OTP storage
- Store OTP in Supabase `auth_codes` table with `email`, `code`, `expires_at`, `attempts`
- Add rate limiting (max 3 attempts per code, max 5 codes per hour per email)
- On verification: create a signed JWT session token, set as HTTP-only secure cookie
- Add CSRF protection

#### [NEW] `middleware.ts` (project root)
- Protect all `/api/*` routes (except `/api/auth`) — require valid session
- Protect data access — ensure users can only access their own data
- Add rate limiting headers

#### [DELETE] [route.ts](file:///c:/Users/vmydu/Downloads/VillagePrep-main/VillagePrep-main/app/auth/route.ts)
- This duplicate placeholder file returns 501 and conflicts with `/api/auth`

---

### 1C. Improve AI Route

#### [MODIFY] [route.ts](file:///c:/Users/vmydu/Downloads/VillagePrep-main/VillagePrep-main/app/api/ai/route.ts)
- Keep using Gemini 1.5 Flash (`GEMINI_API_KEY`). Do NOT switch providers.
- Add streaming support (SSE / ReadableStream) for real-time AI responses
- Respect `customPrompt` for flashcard count and quiz difficulty
- Add content chunking — current 3-8k char limits lose most of the user's content
- Add response caching for identical prompts
- Add proper conversation memory for chat mode
- Add graceful error when `GEMINI_API_KEY` is missing (show "Add your Gemini API key in settings" instead of crashing)

---

## Phase 2: Architecture Decomposition (Priority: 🔴 CRITICAL)

### Break the 1,956-line `page.tsx` into proper components

#### [NEW] Component Files
```
app/
├── components/
│   ├── ui/
│   │   ├── Button.tsx               # Primary, Secondary, Ghost, Icon variants
│   │   ├── Input.tsx                # Text, Email, Code inputs
│   │   ├── Modal.tsx                # Reusable modal wrapper
│   │   ├── Toast.tsx                # Toast notification system
│   │   ├── Spinner.tsx              # Loading spinner
│   │   ├── LoadingDots.tsx          # Chat-style loading
│   │   ├── Card.tsx                 # Elevate card wrapper
│   │   ├── Badge.tsx                # Status badges
│   │   └── Tabs.tsx                 # Tab navigation component
│   ├── layout/
│   │   ├── Header.tsx               # App header with user info
│   │   ├── Sidebar.tsx              # Sidebar navigation (desktop)
│   │   ├── MobileNav.tsx            # Bottom nav for mobile
│   │   └── Footer.tsx               # Footer component
│   ├── landing/
│   │   ├── LandingPage.tsx          # Full landing page
│   │   ├── HeroSection.tsx          # Hero with animations
│   │   ├── FeaturesSection.tsx      # Feature cards
│   │   └── PricingSection.tsx       # Pricing table
│   ├── auth/
│   │   ├── LoginScreen.tsx          # Login form
│   │   └── AuthProvider.tsx         # Auth context provider
│   ├── student/
│   │   ├── StudentDashboard.tsx     # Main dashboard
│   │   ├── ClassCard.tsx            # Individual class card
│   │   ├── StudySetCard.tsx         # Study set display
│   │   ├── FolderCard.tsx           # Folder display
│   │   └── StatsGrid.tsx            # Dashboard statistics
│   ├── study/
│   │   ├── StudyView.tsx            # Main study interface wrapper
│   │   ├── NotesView.tsx            # AI notes display
│   │   ├── ChatView.tsx             # AI chat interface
│   │   ├── FlashcardView.tsx        # Flashcard study mode
│   │   ├── QuizView.tsx             # Quiz mode
│   │   ├── StudyPlanView.tsx        # Study plan display
│   │   ├── PodcastView.tsx          # Podcast script
│   │   └── SummaryView.tsx          # Summary display
│   ├── teacher/
│   │   ├── TeacherDashboard.tsx     # Teacher main view
│   │   ├── ClassCreator.tsx         # Create/edit class form
│   │   ├── StudentRoster.tsx        # View enrolled students
│   │   └── ClassAnalytics.tsx       # Performance metrics
│   └── shared/
│       ├── MarkdownRenderer.tsx     # Markdown display (use react-markdown)
│       ├── FileUploader.tsx         # Drag-and-drop file upload
│       └── YouTubeImporter.tsx      # YouTube URL input
├── contexts/
│   ├── AuthContext.tsx              # User authentication state
│   ├── StudyContext.tsx             # Study session state
│   └── ToastContext.tsx             # Global toast notifications
├── hooks/
│   ├── useAuth.ts                   # Auth hook
│   ├── useStudySession.ts          # Study session management
│   ├── useAI.ts                    # AI API calls with streaming
│   ├── useLocalStorage.ts          # Type-safe localStorage
│   ├── useDebounce.ts              # Debounce hook for saves
│   └── useClasses.ts               # Class data fetching
├── types/
│   └── index.ts                    # All TypeScript interfaces
├── utils/
│   ├── api.ts                      # Centralized API client
│   └── constants.ts                # App-wide constants
```

#### [MODIFY] [page.tsx](file:///c:/Users/vmydu/Downloads/VillagePrep-main/VillagePrep-main/app/page.tsx)
- Reduce to ~30 lines: import `AuthProvider`, conditionally render Landing → Login → Dashboard
- All 1,900+ lines of current code gets distributed into above components

---

## Phase 3: Database Schema & Data Layer (Priority: 🟡 HIGH)

### Supabase Schema (create via migration SQL)

#### [NEW] `supabase/migrations/001_initial_schema.sql`

```sql
-- Users (supplement Supabase Auth)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  role TEXT CHECK (role IN ('teacher', 'student')) NOT NULL DEFAULT 'student',
  avatar_url TEXT,
  school TEXT,
  grade_level TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Classes
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  content TEXT,
  test_date DATE,
  teacher_id UUID REFERENCES profiles(id),
  share_code TEXT UNIQUE,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enrollments
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES profiles(id),
  class_id UUID REFERENCES classes(id),
  enrolled_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, class_id)
);

-- Study Sets
CREATE TABLE study_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  folder_id UUID REFERENCES folders(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Study Set Files (uploaded content)
CREATE TABLE study_set_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_set_id UUID REFERENCES study_sets(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  content TEXT,
  file_type TEXT,
  file_size INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Folders
CREATE TABLE folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  color TEXT DEFAULT '#14b8a6',
  parent_id UUID REFERENCES folders(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Generated Content (AI outputs)
CREATE TABLE generated_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  study_set_id UUID REFERENCES study_sets(id),
  class_id UUID REFERENCES classes(id),
  content_type TEXT CHECK (content_type IN ('notes', 'flashcards', 'quiz', 'studyplan', 'podcast', 'summary')),
  content JSONB NOT NULL,
  prompt_hash TEXT,  -- for caching
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Flashcard Progress (spaced repetition)
CREATE TABLE flashcard_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  flashcard_set_id UUID REFERENCES generated_content(id),
  card_index INTEGER NOT NULL,
  ease_factor FLOAT DEFAULT 2.5,
  interval_days INTEGER DEFAULT 1,
  repetitions INTEGER DEFAULT 0,
  next_review TIMESTAMPTZ DEFAULT now(),
  last_review TIMESTAMPTZ,
  UNIQUE(user_id, flashcard_set_id, card_index)
);

-- Quiz Results
CREATE TABLE quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  quiz_id UUID REFERENCES generated_content(id),
  class_id UUID REFERENCES classes(id),
  score INTEGER NOT NULL,
  total INTEGER NOT NULL,
  answers JSONB,
  time_taken INTEGER, -- seconds
  completed_at TIMESTAMPTZ DEFAULT now()
);

-- Study Sessions
CREATE TABLE study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  class_id UUID,
  study_set_id UUID,
  activity_type TEXT,
  duration_seconds INTEGER,
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ
);

-- Chat History
CREATE TABLE chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  class_id UUID,
  study_set_id UUID,
  messages JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Notes (personal annotations per class)
CREATE TABLE student_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  class_id UUID REFERENCES classes(id),
  content TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, class_id)
);

-- Row Level Security Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_set_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcard_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_notes ENABLE ROW LEVEL SECURITY;

-- Example RLS: users can only read/write their own data
CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
-- (similar policies for all tables)
```

---

## Phase 4: Core Feature Upgrades (Priority: 🟡 HIGH)

### 4A. Fix PDF Parsing

#### [MODIFY] [route.ts](file:///c:/Users/vmydu/Downloads/VillagePrep-main/VillagePrep-main/app/api/parse-pdf/route.ts)
- Use `pdf-parse` (already in devDeps as `@types/pdf-parse`) or `pdfjs-dist` for PDF text extraction
- Alternative: Use `unpdf` which works well in Node/Edge environments
- Add PowerPoint support (`.pptx`) via `pptx-parser` or similar
- Add `.xlsx` support for spreadsheet content
- Add file size validation (reject files > 20MB)
- Add content sanitization

### 4B. Streaming AI Responses

#### [MODIFY] [route.ts](file:///c:/Users/vmydu/Downloads/VillagePrep-main/VillagePrep-main/app/api/ai/route.ts)
- Keep Gemini 1.5 Flash. Do NOT change the provider.
- Implement Server-Sent Events (SSE) streaming via Gemini's `streamGenerateContent` endpoint
- Implement smart content chunking for large documents (split, summarize chunks, combine)
- Cache generated content to Supabase `generated_content` table

#### [NEW] `hooks/useAI.ts`
- Streaming response handler using `ReadableStream`
- Show real-time text generation in UI
- Automatic retry with exponential backoff
- Token usage tracking

### 4C. Spaced Repetition System (SM-2 Algorithm)

#### [NEW] `lib/spaced-repetition.ts`
- Implement SM-2 algorithm for flashcard scheduling
- Track: ease factor, interval, repetitions, next review date
- Quality ratings: Again (0), Hard (1), Good (2), Easy (3)

#### [NEW] `components/study/FlashcardView.tsx` (enhanced)
- Show cards due for review first
- "Know it" / "Almost" / "Still learning" buttons
- Progress bar showing mastery percentage
- Daily review queue

### 4D. Enhanced Quiz System

#### [NEW] `components/study/QuizView.tsx` (enhanced)
- Timed quiz mode (optional countdown)
- Question types: multiple choice, true/false, fill-in-the-blank, short answer
- Detailed results breakdown with per-topic analysis
- Quiz history with performance trends graph
- Incorrect answer review mode (re-quiz on missed questions)

### 4E. Markdown Rendering

#### Replace fragile regex parser with proper library

**Add dependency:** `react-markdown`, `remark-gfm`, `rehype-highlight`

#### [NEW] `components/shared/MarkdownRenderer.tsx`
- Use `react-markdown` with GFM support
- Syntax highlighting for code blocks
- Proper table rendering
- Math/LaTeX support via `remark-math` + `rehype-katex`
- Mermaid diagram support

---

## Phase 5: Teacher Portal Expansion (Priority: 🟡 HIGH)

### 5A. Teacher Dashboard

#### [NEW] `components/teacher/TeacherDashboard.tsx`
- Overview cards: total students, active classes, average quiz scores, engagement rate
- Recent activity feed
- Quick actions: create class, view analytics

### 5B. Class Management

#### [NEW] `components/teacher/ClassEditor.tsx`
- Edit class name, content, test dates
- Multi-file upload to class content
- Content preview with markdown rendering
- Shareable join link / class code

#### [NEW] `components/teacher/StudentRoster.tsx`
- View all enrolled students per class
- Student progress overview: quiz scores, flashcard mastery, study time
- Sort/filter by performance

### 5C. Analytics Dashboard

#### [NEW] `components/teacher/ClassAnalytics.tsx`
- Class-wide quiz score distribution (histogram)
- Topic area heatmap (which topics students struggle with)
- Engagement metrics (study sessions per day, average duration)
- Individual student drill-down
- Export data as CSV

---

## Phase 6: UX/UI Polish & Mobile (Priority: 🟠 MEDIUM)

### 6A. Responsive Design Overhaul

#### [MODIFY] `app/globals.css`
- Add comprehensive responsive breakpoints
- Mobile-first tab navigation (bottom tab bar on mobile)
- Swipeable flashcards on mobile
- Touch-friendly button sizing (min 44px tap targets)
- Proper viewport handling for mobile keyboards

### 6B. Design System Completion

#### [NEW] `app/design-tokens.css`
- Define complete color palette with semantic naming
- Typography scale (5 sizes)
- Spacing scale (8px base grid)
- Border radius tokens
- Shadow tokens (elevation system)
- Animation duration/easing tokens

### 6C. Micro-interactions

- Flashcard flip animation (3D CSS transform)
- Quiz answer reveal animation
- Progress bar fill animation
- Skeleton loading states for all data-fetching components
- Smooth page transitions between dashboard and study view
- Confetti animation on quiz completion with good score

### 6D. Empty States & Onboarding

#### [NEW] `components/shared/EmptyState.tsx`
- Illustrated empty states for: no classes, no study sets, no folders, no files
- First-time user onboarding flow (guided tour)
- Contextual help tooltips

### 6E. Drag-and-Drop File Upload

#### [NEW] `components/shared/FileUploader.tsx`
- Drag-and-drop zone with visual feedback
- Multi-file upload support
- Upload progress indicator
- File type validation with helpful error messages
- Thumbnail preview for images

---

## Phase 7: SEO, Performance & Infrastructure (Priority: 🟠 MEDIUM)

### 7A. SEO & Metadata

#### [MODIFY] [layout.tsx](file:///c:/Users/vmydu/Downloads/VillagePrep-main/VillagePrep-main/app/layout.tsx)
- Fix title: "VillagePrep — AI-Powered Study Assistant"
- Add proper meta description, OG tags, Twitter card
- Add favicon and apple-touch-icon
- Add structured data (JSON-LD) for education software
- Language attribute

#### [NEW] `app/sitemap.ts`
- Auto-generated sitemap for SEO

#### [NEW] `app/robots.ts`
- Proper robots.txt

### 7B. Performance Optimization

#### [MODIFY] [next.config.ts](file:///c:/Users/vmydu/Downloads/VillagePrep-main/VillagePrep-main/next.config.ts)
- Add image optimization config
- Configure headers (security headers, CORS)
- Enable compression
- Configure bundle analyzer

#### Optimization Tasks
- Lazy load study views (dynamic imports)
- Debounce cloud saves (currently fires on every keystroke)
- Implement `useSWR` or `TanStack Query` for data fetching with caching
- Add loading.tsx files for Suspense boundaries
- Image optimization with `next/image`
- Bundle size analysis and tree-shaking

### 7C. Error Handling & Monitoring

#### [NEW] `app/error.tsx` — Global error boundary
#### [NEW] `app/not-found.tsx` — Custom 404 page
#### [NEW] `lib/error-handler.ts` — Centralized error handling
- Replace all `alert()` and `prompt()` calls with proper modals
- Add error logging (consider Sentry integration)
- Add API error retry logic

---

## Phase 8: Competitive Feature Parity (Priority: 🟢 FUTURE)

These features would put VillagePrep on par or ahead of Quizlet/Studocu:

### 8A. Study Modes
- [ ] **Learn Mode** — Adaptive learning that focuses on what you don't know (like Quizlet Learn)
- [ ] **Match Game** — Drag-and-drop matching game for terms/definitions
- [ ] **Write Mode** — Type the answer from memory
- [ ] **Audio Flashcards** — Text-to-speech for cards (use Web Speech API)
- [ ] **Real Podcast Generation** — Use TTS API (ElevenLabs/OpenAI) to generate actual audio

### 8B. Collaboration
- [ ] **Shared Study Sets** — Public/private/link-shared study sets
- [ ] **Class Forums** — Q&A threads per class
- [ ] **Real-time Study Rooms** — Timer-based group study sessions
- [ ] **Leaderboards** — Class-wide quiz score rankings (opt-in)

### 8C. Content Intelligence
- [ ] **Auto-detect weak areas** — Analyze quiz results to identify knowledge gaps
- [ ] **Smart Review** — Daily personalized review queue based on SM-2
- [ ] **Cross-reference** — Connect related concepts across multiple study sets
- [ ] **Explain Like I'm 5** — AI simplification of difficult concepts

### 8D. Import/Export
- [ ] **Import Quizlet sets** — Parse shared Quizlet URLs
- [ ] **Import Anki decks** — `.apkg` file support
- [ ] **Export to PDF** — Generated notes/flashcards as downloadable PDF
- [ ] **Print flashcards** — Printer-friendly layout

### 8E. Mobile App (PWA)
- [ ] **Service Worker** — Offline access to downloaded study sets
- [ ] **Web App Manifest** — Installable PWA
- [ ] **Push Notifications** — "Time to review 15 flashcards" reminders
- [ ] **Offline Mode** — Queue actions when offline, sync when back

### 8F. Monetization Infrastructure
- [ ] **Stripe integration** — Subscription billing
- [ ] **Free tier limits** — X AI generations per day, limited file uploads
- [ ] **Pro tier** — Unlimited AI, all file types, analytics
- [ ] **Teacher tier** — Unlimited classes, advanced analytics, priority support

---

## Dependency Updates

### Add These Packages
```json
{
  "dependencies": {
    "react-markdown": "^9.0.0",
    "remark-gfm": "^4.0.0",
    "rehype-highlight": "^7.0.0",
    "remark-math": "^6.0.0",
    "rehype-katex": "^7.0.0",
    "jose": "^6.0.0",           // JWT handling
    "unpdf": "^0.12.0",         // PDF parsing
    "swr": "^2.3.0",            // Data fetching
    "framer-motion": "^12.0.0", // Animations
    "date-fns": "^4.0.0",       // Date utilities
    "zod": "^3.24.0",           // Input validation
    "nanoid": "^5.0.0"          // ID generation
  }
}
```

### Remove / Replace
- `pdf2json` → replace with `unpdf`
- `canvas` (`@napi-rs/canvas`) → likely unused (Tesseract handles OCR)

---

## File Structure After Refactor

```
VillagePrep-main/
├── app/
│   ├── api/
│   │   ├── ai/route.ts              # Streaming AI (OpenRouter)
│   │   ├── auth/route.ts            # Proper JWT auth
│   │   ├── classes/route.ts         # CRUD with RLS
│   │   ├── enroll/route.ts          # Enrollment management
│   │   ├── folders/route.ts         # Folder CRUD
│   │   ├── notes/route.ts           # Student notes
│   │   ├── parse-pdf/route.ts       # PDF + multi-format parser
│   │   ├── progress/route.ts        # Progress tracking
│   │   ├── study-sets/route.ts      # Study set CRUD
│   │   ├── study-set-files/route.ts # File management
│   │   └── youtube/route.ts         # YouTube transcript
│   ├── components/                   # (see Phase 2 tree above)
│   ├── contexts/
│   ├── hooks/
│   ├── types/
│   ├── utils/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx                      # ~30 lines
│   ├── error.tsx
│   ├── not-found.tsx
│   ├── loading.tsx
│   ├── sitemap.ts
│   └── robots.ts
├── lib/
│   ├── supabase.ts                   # Supabase client (server + browser)
│   ├── auth.ts                       # Auth utilities
│   ├── spaced-repetition.ts          # SM-2 algorithm
│   └── error-handler.ts              # Error utilities
├── middleware.ts                      # Auth + rate limiting
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── public/
│   ├── favicon.ico
│   ├── apple-touch-icon.png
│   ├── og-image.png
│   └── manifest.json
├── .env.local                        # NEVER commit
├── .env.example                      # Template for env vars
├── next.config.ts
├── package.json
├── tsconfig.json
└── README.md                         # Real documentation
```

---

## Execution Order

| Order | Phase | Est. Time | Dependency |
|---|---|---|---|
| 1 | **1A** — Fix secrets & Git | 30 min | None |
| 2 | **1B** — Auth system | 4 hours | 1A |
| 3 | **1C** — Fix AI route | 2 hours | 1A |
| 4 | **2** — Architecture decomposition | 6 hours | 1B, 1C |
| 5 | **3** — Database schema | 3 hours | 1B |
| 6 | **4A** — PDF parsing | 2 hours | 2 |
| 7 | **4B** — Streaming AI | 3 hours | 2, 1C |
| 8 | **4C** — Spaced repetition | 3 hours | 3 |
| 9 | **4D** — Enhanced quizzes | 2 hours | 2 |
| 10 | **4E** — Markdown rendering | 1 hour | 2 |
| 11 | **5A-C** — Teacher portal | 4 hours | 2, 3 |
| 12 | **6A-E** — UX/UI polish | 5 hours | 2 |
| 13 | **7A-C** — SEO & performance | 3 hours | 2 |
| 14 | **8A-F** — Competitive features | Ongoing | All above |

**Total core work:** ~38 hours across Phases 1–7

---

## Verification Plan

### Automated Tests
- Run `npm run lint` — fix all ESLint errors
- Run `npm run build` — verify zero build errors
- Run `npx tsc --noEmit` — verify TypeScript types

### Manual Verification (per phase)
1. **Auth**: Register, login, logout flow. Verify sessions persist across refresh. Verify unauthorized access is blocked.
2. **AI**: Send chat message, verify streaming response renders word-by-word. Generate flashcards, quiz — verify JSON parsing works.
3. **File Upload**: Upload PDF, DOCX, image, text file. Verify content extraction.
4. **Study Tools**: Generate notes, flashcards (5/10/20), quiz (easy/medium/hard × 5/10/15), study plan, podcast, summary. Verify all render correctly.
5. **Progress**: Complete a quiz, check that score appears in progress. Review flashcards, verify SM-2 scheduling.
6. **Teacher**: Create class, verify students can see it. View enrolled students and their progress.
7. **Mobile**: Test all screens at 375px, 768px, 1024px widths.
8. **SEO**: Run Lighthouse audit — target 90+ on all scores.

### Browser Testing
- Use browser tool to navigate through all major flows and capture screenshots
- Verify no console errors
- Verify all API calls return 200/201
