# The Mindful Aspirant

> *Your digital strategist for mental clarity and exam mastery.*

**The Mindful Aspirant** is a hyper-personalized, calming mental wellness tracker designed specifically for students tackling high-stakes competitive examinations. 

Built with a premium Lovable-inspired aesthetic, the application provides a distraction-free, beautifully immersive environment to log moods, journal reflections, and chat with an empathetic AI peer.

**🚀 Live Demo:** [https://mindful-aspirant.vercel.app](https://mindful-aspirant.vercel.app)

![Mindful Aspirant Dashboard](/public/preview-dashboard.png)

---

## 🌟 Architecture & Tech Stack

This application is built on a modern, highly scalable serverless architecture designed for speed, safety, and seamless UI rendering.

* **Frontend Framework:** Next.js 16 (App Router)
* **Styling:** Tailwind CSS v4 featuring a custom Glassmorphic Dark Theme.
* **Authentication:** Clerk Next.js SDK for secure, frictionless onboarding.
* **Database & ORM:** Neon Serverless PostgreSQL database connected via WebSocket proxy (`@neondatabase/serverless`), abstracted with Prisma ORM.
* **GenAI Engine:** Google Gemini 3.5 Flash streamed via Vercel AI SDK.

### Architecture Flow
1. **Client Layer:** Renders the responsive glassmorphic UI. Uses React state and `lucide-react` icons. All heavy animations are hardware-accelerated CSS keyframes to ensure 60fps scrolling.
2. **Edge Network:** All incoming requests hit Next.js middleware where Clerk validates authentication tokens and enforces route protection.
3. **Serverless API:** API routes (`/api/chat`, `/api/journal`, `/api/mood`) process business logic. They run through a strict security interceptor layer (Zod validation, Rate Limiting, Crisis Detection).
4. **Data Layer:** Prisma queries the Neon database to fetch or store securely structured user data.

---

## 🎨 Premium Template Design

The entire application was overhauled to feature a stunning, **Strict Dark Mode** aesthetic inspired by modern, premium web apps like Lovable.dev.

### Design Highlights:
* **Luminous Background Flow:** The global background is driven by hardware-accelerated, floating CSS radial gradients in deep Purple, Blue, and Emerald hues. They gracefully drift behind the UI, blending via a lightweight CSS noise overlay to create a soft, matte "frosted glass" aura without GPU pixelation.
* **Glassmorphism & Depth:** Sidebars, navigation elements, and cards utilize semi-transparent surfaces (`bg-surface-container/60`) and heavy backdrop blurs. This creates a deep 3D hierarchy as the background glowing orbs bleed through the UI elements.
* **Fluid Typography & Radii:** Uses soft pill-shaped buttons, heavily rounded cards (`rounded-[24px]`), and dynamic type scaling to create a highly organic, approachable layout.
* **Tactile Interactions:** Micro-animations (like the pulse on the logo, `active:scale-95` button presses, and hover elevation shadows) give the app a physical, responsive feel.

---

## 🔒 Security & Testing

The application has been fully audited and strictly hardened. 

### Security Implementations:
1. **Pre-AI Crisis Detection:** Every journal entry and chat message is intercepted locally using RegEx keyword heuristics before being sent to Gemini. If self-harm or severe distress is detected, AI processing is halted and a Crisis Support Modal is immediately presented.
2. **Data Sanitization & Injection Defense:** All user inputs are strictly typed with Zod schemas. Text is stripped of HTML/XML and wrapped in delimiters to prevent second-order prompt injection attacks on the LLM.
3. **Endpoint Rate Limiting:** A sliding-window rate limiter restricts abusive traffic across all endpoints (e.g., 5 req/min for AI endpoints, 30 req/min for simple data fetches).
4. **No PII Exposure:** Personal Identifying Information (emails, names) is never sent to the LLM.

### Unit Testing:
The core business and security logic is validated by **35 passing unit tests** via Vitest, achieving high coverage on:
* Text Sanitizers & Guardrails
* Crisis Detection engine
* In-memory Rate Limiters
* User Database Resolution
* API Route Integration tests (Mood, Journal, Chat)

---

## 🚀 Getting Started

### 1. Clone & Install
```bash
git clone <repository-url>
cd MentalWellnessTracker
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
POSTGRES_URL="postgresql://neondb_owner:..."
GOOGLE_GENERATIVE_AI_API_KEY=...
```

### 3. Initialize & Run
```bash
npx prisma db push
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

---

## 👨‍💻 End Credits

**Architected & Built by:** [prajwalsprakash](https://github.com/prajwalsprakash)

*Designed with ❤️ for students navigating the pressures of competitive exams.*
