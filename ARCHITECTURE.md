# 🏗️ HireWise AI — Architecture Document

> **Single-source-of-truth** for the project's design, structure, and technical decisions.

---

## 1. PROJECT OVERVIEW

| Field | Details |
|-------|---------|
| **App Name** | HireWise AI |
| **What It Does** | AI-powered mock interview platform with voice interaction, adaptive difficulty, real-time scoring, and downloadable PDF reports |
| **Key Business Features** | Google OAuth login, resume parsing, AI question generation, voice-based interviews with TTS/STT, per-question scoring (confidence/communication/correctness), interview history dashboard, PDF report export, credit-based monetization via Razorpay |

### Complete Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend Framework** | React | 19 | Component-based UI |
| **Build Tool** | Vite | 8 | Dev server & bundler |
| **Styling** | Tailwind CSS | v4 | Utility-first CSS with custom dark theme |
| **Animations** | Motion (Framer Motion) | 12 | Page transitions, micro-interactions, parallax |
| **State Management** | Redux Toolkit | 2.11 | Global auth state |
| **Routing** | React Router | v7 | Client-side SPA routing |
| **Charts** | Recharts | 3.8 | Performance trend area charts |
| **PDF Export** | jsPDF + jspdf-autotable | 4.2 / 5.0 | Downloadable interview reports |
| **Icons** | react-icons | 5.6 | BS, FA, HI icon sets |
| **Backend Framework** | Express.js | 5 | REST API server |
| **Runtime** | Node.js | 18+ | Server runtime |
| **Database** | MongoDB Atlas | — | Document store (Mongoose ODM) |
| **Authentication** | Firebase Auth (client) + JWT (server) | — | Google OAuth popup + httpOnly cookie sessions |
| **AI / LLM** | OpenRouter → GPT-4o-mini | — | Resume parsing, question generation, answer evaluation |
| **Payments** | Razorpay | 2.9 | Credit purchase with HMAC signature verification |
| **PDF Parsing** | pdfjs-dist (legacy) | 5.5 | Server-side resume text extraction |
| **File Upload** | Multer | 2.1 | multipart/form-data handling |
| **HTTP Client** | Axios | 1.13 | Frontend→Backend and Backend→OpenRouter |

---

## 2. WHY THIS ARCHITECTURE?

### Architecture Choice: **Monolithic MVC with Layered Separation**

The application uses a single Express.js server with clear MVC layering (Models → Controllers → Routes → Services) and a decoupled React SPA frontend.

### Advantages
- **Simplicity**: One deployment unit per tier (frontend on Vercel/CDN, backend on Render)
- **Fast Development**: No inter-service communication overhead, shared models
- **Easy Debugging**: Single log stream, single process, linear request flow
- **Low Cost**: Can run on a single free-tier Render instance

