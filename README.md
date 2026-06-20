# The Mindful Aspirant

> *Your digital strategist for mental clarity and exam mastery.*

🔗 **Live Demo:** [https://mindful-aspirant.vercel.app](https://mindful-aspirant.vercel.app)

**The Mindful Aspirant** is a hyper-personalized, calming mental wellness tracker designed specifically for students tackling high-stakes competitive examinations. Built on Next.js 16, powered by Google Gemini 3.5 Flash, styled with a soothing glassmorphic UI, and secured with Clerk and database crisis safety interceptors.

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
