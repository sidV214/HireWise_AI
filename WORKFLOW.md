# 🔄 HireWise AI — Workflow Guide

> Maps every user-facing action to the exact code path it traverses across frontend and backend.

---

## 1. USER AUTHENTICATION (Google OAuth Login)

### User Action
User clicks **"Continue with Google"** button on Auth page or AuthModel.

### Complete Code Path

```
Auth.jsx :: handleGoogleAuth()
  │
  ├─ signInWithPopup(auth, provider)           // Firebase SDK opens Google popup
  │   └─ Returns: response.user (displayName, email)
  │
  ├─ axios.POST → /api/auth/google-auth        // Sends {name, email} to backend
  │   └─ auth.route.js → router.post("/google-auth", googleAuth)
  │       └─ auth.controller.js :: googleAuth()
  │           ├─ User.findOne({ email })         // Check if user exists
  │           ├─ User.create({ name, email })    // Create if new (100 default credits)
  │           ├─ generateToken(user._id)         // JWT signed with HS256
  │           ├─ res.cookie("token", token, {    // Set httpOnly session cookie
  │           │     httpOnly: true,
  │           │     secure: true,
  │           │     sameSite: "none",
  │           │     maxAge: 100 years
  │           │   })
  │           └─ res.json(user)                  // Return user document
  │
  └─ dispatch(setUserData(result.data))          // Update Redux store
      └─ Navbar re-renders with user initial + credit count
```

### Files Touched
`Auth.jsx` → `firebase.js` → `auth.route.js` → `auth.controller.js` → `User.model.js` → `token.js` → `userSlice.js`

---

## 2. SESSION REHYDRATION (Page Load)

### User Action
User refreshes any page or navigates to the app.

### Complete Code Path

```
App.jsx :: useEffect (runs on mount)
  │
  ├─ axios.GET → /api/user/current-user (withCredentials: true)
  │   └─ Browser auto-sends JWT cookie
  │       └─ user.route.js → router.get("/current-user", isAuth, getCurrentUser)
  │           ├─ isAuth middleware:
  │           │   ├─ req.cookies.token → jwt.verify(token, secret)
  │           │   └─ Injects req.userId into request object
  │           └─ user.controller.js :: getCurrentUser()
  │               ├─ User.findById(req.userId)
  │               └─ res.json(user)
  │
  ├─ SUCCESS: dispatch(setUserData(result.data))
  └─ FAILURE: dispatch(setUserData(null))         // User stays logged out
```

### Files Touched
`App.jsx` → `user.route.js` → `isAuth.js` → `user.controller.js` → `User.model.js` → `userSlice.js`

---

## 3. RESUME UPLOAD & ANALYSIS

### User Action
User uploads a PDF resume on the Interview Setup page and clicks **"Analyze Resume"**.

### Complete Code Path

```
Step1SetUp.jsx :: handleUploadResume()
  │
  ├─ new FormData().append("resume", resumeFile)
  │
  ├─ axios.POST → /api/interview/resume (multipart/form-data)
  │   └─ interview.route.js → router.post("/resume", isAuth, upload, analyzeResume)
  │       ├─ isAuth: JWT verification
  │       ├─ multer middleware:
  │       │   ├─ DiskStorage → saves file to os.tmpdir()
  │       │   ├─ Filename: `resume-${Date.now()}.pdf`
  │       │   └─ Validates: only .pdf, max 5MB
  │       └─ interview.controller.js :: analyzeResume()
  │           ├─ fs.promises.readFile(req.file.path)
  │           ├─ pdfjs-dist: getDocument(data) → iterates all pages
  │           │   └─ Concatenates all text items into resumeText
  │           ├─ askAI(systemPrompt, resumeText)  // OpenRouter → GPT-4o-mini
  │           │   └─ System prompt requests JSON: {role, experience, projects[], skills[]}
  │           ├─ JSON.parse(cleanedResponse)       // Strip markdown fences
  │           ├─ fs.unlinkSync(req.file.path)      // Delete temp file
  │           └─ res.json({ role, experience, projects, skills, resumeText })
  │
  ├─ setRole(result.data.role)
  ├─ setSkills(result.data.skills)
  ├─ setProjects(result.data.projects)
  └─ setAnalysisDone(true)                        // Show analysis results UI
```

