import express from 'express'
import isAuth from '../middlewares/isAuth.js'
import { upload } from '../middlewares/multer.js'
import { analyzeResume, finishInterview, generateQuestions, getInterviewReport, getMyInterviews, submitAnswer } from '../controllers/interview.controller.js'

const interviewRouter = express.Router()

interviewRouter.post("/resume", isAuth, upload.single("resume"), analyzeResume)
interviewRouter.post("/generate-questions", isAuth, generateQuestions)
interviewRouter.post("/submit-answer", isAuth, submitAnswer)
interviewRouter.post("/finish", isAuth, finishInterview)

interviewRouter.get("/get-interview", isAuth, getMyInterviews)
interviewRouter.get("/report/:id", isAuth, getInterviewReport)




export default interviewRouter

/*
|==========================================================================
| FILE: interview.route.js
| PURPOSE: Defines the Express router for all interview-related endpoints,
|          including setup, question generation, and answering.
|==========================================================================
|
| ROLE IN THE ARCHITECTURE
| ────────────────────────
| This file lives in the `server/routes` layer. It handles the core business
| domain of the application. It routes requests starting with `/api/interview`
| to the appropriate controller while ensuring that security (`isAuth`) and
| file handling (`upload`) middlewares are executed first.
|
| IMPORTS & DEPENDENCIES
| ──────────────────────
| 1. `express`: To create the Router.
| 2. `isAuth`: Middleware to ensure only logged-in users can access these endpoints.
| 3. `upload`: Multer middleware for handling `multipart/form-data` (specifically the resume PDF).
| 4. Controller methods: `analyzeResume`, `finishInterview`, `generateQuestions`, `getInterviewReport`, `getMyInterviews`, `submitAnswer`.
|
| ENDPOINTS & DATA FLOW
| ─────────────────────
| 1. POST `/resume`
|    - MIDDLEWARE: `isAuth` -> `upload.single("resume")`
|    - PURPOSE: Parses the uploaded PDF, creates a new Interview document in the DB, and deducts 1 credit from the user.
| 
| 2. POST `/generate-questions`
|    - MIDDLEWARE: `isAuth`
|    - PURPOSE: Calls the AI to generate the initial set of 5 interview questions based on the resume/role.
|
| 3. POST `/submit-answer`
|    - MIDDLEWARE: `isAuth`
|    - PURPOSE: Accepts the user's transcribed answer, evaluates it via AI, saves the score, and generates a dynamic follow-up question.
|
| 4. POST `/finish`
|    - MIDDLEWARE: `isAuth`
|    - PURPOSE: Marks the interview status as "Completed" and calculates the final aggregated score.
|
| 5. GET `/get-interview`
|    - MIDDLEWARE: `isAuth`
|    - PURPOSE: Fetches all completed/incomplete interviews for the logged-in user (History page).
|
| 6. GET `/report/:id`
|    - MIDDLEWARE: `isAuth`
|    - PURPOSE: Fetches the detailed analytics and questions array for a specific interview ID.
|
| CONNECTIONS (Dependency Map)
| ───────────
| MOUNTED IN: `server/index.js` (as `app.use("/api/interview", interviewRouter)`)
| DELEGATES TO: `server/controllers/interview.controller.js`
|
| DESIGN PATTERNS
| ───────────────
| - **Chain of Responsibility Pattern**: Notice the array of functions passed to the route: `interviewRouter.post("/resume", isAuth, upload.single("resume"), analyzeResume)`. The request passes through `isAuth` (verifies token), then `upload.single` (saves file), and finally `analyzeResume` (business logic). If any link in the chain fails, the request is aborted early.
|
| INTERVIEW QUESTIONS
| ───────────────────
| Q1: Why is `isAuth` placed before `upload.single`?
| A1: Order is critical. If `upload.single` came first, the server would accept and save the potentially large PDF file to disk *before* checking if the user is authenticated. A malicious actor could flood the server with massive files without logging in. `isAuth` first acts as a firewall.
|
| Q2: What does `:id` mean in the `/report/:id` route?
| A2: It is a dynamic route parameter. Express extracts whatever string is in that URL segment and makes it available in the controller via `req.params.id`. This is how REST APIs fetch specific resources.
|
| Q3: Why are `/generate-questions` and `/submit-answer` POST methods instead of GET/PUT?
| A3: Generating questions and submitting answers both require sending large complex JSON payloads (like context arrays or transcriptions) and they both result in the creation/mutation of state (database updates and external API calls). POST is the semantically correct HTTP verb for state-mutating actions with complex payloads.
|==========================================================================
*/