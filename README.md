# The Mindful Aspirant

> *Your digital strategist for mental clarity and exam mastery.*

**The Mindful Aspirant** is a hyper-personalized, calming mental wellness tracker designed specifically for students tackling high-stakes competitive examinations. Built on Next.js 16, powered by Google Gemini 3.5 Flash, styled with a soothing glassmorphic UI, and secured with Clerk and database crisis safety interceptors.

🔗 **Live Demo:** [https://mindful-aspirant.vercel.app](https://mindful-aspirant.vercel.app)

Note: It's Good to create new sign-up to properly onboard of Exam aspirantand give the details of the preferences.
Or use below test account:

Test account: learning.nci@gmail.com
pwd: mAr5zp6h2GHtj4F


---

## 🌟 Key Features

1. **Mindful Dashboard:** A comprehensive view of student well-being featuring:
   * **Weekly Emotional Pulse:** A smooth, interactive `Recharts` area gradient chart mapping mood scores over the past 7 days.
   * **Key Stress Triggers:** An aggregated frequency dashboard extracting triggers (e.g. mock exam anxiety, backlog pressure) from reflection entries.
   * **Quick Mood Logger:** An interactive 5-emoji mood check-in widget with contextual tags.
2. **Daily Reflections (Journal):** A distraction-free, calming writing space for daily journaling:
   * **Real-time AI Sentiment Analysis:** Classifies primary emotions (anxious, Low, Focused, Confident, etc.).
   * **Cognitive Reframing Advice:** Provides personalized, empathetic advice.
   * **Crisis Safety Guardrails:** Scans entries locally using keyword matching for self-harm intent *before* any AI processing, triggering support overlays.
3. **Empathetic Study Companion:** A real-time, streaming chatbot built with Vercel AI SDK to support students through study burnout and mock test anxiety.

---

## 🛠️ Technology Stack

* **Frontend Framework:** Next.js 16 (App Router)
* **Styling:** Tailwind CSS v4 (Glassmorphic theme, light-only calming colors)
* **Authentication:** Clerk Next.js SDK
* **Database & ORM:** Vercel Postgres / Neon Serverless connected via WebSocket secure proxy (`@prisma/adapter-neon` + `@neondatabase/serverless` on port 443) & Prisma ORM
* **GenAI Engine:** Google Gemini 3.5 Flash via Vercel AI SDK

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies

```bash
git clone <repository-url>
cd MentalWellnessTracker
npm install
```
*Note: Installs all packages and runs `prisma generate` to build the local type-safe client.*

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/dashboard

# Vercel Postgres (Neon)
POSTGRES_URL="postgresql://neondb_owner:..."
POSTGRES_URL_NON_POOLING="postgresql://neondb_owner:..."

# Google Gemini API Key
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSy...
```

### 3. Database Schema Push

Initialize the Neon database tables:

```bash
npx prisma db push
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📦 Deployment

This project is fully ready for deployment to Vercel:

1. **Deploy Production:**
   ```bash
   npx vercel --prod
   ```
2. **Push Production Schema:**
   Ensure environment variables (`CLERK_SECRET_KEY`, `POSTGRES_URL`, `GOOGLE_GENERATIVE_AI_API_KEY`) are set in Vercel settings, then schema pushes run automatically on Vercel builds via `npm run vercel-build`.

---

## 🔒 Security Hardening

To ensure student safety, privacy, and system reliability, the following safety and security measures have been implemented:

1. **Security Headers (CSP, HSTS):** 
   Configured strong response headers in `next.config.ts` including strict Content-Security-Policy (with domains restricted to Clerk auth and self-origin), clickjacking protection (`X-Frame-Options: DENY`), MIME-sniffing protection (`X-Content-Type-Options: nosniff`), and Strict-Transport-Security.
2. **Endpoint Rate Limiting:**
   Added an in-memory sliding-window rate limiter in `src/lib/rate-limit.ts` applying per-user rate limits:
   * AI-heavy routes (`/api/chat`, `/api/journal/analyze`): **5 requests/minute**
   * Read-heavy routes (`/api/dashboard`): **20 requests/minute**
   * Profile/logger routes (`/api/mood`, `/api/user`): **30 requests/minute**
3. **Strict Input Sanitization:**
   Inputs are sanitized using helper functions in `src/lib/sanitize.ts` to strip HTML/XML tags and restrict strings to their maximum safe lengths before being stored or sent to Gemini.
4. **Prompt Injection Mitigations:**
   * **First-order prompt injection:** User journal text is wrapped in delimiters (`[START JOURNAL ENTRY]` and `[END JOURNAL ENTRY]`) and sanitized to prevent system prompt overrides.
   * **Second-order prompt injection:** The `targetExam` field is fully sanitized before being stored in the database and interpolated into the companion's system prompt.
5. **PII and Data Minimization:** 
   No PII (such as emails, user IDs, names) is passed to Google Gemini. Only the sanitized exam name and raw journal text are sent for processing.
6. **Encapsulated Responses:** 
   Internal database UUIDs are kept hidden from the client to prevent ID-based reconnaissance.

---

## 🧪 Testing & Code Coverage

We maintain a comprehensive suite of 33 unit and route integration tests using **Vitest** and **v8 Coverage**.

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Generate Coverage Report
```bash
npm run test:coverage
```

### Coverage Overview
The test suite achieves **>80% statement coverage** across the entire application, testing:
* **Crisis Detection:** Positive/negative keyword matching, case-sensitivity, and boundary conditions.
* **Sanitization:** HTML stripping, tag filtering, prompt structuring, and type safety checks.
* **Rate Limiting:** Sliding-windows, request blocking under stress, and sliding-window resets.
* **User Resolution:** DB find-or-create logic and error boundaries.
* **API Endpoints:** Request routing, Zod parsing error responses, and rate limit header verification.