### Files Touched
`Step1SetUp.jsx` → `interview.route.js` → `isAuth.js` → `multer.js` → `interview.controller.js` → `openRouter.service.js` → filesystem

---

## 4. INTERVIEW QUESTION GENERATION

### User Action
User fills in role + experience, optionally analyzes resume, and clicks **"Start Interview"**.

### Complete Code Path

```
Step1SetUp.jsx :: handleStart()
  │
  ├─ axios.POST → /api/interview/generate-questions
  │   Body: { role, experience, mode, resumeText, projects, skills }
  │   └─ interview.route.js → router.post("/generate-questions", isAuth, generateQuestions)
  │       └─ interview.controller.js :: generateQuestions()
  │           ├─ User.findById(req.userId)
  │           ├─ Validate: user.credits >= 50         // Minimum cost per interview
  │           ├─ Construct AI prompt with role + context
  │           ├─ askAI(systemPrompt, userPrompt)       // OpenRouter → GPT-4o-mini
  │           │   └─ Returns 5 questions (newline-separated)
  │           ├─ Split response into 5 question strings
  │           ├─ user.credits -= 50; await user.save() // Deduct credits
  │           ├─ Interview.create({                     // Create interview document
  │           │     userId, role, experience, mode,
  │           │     questions: [
  │           │       { question, difficulty: "easy", timeLimit: 60 },   // Q1
  │           │       { question, difficulty: "easy", timeLimit: 60 },   // Q2
  │           │       { question, difficulty: "medium", timeLimit: 90 }, // Q3
  │           │       { question, difficulty: "medium", timeLimit: 90 }, // Q4
  │           │       { question, difficulty: "hard", timeLimit: 120 }   // Q5
  │           │     ]
  │           │   })
  │           └─ res.json({ interviewId, creditsLeft, userName, questions })
  │
  ├─ dispatch(setUserData({...userData, credits: result.data.creditsLeft}))
  ├─ onStart(result.data)  // Triggers step transition: Step 1 → Step 2
  └─ InterviewPage.jsx → setStep(2) → renders <Step2Interview>
```

### Files Touched
`Step1SetUp.jsx` → `interview.route.js` → `isAuth.js` → `interview.controller.js` → `openRouter.service.js` → `User.model.js` → `Interview.model.js` → `InterviewPage.jsx` → `userSlice.js`

---

## 5. LIVE INTERVIEW SESSION

### User Action
The interview begins. AI speaks questions aloud, user answers via voice/typing.

### Lifecycle

```
Step2Interview.jsx :: Mount
  │
  ├─ useEffect: loadVoices()
  │   └─ window.speechSynthesis.getVoices()
  │       └─ Priority: Indian English voices → fallback to any English voice
  │
  ├─ useEffect: runIntro() (triggered when selectedVoice is set)
  │   ├─ speakText("Hi {name}, it's great to meet you...")   // TTS introduction
  │   ├─ speakText("I'll ask you a few questions...")
  │   ├─ setIsIntroPhase(false)
  │   └─ speakText(currentQuestion.question)                 // Reads Q1 aloud
  │
  ├─ useEffect: Timer countdown
  │   └─ setInterval → decrements timeLeft every 1s
  │       └─ Pauses when AI is speaking (isAIPlaying) or transitioning
  │
  ├─ useEffect: Speech Recognition (WebkitSpeechRecognition)
  │   ├─ recognition.lang = "en-IN"
  │   ├─ recognition.continuous = true
  │   ├─ onresult → appends transcript to answer state
  │   └─ onend → auto-restarts if mic is on & AI isn't speaking
  │
  ├─ USER ANSWERS (voice transcription fills textarea)
  │   └─ User can also type directly into the textarea
  │
  ├─ SUBMIT (button click or timer reaches 0):
  │   └─ submitAnswer()
  │       ├─ axios.POST → /api/interview/submit-answer
  │       │   Body: { interviewId, questionIndex, answer, timeTaken }
  │       │   └─ interview.controller.js :: submitAnswer()
  │       │       ├─ Interview.findById(interviewId)
  │       │       ├─ If no answer → score 0, generic feedback
  │       │       ├─ If time exceeded → score 0, timeout feedback
  │       │       ├─ Else → askAI(systemPrompt, question+answer)
  │       │       │   └─ Returns JSON: {confidence, communication, correctness, finalScore, feedback}
  │       │       ├─ Updates question subdocument with scores
  │       │       └─ res.json({ feedback })
  │       ├─ setFeedback(result.data.feedback)
  │       └─ speakText(feedback)                             // AI reads feedback aloud
  │
  ├─ NEXT QUESTION:
  │   └─ handleNext()
  │       ├─ speakText("Alright, let's move to the next question.")
  │       ├─ setAnswer(""), setFeedback("")
  │       ├─ setCurrentIndex(currentIndex + 1)
  │       └─ useEffect triggers speakText(nextQuestion)
  │
  └─ FINISH (after last question):
      └─ handleNext() detects currentIndex + 1 >= questions.length
          ├─ speakText("That concludes our interview...")
          └─ finishInterview()                              // See next workflow
```

