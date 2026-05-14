# 📘 HireWise AI — User Guide

> Complete guide for end-users and developers to set up, run, and use the HireWise AI platform.

---

## Table of Contents
1. [What is HireWise AI?](#1-what-is-hirewise-ai)
2. [System Requirements](#2-system-requirements)
3. [Getting Started (For Users)](#3-getting-started-for-users)
4. [Developer Setup (Local Development)](#4-developer-setup-local-development)
5. [Feature Walkthrough](#5-feature-walkthrough)
6. [Credit System & Pricing](#6-credit-system--pricing)
7. [Interview Modes](#7-interview-modes)
8. [Understanding Your Report](#8-understanding-your-report)
9. [Troubleshooting](#9-troubleshooting)
10. [FAQ](#10-faq)

---

## 1. What is HireWise AI?

HireWise AI is an AI-powered mock interview platform designed to help job seekers practice and improve their interview performance. The platform provides:

- **AI-generated interview questions** tailored to your role, experience, and resume
- **Voice-based interview simulation** with text-to-speech AI interviewer
- **Real-time answer evaluation** across confidence, communication, and correctness
- **Detailed performance analytics** with downloadable PDF reports
- **Interview history tracking** to monitor improvement over time

---

## 2. System Requirements

### For End Users
| Requirement | Details |
|-------------|---------|
| **Browser** | Google Chrome (recommended for speech recognition) |
| **Microphone** | Required for voice-based interviews |
| **Internet** | Stable connection required |
| **Google Account** | Required for authentication |

### For Developers
| Requirement | Details |
|-------------|---------|
| **Node.js** | v18 or higher |
| **npm** | v9 or higher |
| **MongoDB** | Atlas account (free tier works) |
| **Firebase** | Project with Google Auth enabled |
| **OpenRouter** | API key with credit balance |
| **Razorpay** | Test/live keys (for payment features) |

---

## 3. Getting Started (For Users)

### Step 1: Sign In
1. Visit the HireWise AI website.
2. Click **"Start Interview"** or the user icon in the navbar.
3. Click **"Continue with Google"** in the authentication modal.
4. Select your Google account.
5. You're now logged in with 100 free credits!

### Step 2: Start an Interview
1. Navigate to the Interview page.
2. Fill in your **target role** (e.g., "Frontend Developer").
3. Enter your **experience level** (e.g., "2 years").
4. Select your **interview mode** (Technical or HR).
5. *(Optional)* Upload your resume PDF for personalized questions.
6. Click **"Start Interview"** (costs 50 credits).

### Step 3: Answer Questions
1. The AI interviewer will introduce itself and begin asking questions.
2. **Speak your answer** (microphone auto-activates) or **type** in the text area.
3. A countdown timer shows your remaining time per question.
4. Click **"Submit Answer"** when ready, or wait for the timer to auto-submit.
5. The AI will provide instant spoken feedback.
6. Click **"Next Question"** to proceed.

### Step 4: View Your Report
1. After all questions, the AI compiles your performance report.
2. View your **overall score** (out of 10), skill breakdowns, and performance trend.
3. Read **question-by-question feedback** from the AI.
4. Click **"Download PDF"** to save your report.

---

## 4. Developer Setup (Local Development)

### 4.1 Clone the Repository
```bash
git clone <repository-url>
cd Project
```

### 4.2 Backend Setup
```bash
cd server
npm install
```

Create `server/.env`:
```env
PORT=6000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>
JWT_SECRET_KEY=your_jwt_secret_key_here
OPENROUTER_API_KEY=sk-or-v1-your-openrouter-key
RAZORPAY_KEY_ID=rzp_test_your_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

Start the server:
```bash
npm run dev
```

### 4.3 Frontend Setup
```bash
cd client
npm install
```

Create `client/.env`:
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_RAZORPAY_KEY_ID=rzp_test_your_key
```

**Important**: Update `ServerURL` in `client/src/App.jsx`:
```javascript
// Change from production URL to:
export const ServerURL = "http://localhost:6000"
```

Start the frontend:
```bash
npm run dev
```

### 4.4 Verify Setup
1. Open `http://localhost:5173` in Chrome.
2. Click "Continue with Google" — you should see the OAuth popup.
3. After login, your name and 100 credits should appear in the navbar.
4. Try starting an interview to verify OpenRouter connectivity.

---

## 5. Feature Walkthrough

### 5.1 Resume Analysis
- Upload a PDF resume before starting an interview.
- The AI extracts your **role**, **experience**, **projects**, and **skills**.
- Interview questions are then personalized to your resume content.
- **Note**: Only text-based PDFs work. Scanned/image PDFs won't extract text.

### 5.2 Voice Interview
- The AI interviewer speaks using **Web Speech Synthesis** (TTS).
- Prefers Indian English voices when available on the user's system.
- Your microphone input is transcribed using **Web Speech Recognition** (STT).
- The microphone can be toggled on/off during the interview.
- While the AI is speaking, the microphone is automatically muted.

### 5.3 Timer System
- Each question has a time limit based on difficulty:
  - **Easy**: 60 seconds
  - **Medium**: 90 seconds
  - **Hard**: 120 seconds
- Timer pauses while the AI is speaking.
- If time runs out, your answer is auto-submitted with a score of 0.

### 5.4 Scoring Metrics
Each answer is evaluated on three axes:
| Metric | What It Measures |
|--------|-----------------|
| **Confidence** | Clarity, assertiveness, and certainty in delivery |
| **Communication** | Structure, articulation, and coherence |
| **Correctness** | Technical accuracy and relevance of the answer |

### 5.5 Interview History
- All completed interviews are saved to your account.
- View past interviews sorted by date (newest first).
- Each entry shows: role, experience, mode, score, and status.
- Click any entry to view its full report.

### 5.6 PDF Export
- Available on any report page (live or historical).
- Contains: overall score, skill metrics, professional advice, and a question-by-question table.
- File downloads as `AI_Interview_Report.pdf`.

---

## 6. Credit System & Pricing

### Credit Economy
| Action | Credit Cost |
|--------|------------|
| Account creation | +100 credits (free) |
| Start one interview | -50 credits |

### Available Plans
| Plan | Price | Credits | Best For |
|------|-------|---------|----------|
| **Free** | ₹0 | 100 | Beginners (2 free interviews) |
| **Starter Pack** | ₹100 | 150 | Focused practice |
| **Pro Pack** | ₹500 | 650 | Serious preparation (best value) |

### Payment Process
1. Navigate to `/pricing`.
2. Select a plan.
3. Click **"Proceed to Pay"**.
4. Complete payment through the Razorpay checkout widget.
5. Credits are instantly added to your account.
6. You'll see a success animation and auto-redirect to home.

---

## 7. Interview Modes

### Technical Interview
- Questions focus on **technical concepts**, **system design**, **coding principles**, and **problem-solving**.
- Difficulty progresses: 2 easy → 2 medium → 1 hard.
- Resume-based questions target your listed projects and technologies.

### HR Interview
- Questions focus on **behavioral scenarios**, **communication skills**, **teamwork**, and **professional situations**.
- Tests soft skills, leadership potential, and cultural fit.
- Resume-based questions may reference your career trajectory.

---

## 8. Understanding Your Report

### Overall Score (out of 10)
| Range | Assessment |
|-------|-----------|
| 8-10 | Ready for job opportunities |
| 5-7 | Needs minor improvement |
| 0-4 | Significant improvement required |

### Performance Trend Chart
- Shows your score progression across all 5 questions.
- An upward trend suggests you warmed up during the interview.
- A downward trend may indicate fatigue or increasing difficulty.

### Question Breakdown
Each question displays:
- The question text
- Your score (out of 10)
- AI-generated feedback with specific improvement suggestions

---

## 9. Troubleshooting

### Voice Not Working
| Problem | Solution |
|---------|----------|
| AI not speaking | Check browser volume; try Chrome (best TTS support) |
| Microphone not capturing | Allow microphone permission in browser; check system mic settings |
| No Indian voice available | Install Indian English language pack in your OS settings |
| Speech recognition inaccurate | Speak clearly; ensure quiet environment; use Chrome |

### Authentication Issues
| Problem | Solution |
|---------|----------|
| Google popup blocked | Allow popups for the site in browser settings |
| Login not persisting | Ensure cookies are enabled; check if browser blocks third-party cookies |
| "Unauthorized" errors | Try logging out and back in; clear cookies and retry |

### Interview Issues
| Problem | Solution |
|---------|----------|
| "Insufficient credits" | Purchase more credits on the Pricing page |
| Interview stuck on loading | Check internet connection; refresh and try again |
| Empty resume analysis | Ensure PDF is text-based, not a scanned image |
| Timer not pausing | Timer only pauses while AI is actively speaking |

### Payment Issues
| Problem | Solution |
|---------|----------|
| Razorpay widget not opening | Check internet; ensure ad blockers aren't blocking the script |
| Payment succeeded but no credits | Refresh the page; credits should sync on next page load |
| "Payment verification failed" | Contact support; the payment may need manual reconciliation |

---

## 10. FAQ

**Q: Is my resume data stored permanently?**
A: No. The uploaded PDF is stored temporarily in the server's temp directory and is deleted immediately after text extraction. Only the extracted text is stored in your interview document.

**Q: Can I retake an interview?**
A: Yes! Each interview costs 50 credits. You can take as many interviews as your credit balance allows.

**Q: Which browsers support voice features?**
A: Google Chrome has the best support for both Speech Synthesis (TTS) and Speech Recognition (STT). Firefox and Safari have partial support. Edge works but with limited voice options.

**Q: Can I use the platform on mobile?**
A: The UI is responsive and works on mobile devices. However, Speech Recognition may not work on all mobile browsers. Chrome on Android provides the best mobile experience.

**Q: How are my answers evaluated?**
A: Your answers are sent to GPT-4o-mini via OpenRouter. The AI evaluates each answer on confidence (0-10), communication (0-10), and correctness (0-10), then provides a final score and written feedback.

**Q: Is my data secure?**
A: Authentication uses httpOnly JWT cookies (not accessible to JavaScript). All API communication uses HTTPS. Payment signatures are verified using HMAC-SHA256 cryptography.

**Q: What happens if I close the browser during an interview?**
A: The interview will be saved in an "In Progress" state. However, you cannot resume it — you would need to start a new interview. Unanswered questions will have a score of 0.

**Q: Can I change the AI voice?**
A: The voice is automatically selected based on available system voices. The app prefers Indian English voices. You can install additional voice packs in your OS language settings to get different options.