### Disadvantages / Trade-offs
- **Vertical Scaling Only**: The entire backend scales as one unit (can't scale AI processing independently)
- **Single Point of Failure**: If the Express server crashes, all features go down
- **Tight Coupling**: AI service, payment logic, and user management share the same process

### When This Choice Is Appropriate
- ✅ Solo developer / small team projects
- ✅ MVPs and proof-of-concept applications
- ✅ Applications with < 10,000 concurrent users
- ❌ NOT ideal for high-throughput AI workloads needing independent scaling

---

## 3. HIGH-LEVEL ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT (React SPA)                          │
│                        Port: 5173 (dev)                            │
│                                                                     │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌──────────┐          │
│  │  Home    │  │  Auth    │  │ Interview │  │ Pricing  │          │
│  │  Page    │  │  Page    │  │   Page    │  │   Page   │          │
│  └────┬─────┘  └────┬─────┘  └─────┬─────┘  └────┬─────┘          │
│       │              │              │              │                │
│  ┌────┴──────────────┴──────────────┴──────────────┴────┐          │
│  │              Redux Store (userSlice)                  │          │
│  └──────────────────────┬───────────────────────────────┘          │
│                         │ Axios (withCredentials)                   │
└─────────────────────────┼───────────────────────────────────────────┘
                          │ HTTPS + JWT Cookie
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     SERVER (Express.js)                             │
│                     Port: 6000                                      │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    MIDDLEWARE LAYER                          │   │
│  │  cors → express.json → cookieParser → isAuth → multer       │   │
│  └──────────────────────────┬──────────────────────────────────┘   │
│                              │                                      │
│  ┌───────────┐  ┌───────────┴───┐  ┌─────────────┐  ┌──────────┐ │
│  │ /api/auth │  │/api/interview │  │ /api/payment│  │/api/user │ │
│  │  Routes   │  │    Routes     │  │   Routes    │  │  Routes  │ │
│  └─────┬─────┘  └──────┬───────┘  └──────┬──────┘  └────┬─────┘ │
│        │               │                  │               │       │
│  ┌─────┴─────┐  ┌──────┴───────┐  ┌──────┴──────┐  ┌────┴─────┐ │
│  │   Auth    │  │  Interview   │  │   Payment   │  │   User   │ │
│  │Controller │  │  Controller  │  │  Controller │  │Controller│ │
│  └─────┬─────┘  └──────┬───────┘  └──────┬──────┘  └────┬─────┘ │
│        │               │                  │               │       │
│  ┌─────┴───────────────┴──────────────────┴───────────────┴─────┐ │
│  │                      MODEL LAYER                              │ │
│  │       User.model    Interview.model    Payment.model          │ │
│  └──────────────────────────┬────────────────────────────────────┘ │
│                              │                                      │
│  ┌──────────────────────────┴────────────────────────────────────┐ │
│  │                    SERVICE LAYER                               │ │
│  │         openRouter.service.js    razorpay.service.js           │ │
│  └──────────────────────────────────────────────────────────────┘  │
└───────────┬─────────────────────────┬───────────────────────────────┘
            │                         │
            ▼                         ▼
    ┌───────────────┐         ┌───────────────┐
    │  MongoDB      │         │  OpenRouter   │
    │  Atlas        │         │  API (GPT-4o) │
    └───────────────┘         └───────────────┘
            │
            ▼
    ┌───────────────┐
    │  Razorpay     │
    │  Gateway      │
    └───────────────┘
```

---

## 4. SERVICE/MODULE BREAKDOWN

### 4.1 Backend (`server/`)

| File | Purpose |
|------|---------|
| `index.js` | Server entry point, CORS, middleware mounting, route registration |
| `config/connectDB.js` | MongoDB Atlas connection via Mongoose |
| `config/token.js` | JWT generation using HS256 |
| `middlewares/isAuth.js` | JWT cookie verification, injects `req.userId` |
| `middlewares/multer.js` | PDF upload handling (disk storage, 5MB limit) |
| `controllers/auth.controller.js` | Google OAuth login (find-or-create), logout (clear cookie) |
| `controllers/interview.controller.js` | Resume parsing, AI question gen, answer eval, report gen |
| `controllers/payment.controller.js` | Razorpay order creation, HMAC signature verification |
| `controllers/user.controller.js` | Current user profile retrieval |
| `routes/auth.route.js` | POST /google-auth, GET /logout |
| `routes/interview.route.js` | POST /resume, /generate-questions, /submit-answer, /finish; GET /get-interview, /report/:id |
| `routes/payment.route.js` | POST /order, POST /verify |
| `routes/user.route.js` | GET /current-user |
| `services/openRouter.service.js` | OpenRouter API wrapper (GPT-4o-mini) |
| `services/razorpay.service.js` | Razorpay SDK singleton instantiation |

### 4.2 Frontend (`client/src/`)

| File | Purpose |
|------|---------|
| `main.jsx` | React root, provider hierarchy (Router + Redux) |
| `App.jsx` | Route definitions, session rehydration, ambient background |
| `index.css` | Tailwind v4 config, dark-mode tokens, glassmorphism utilities |
| `redux/store.js` | Redux Toolkit store configuration |
| `redux/userSlice.js` | User authentication state slice |
| `utils/firebase.js` | Firebase Auth + Google Provider initialization |
| `utils/motion.js` | Centralized Framer Motion animation variants |
| `components/Navbar.jsx` | Top navigation with credit display, user menu, auth modal |
| `components/AuthModel.jsx` | Modal wrapper for inline Google login |
| `components/CustomCursor.jsx` | Custom emerald dot cursor with lerp smoothing |
| `components/Footer.jsx` | Bottom branding bar |
| `components/MagneticButton.jsx` | Spring-physics button with shimmer sweep effect |
| `components/SpotlightCard.jsx` | Hover-reactive card with glow and shimmer |
| `components/Timer.jsx` | Circular countdown timer (react-circular-progressbar) |
| `components/Step1SetUp.jsx` | Interview setup wizard (role, experience, resume upload) |
| `components/Step2Interview.jsx` | Live interview UI (TTS, STT, video, timer, Q&A) |
| `components/Step3Report.jsx` | Analytics dashboard (charts, PDF download) |
| `pages/Home.jsx` | Landing page with hero, feature cards, parallax |
| `pages/Auth.jsx` | Google OAuth login page |
| `pages/InterviewPage.jsx` | 3-step wizard orchestrator (Setup → Interview → Report) |
| `pages/InterviewHistory.jsx` | Past interviews list with scores |
| `pages/Pricing.jsx` | Credit purchase plans with Razorpay checkout |
| `pages/InterviewReport.jsx` | Report viewer (fetches data, renders Step3Report) |

---

## 5. INTER-MODULE COMMUNICATION

### Synchronous (HTTP REST)

```
Frontend (Axios)  ──HTTP/HTTPS──►  Backend (Express)  ──HTTP──►  OpenRouter API
                                                       ──HTTP──►  Razorpay API
```

All communication is **synchronous REST over HTTPS**. No message queues, WebSockets, or async event systems are used.

### Key Communication Flows

| Flow | Frontend → Backend | Backend → External |
|------|-------------------|-------------------|
| Login | POST /api/auth/google-auth | — |
| Resume Analysis | POST /api/interview/resume | OpenRouter AI |
| Question Generation | POST /api/interview/generate-questions | OpenRouter AI |
| Answer Submission | POST /api/interview/submit-answer | OpenRouter AI |
| Payment | POST /api/payment/order → POST /api/payment/verify | Razorpay API |

---

## 6. DATABASE DESIGN

### MongoDB Collections

| Collection | Owner | Key Fields | Indexes |
|-----------|-------|------------|---------|
| `users` | auth.controller, user.controller | `name`, `email` (unique), `credits` (default: 100) | Unique index on `email` |
| `interviews` | interview.controller | `userId` (ref: User), `role`, `experience`, `mode`, `resumeText`, `questions[]` (embedded), `finalScore`, `status` | — |
| `payments` | payment.controller | `userId` (ref: User), `planId`, `amount`, `credits`, `razorpayOrderId`, `razorpayPaymentId`, `status` | — |

### Embedded Document: `questions` (inside `interviews`)
| Field | Type | Description |
|-------|------|-------------|
| `question` | String | AI-generated question text |
| `difficulty` | String | easy / medium / hard |
| `timeLimit` | Number | Seconds allocated (60/90/120) |
| `answer` | String | User's transcribed response |
| `feedback` | String | AI evaluation feedback |
| `score` | Number | Overall score (0-10) |
| `confidence` | Number | Confidence metric (0-10) |
| `communication` | Number | Communication metric (0-10) |
| `correctness` | Number | Correctness metric (0-10) |

---

## 7. AUTHENTICATION & SECURITY

### Auth Flow

```
User clicks "Continue with Google"
        │
        ▼
Firebase SDK opens Google OAuth popup
        │
        ▼
Google returns user profile (name, email)
        │
        ▼
Frontend POSTs {name, email} to /api/auth/google-auth
        │
        ▼
Backend finds or creates User document
        │
        ▼
Backend generates JWT with userId payload
        │
        ▼
Backend sets httpOnly cookie (token)
        │
        ▼
Frontend dispatches user data to Redux store
```

### Security Patterns

| Pattern | Implementation | Purpose |
|---------|---------------|---------|
| httpOnly Cookies | `res.cookie("token", token, { httpOnly: true })` | Prevents XSS from stealing JWT |
| Secure Flag | `secure: true` | Cookie only sent over HTTPS |
| SameSite None | `sameSite: "none"` | Allows cross-origin cookie (frontend ≠ backend domain) |
| CORS Whitelist | Only localhost:5173 and production domain | Blocks unauthorized origins |
| HMAC-SHA256 | Payment signature verification | Prevents forged payment confirmations |
| File Size Limit | Multer `limits: { fileSize: 5MB }` | DoS protection |
| Temp File Cleanup | `fs.unlinkSync` after PDF parsing | Prevents disk space exhaustion |

---

## 8. FRONTEND ARCHITECTURE

### File/Folder Structure
```
client/src/
├── assets/          # Static images (9 PNGs) + videos (2 MP4s)
├── components/      # Reusable UI components (10 files)
├── pages/           # Route-level page components (6 files)
├── redux/           # State management (store + userSlice)
├── utils/           # Firebase config + motion variants
├── App.jsx          # Root component with routing
├── App.css          # Empty (all styles in index.css)
├── index.css        # Tailwind v4 theme + custom utilities
└── main.jsx         # Entry point
```

### State Management
- **Redux Toolkit** with a single `user` slice
- `userData: null | UserObject` — the only global state
- All other state is local (component-level `useState`)

### Design System
- **Tailwind CSS v4** with inverted gray scale (dark mode)
- Custom `@theme` tokens: emerald palette, premium shadows, glassmorphism
- Custom utility classes: `.glass-panel`, `.glass-panel-dark`, `.text-gradient`
- Google Fonts: **Inter** (body) + **Outfit** (display headings)

### Routing
- React Router v7 with `BrowserRouter`
- `AnimatePresence` for page transition animations
- 6 routes: `/`, `/auth`, `/interview`, `/history`, `/pricing`, `/report/:id`

---

## 9. INFRASTRUCTURE SETUP

### Environment Variables

**Server (`server/.env`)**:
| Variable | Purpose |
|----------|---------|
| `PORT` | Server port (default: 6000) |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET_KEY` | Secret for signing JWTs |
| `OPENROUTER_API_KEY` | API key for OpenRouter (LLM access) |
| `RAZORPAY_KEY_ID` | Razorpay public key |
| `RAZORPAY_KEY_SECRET` | Razorpay private key (HMAC signing) |

**Client (`client/.env`)**:
| Variable | Purpose |
|----------|---------|
| `VITE_FIREBASE_API_KEY` | Firebase project API key |
| `VITE_RAZORPAY_KEY_ID` | Razorpay public key (for checkout widget) |

### Startup Order
1. Start MongoDB Atlas (cloud — always running)
2. Start backend: `cd server && npm run dev` (nodemon)
3. Start frontend: `cd client && npm run dev` (vite)

---

## 10. ERROR HANDLING PATTERNS

### Backend
Every controller follows the same pattern:
```javascript
export const handler = async (req, res) => {
    try {
        // Business logic
        return res.status(200).json(data)
    } catch (error) {
        return res.status(500).json({ message: `Descriptive error: ${error}` })
    }
}
```

### Frontend
API errors are caught in try/catch blocks:
```javascript
try {
    const result = await axios.post(ServerURL + "/api/...", data, { withCredentials: true })
    // Handle success
} catch (error) {
    console.log(error)
    // Show alert or set error state
}
```

---

## 11. COMPLETE API REFERENCE

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/google-auth` | ❌ | Login/register via Google OAuth |
| GET | `/api/auth/logout` | ❌ | Clear session cookie |
| GET | `/api/user/current-user` | ✅ | Get authenticated user profile |
| POST | `/api/interview/resume` | ✅ | Upload & parse resume PDF |
| POST | `/api/interview/generate-questions` | ✅ | Generate 5 AI questions (costs 50 credits) |
| POST | `/api/interview/submit-answer` | ✅ | Submit answer for AI evaluation |
| POST | `/api/interview/finish` | ✅ | Finalize interview, compute scores |
| GET | `/api/interview/get-interview` | ✅ | Get all user's interview history |
| GET | `/api/interview/report/:id` | ✅ | Get detailed report for one interview |
| POST | `/api/payment/order` | ✅ | Create Razorpay order |
| POST | `/api/payment/verify` | ✅ | Verify payment & credit user |

---

## 12. KEY DESIGN DECISIONS

| Decision | Why |
|----------|-----|
| Firebase Auth on client, JWT on server | Offloads Google OAuth complexity to Firebase SDK; server only needs to verify identity and issue its own session token |
| OpenRouter instead of direct OpenAI | Unified API for multiple LLM providers; easy model switching; often cheaper routing |
| Embedded questions in Interview document | Questions always accessed with their interview (1-to-few); eliminates expensive `$lookup` JOINs |
| httpOnly cookies over localStorage | XSS-proof token storage; browser auto-sends on every request |
| Credits system (not subscription) | Pay-per-use model suits casual users; simpler to implement than recurring billing |
| pdfjs-dist/legacy for server-side PDF | Avoids Web Worker dependency in Node.js; synchronous operation |
| Tailwind v4 inverted grays | Achieves dark-mode SaaS aesthetic without maintaining separate dark/light themes |
| No token expiration | Simplifies UX (user stays logged in); trades security for convenience |

---

## 13. KNOWN CONSIDERATIONS & DEBUGGING TIPS

| Issue | Cause | Fix |
|-------|-------|-----|
| CORS errors in development | `ServerURL` hardcoded to production URL | Change `ServerURL` in App.jsx to `http://localhost:6000` |
| Cookie not sent cross-origin | Missing `sameSite: "none"` + `secure: true` | Both must be set; `secure` requires HTTPS (use ngrok for local testing) |
| PDF parsing returns empty text | Scanned/image-based PDFs have no text layer | Only text-based PDFs are supported; OCR would be needed for scanned docs |
| AI returns malformed JSON | LLM sometimes wraps output in markdown fences | The `replace(/```json\n?|\n?```/g, "")` cleanup handles this |
| `mongoose` typo in Payment.model.js | Variable named `mongooose` instead of `mongoose` | Functionally harmless (it's just a local variable name) but should be corrected |
| Speech synthesis silent on Chrome | Chrome drops utterances if `cancel()` + `speak()` are called immediately | 50ms `setTimeout` delay between cancel and speak (see Step2Interview.jsx) |
| Credits not updating in UI after interview | Redux store has stale data | `dispatch(setUserData({...userData, credits: result.data.creditsLeft}))` updates it |
| Razorpay checkout not opening | `VITE_RAZORPAY_KEY_ID` missing in client `.env` | Ensure the env variable is set and Vite is restarted after changes |