### Files Touched
`Step2Interview.jsx` → `Timer.jsx` → `interview.route.js` → `interview.controller.js` → `openRouter.service.js` → `Interview.model.js`

---

## 6. INTERVIEW FINALIZATION & REPORT

### User Action
Last question's "Next Question" button triggers automatic finalization.

### Complete Code Path

```
Step2Interview.jsx :: finishInterview()
  │
  ├─ setMicState(false); stopMic()
  │
  ├─ axios.POST → /api/interview/finish
  │   Body: { interviewId }
  │   └─ interview.controller.js :: finishInterview()
  │       ├─ Interview.findById(interviewId)
  │       ├─ Iterate all questions:
  │       │   totalScore += q.score || 0
  │       │   totalConfidence += q.confidence || 0
  │       │   totalCommunication += q.communication || 0
  │       │   totalCorrectness += q.correctness || 0
  │       ├─ avgScore = totalScore / questions.length
  │       ├─ interview.finalScore = avgScore
  │       ├─ interview.status = "Completed"
  │       ├─ await interview.save()
  │       └─ res.json({
  │             finalScore, confidence, communication, correctness,
  │             questionWiseScore: [{question, score, feedback}, ...]
  │           })
  │
  ├─ onFinish(result.data) → InterviewPage.jsx → setStep(3)
  └─ Renders <Step3Report report={data}>
      ├─ CircularProgressbar (overall score)
      ├─ Skill bars (confidence, communication, correctness)
      ├─ AreaChart (Recharts performance trend)
      ├─ Question-by-question breakdown with AI feedback
      └─ Download PDF button → jsPDF export
```

### Files Touched
`Step2Interview.jsx` → `interview.controller.js` → `Interview.model.js` → `InterviewPage.jsx` → `Step3Report.jsx`

---

## 7. PDF REPORT DOWNLOAD

### User Action
User clicks **"Download PDF"** on the report page.

### Complete Code Path (client-side only)

```
Step3Report.jsx :: downloadPDF()
  │
  ├─ new jsPDF("p", "mm", "a4")
  ├─ Renders title: "AI Interview Performance Report"
  ├─ Renders score box: "Final Score: X/10"
  ├─ Renders skill metrics (Confidence, Communication, Correctness)
  ├─ Renders professional advice (conditional on score range)
  ├─ autotable: Question table with #, Question, Score, Feedback columns
  └─ doc.save("AI_Interview_Report.pdf")   // Browser downloads the file
```

### Files Touched
`Step3Report.jsx` (jsPDF + jspdf-autotable — **no backend call**)

---

## 8. CREDIT PURCHASE (Razorpay Payment)

### User Action
User selects a plan on the Pricing page and clicks **"Proceed to Pay"**.

### Complete Code Path

```
Pricing.jsx :: handlePayment(plan)
  │
  ├─ axios.POST → /api/payment/order
  │   Body: { planId, amount, credits }
  │   └─ payment.controller.js :: createOrder()
  │       ├─ razorpay.orders.create({
  │       │     amount: amount * 100,      // Convert to paise
  │       │     currency: "INR",
  │       │     receipt: `receipt_${Date.now()}`
  │       │   })
  │       ├─ Payment.create({              // Audit trail
  │       │     userId, planId, amount, credits,
  │       │     razorpayOrderId: order.id,
  │       │     status: "created"
  │       │   })
  │       └─ res.json(order)               // Returns order to frontend
  │
  ├─ Opens Razorpay checkout widget:
  │   new window.Razorpay({
  │     key: VITE_RAZORPAY_KEY_ID,
  │     order_id: order.id,
  │     handler: async (response) => { ... }
  │   }).open()
  │
  ├─ User completes payment in Razorpay widget
  │
  └─ handler callback fires:
      ├─ axios.POST → /api/payment/verify
      │   Body: { response: { razorpay_order_id, razorpay_payment_id, razorpay_signature } }
      │   └─ payment.controller.js :: verifyPayment()
      │       ├─ Compute: expectedSignature = HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
      │       ├─ Compare: expectedSignature === razorpay_signature
      │       │   └─ If mismatch → 400 "Invalid payment signature"
      │       ├─ Payment.findOne({ razorpayOrderId })
      │       ├─ If already "paid" → return early (idempotent)
      │       ├─ payment.status = "paid"; payment.save()
      │       ├─ User.findByIdAndUpdate(userId, { $inc: { credits: payment.credits } })
      │       └─ res.json({ success: true, user: updatedUser })
      │
      ├─ dispatch(setUserData(verifyPay.data.user))
      ├─ setPaymentSuccess(true)
      └─ setTimeout → navigate("/")  // Redirect to home after 3s
```

### Files Touched
`Pricing.jsx` → `payment.route.js` → `isAuth.js` → `payment.controller.js` → `razorpay.service.js` → `Payment.model.js` → `User.model.js` → `userSlice.js`

---

## 9. INTERVIEW HISTORY VIEW

### User Action
User clicks **"View History"** from the home page or user menu.

### Complete Code Path

```
InterviewHistory.jsx :: useEffect (mount)
  │
  ├─ axios.GET → /api/interview/get-interview (withCredentials: true)
  │   └─ interview.controller.js :: getMyInterviews()
  │       ├─ Interview.find({ userId: req.userId })
  │       │   .sort({ createdAt: -1 })             // Newest first
  │       │   .select("role experience mode finalScore status createdAt")
  │       └─ res.json(interviews)
  │
  ├─ setInterviews(result.data)
  └─ Renders card list with role, score, status badge
      └─ onClick → navigate(`/report/${item._id}`)
```

### Files Touched
`InterviewHistory.jsx` → `interview.route.js` → `isAuth.js` → `interview.controller.js` → `Interview.model.js`

---

## 10. HISTORICAL REPORT VIEW

### User Action
User clicks on an interview card in the history page.

### Complete Code Path

```
InterviewReport.jsx :: useEffect (mount)
  │
  ├─ const { id } = useParams()
  ├─ axios.GET → /api/interview/report/{id} (withCredentials: true)
  │   └─ interview.controller.js :: getInterviewReport()
  │       ├─ Interview.findById(id)
  │       ├─ If not found → 404
  │       ├─ Compute averages from all questions
  │       └─ res.json({ finalScore, confidence, communication, correctness, questionWiseScore })
  │
  ├─ setReport(result.data)
  └─ Renders <Step3Report report={report} />  // Same component as live report
```

### Files Touched
`InterviewReport.jsx` → `interview.route.js` → `isAuth.js` → `interview.controller.js` → `Interview.model.js` → `Step3Report.jsx`

---

## 11. LOGOUT

### User Action
User clicks **"Logout"** from the user dropdown menu.

### Complete Code Path

```
Navbar.jsx :: handleLogout()
  │
  ├─ axios.GET → /api/auth/logout (withCredentials: true)
  │   └─ auth.controller.js :: logOut()
  │       ├─ res.clearCookie("token")
  │       └─ res.json({ message: "Logged out successfully!!" })
  │
  ├─ dispatch(setUserData(null))        // Clear Redux store
  ├─ setShowCreditPopup(false)
  ├─ setShowUserPopup(false)
  └─ navigate("/")                      // Redirect to home
```

### Files Touched
`Navbar.jsx` → `auth.route.js` → `auth.controller.js` → `userSlice.js`
