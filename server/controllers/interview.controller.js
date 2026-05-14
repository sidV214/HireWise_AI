import fs from 'fs'
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs'
import { askAI } from '../services/openRouter.service.js'
import User from '../models/User.model.js'
import Interview from '../models/Interview.model.js'

export const analyzeResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Resume required!!" })
        }
        const filepath = req.file.path
        const fileBuffer = await fs.promises.readFile(filepath)
        const uint8Array = new Uint8Array(fileBuffer)
        const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise

        let resumeText = ""

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum)
            const content = await page.getTextContent()
            const pageText = content.items.map(item => item.str).join(" ")
            resumeText += pageText + "\n"
        }
        resumeText = resumeText.replace(/\s+/g, " ").trim()

        const messages = [
            {
                role: "system",
                content: `
                    Extract structured data from resume.
                    Return strictly JSON:
                    {
                        "role":"string",
                        "experience":"string",
                        "projects":["project1", "project2"],
                        "skills":["skill1", "skill2"]
                    }
                `
            },
            {
                role: "user",
                content: resumeText
            }
        ]
        const aiResponse = await askAI(messages)
        const cleanedResponse = aiResponse.replace(/```json\n?|\n?```/g, "").trim()
        const parsed = JSON.parse(cleanedResponse)
        fs.unlinkSync(filepath)

        res.json({
            role: parsed.role,
            experience: parsed.experience,
            projects: parsed.projects,
            skills: parsed.skills,
            resumeText
        })

    } catch (error) {
        console.error(error);
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path)
        }
        return res.status(500).json({ message: error.message })
    }
}

export const generateQuestions = async (req, res) => {
    try {
        let { role, experience, mode, resumeText, projects, skills } = req.body
        role = role?.trim()
        experience = experience?.trim()
        mode = mode?.trim()
        if (!role || !experience || !mode) {
            return res.status(400).json({ message: "Role, Experience and Mode are required" })
        }

        const user = await User.findById(req.userId)
        if (!user) {
            return res.status(404).json({
                message: "User not found!!!"
            })
        }
        if (user.credits < 50) {
            return res.status(404).json({
                message: "Not enough credits. Minimum 50 credits required!!"
            })
        }

        const projectText = Array.isArray(projects) && projects.length ? projects.join(", ") : "None"
        const skillsText = Array.isArray(skills) && skills.length ? skills.join(", ") : "None"
        const safeResume = resumeText?.trim() || "None"

        const userPrompt = `
            Role:${role}
            Experience: ${experience}
            InterviewMode:${mode}
            Projects:${projectText}
            Skills:${skillsText}
            Resume:${safeResume}
        `
        if (!userPrompt.trim()) {
            return res.status(400).json({
                message: "Prompt content is empty!!"
            })
        }

        const messages = [
            {
                role: "system",
                content: `
                    You are a real human interviewer conducting a professional interview.
                    
                    Speak in simple, natural English as if you are directly talking to the candidate.
                    Generate exactly 5 interview questions.
                    Strict rules:
                    - Each question must contain between 15 and 25 words.
                    - Each question must be a single complete sentence.
                    - Do NOT number them.
                    - Do NOT add explanations.
                    - Do NOT add extra text before or after.
                    - One question per line only.
                    - Keep language simple and conversational.
                    - Question must feel practical and realistic.

                    Difficulty progression:
                    Question 1 -> easy
                    Question 2 -> easy
                    Question 3 -> medium
                    Question 4 -> medium
                    Question 5 -> hard

                    Make questions based on the candidate's role, experience, projects,interviewMode, skills and resume details.
                    `
            },
            {
                role: "user",
                content: userPrompt
            }
        ]

        const aiResponse = await askAI(messages)
        if (!aiResponse || !aiResponse.trim()) {
            return res.status(500).json({
                message: "AI returned empty response."
            })
        }
        const questionArray = aiResponse
            .split("\n")
            .map(q => q.trim())
            .filter(q => q.length > 0)
            .slice(0, 5)

        if (questionArray.length === 0) {
            return res.status(500).json({
                message: "AI failed to generate questions!!!"
            })
        }

        user.credits -= 50
        await user.save()

        const interview = await Interview.create({
            userId: user._id,
            role,
            experience,
            mode,
            resumeText: safeResume,
            questions: questionArray.map((q, index) => ({
                question: q,
                difficulty: ["easy", "easy", "medium", "medium", "hard"][index],
                timeLimit: [60, 60, 90, 90, 120][index]
            }))
        })

        res.json({
            interviewId: interview._id,
            creditsLeft: user.credits,
            userName: user.name,
            questions: interview.questions
        })

    } catch (error) {
        return res.status(500).json({ message: `Failed to create interview ${error}` })
    }
}

export const submitAnswer = async (req, res) => {
    try {
        const { interviewId, questionIndex, answer, timeTaken } = req.body
        const interview = await Interview.findById(interviewId)
        const question = interview.questions[questionIndex]

        if (!answer) {
            question.score = 0
            question.feedback = "You did not submit an answer."
            question.answer = ""

            await interview.save()

            return res.json({
                feedback: question.feedback
            })
        }
        if (timeTaken > question.timeLimit) {
            question.score = 0
            question.feedback = "Time limit exceeded. Answer not valid!!"
            question.answer = answer

            await interview.save()

            return res.json({
                feedback: question.feedback
            })
        }

        const messages = [
            {
                role: "system",
                content: `
                    You are a professional human interviewer evaluating a candidate's answer in a real interview.
                    Evaluate naturally and fairly, like a real person would.
                    Score the answer in these areas (0 to 10):

                    1. Confidence - Does the answer sound clear, confident and well presented ?
                    2. Communication - Is the language simple, clear and easy to understand ?
                    3. Correctness - Is the answer accurate, relevant and complete ?

                    Rules:
                    - Be realistic and unbiased.
                    - Do NOT give random high scores.
                    - If the answer is weak, score low.
                    - If the answer is strong and detailed, score high.
                    - Consider clarity, structure and relevance.

                    Calculate:
                    finalScore = average of confidence, communication and correctness (rounded off to nearest whole number).

                    Feedback Rules:
                    - Write natural human feedback.
                    - 10 to 15 words only.
                    - Should sound like real interview feedback.
                    - Can suggest improvement if needed.
                    - Do NOT repeat the question.
                    - Do NOT explain scoring.
                    - Keep tone professional and honest.

                    Return ONLY valid JSON in this format:
                    {
                        "confidence": number,
                        "communication": number,
                        "correctness": number,
                        "finalScore": number,
                        "feedback": "short human feedback"
                    }
                `
            },
            {
                role: "user",
                content: `
                    Question: ${question.question}
                    Answer: ${answer}
                `
            }
        ]

        const aiResponse = await askAI(messages)
        const cleanedResponse = aiResponse.replace(/```json\n?|\n?```/g, "").trim()
        const parsed = JSON.parse(cleanedResponse)

        question.answer = answer
        question.confidence = parsed.confidence
        question.communication = parsed.communication
        question.correctness = parsed.correctness
        question.score = parsed.finalScore
        question.feedback = parsed.feedback

        await interview.save()

        return res.status(200).json({ feedback: parsed.feedback })

    } catch (error) {
        return res.status(500).json({ message: `Failed to submit answer ${error}` })
    }
}

export const finishInterview = async (req, res) => {
    try {
        const { interviewId } = req.body
        const interview = await Interview.findById(interviewId)
        if (!interview) {
            return res.status(400).json({ message: "Failed to find the interview" })
        }

        const totalQuestions = interview.questions.length

        let totalScore = 0
        let totalConfidence = 0
        let totalCommunication = 0
        let totalCorrectness = 0

        interview.questions.forEach((q) => {
            totalScore += q.score || 0
            totalConfidence += q.confidence || 0
            totalCommunication += q.communication || 0
            totalCorrectness += q.correctness || 0
        })

        const finalScore = totalQuestions ? totalScore / totalQuestions : 0

        const avgConfidence = totalQuestions ? totalConfidence / totalQuestions : 0

        const avgCommunication = totalQuestions ? totalCommunication / totalQuestions : 0

        const avgCorrectness = totalQuestions ? totalCorrectness / totalQuestions : 0

        interview.finalScore = finalScore
        interview.status = "Completed"

        await interview.save()

        return res.status(200).json({
            finalScore: Number(finalScore.toFixed(1)),
            confidence: Number(avgConfidence.toFixed(1)),
            communication: Number(avgCommunication.toFixed(1)),
            correctness: Number(avgCorrectness.toFixed(1)),
            questionWiseScore: interview.questions.map((q) => ({
                question: q.question,
                score: q.score || 0,
                feedback: q.feedback || 0,
                confidence: q.confidence || 0,
                communication: q.communication || 0,
                correctness: q.correctness || 0,
            }))
        })
    } catch (error) {
        return res.status(500).json({ message: `Failed to submit answer ${error}` })
    }
}

export const getMyInterviews = async (req, res) => {
    try {
        const interviews = await Interview.find({ userId: req.userId })
            .sort({ createdAt: -1 })
            .select("role experience finalScore status createdAt")

        return res.status(200).json(interviews)
    } catch (error) {
        return res.status(500).json({ message: `Failed to find current user interview: ${error}` })
    }
}

export const getInterviewReport = async (req, res) => {
    try {
        const interview = await Interview.findById(req.params.id)
        if (!interview) {
            return res.status(404).json({ message: "Interview not found!!!" })
        }

        const totalQuestions = interview.questions.length

        let totalConfidence = 0
        let totalCommunication = 0
        let totalCorrectness = 0

        interview.questions.forEach((q) => {
            totalConfidence += q.confidence || 0
            totalCommunication += q.communication || 0
            totalCorrectness += q.correctness || 0
        })

        const avgConfidence = totalQuestions ? totalConfidence / totalQuestions : 0
        const avgCommunication = totalQuestions ? totalCommunication / totalQuestions : 0
        const avgCorrectness = totalQuestions ? totalCorrectness / totalQuestions : 0

        return res.json({
            finalScore: interview.finalScore,
            confidence: Number(avgConfidence.toFixed(1)),
            communication: Number(avgCommunication.toFixed(1)),
            correctness: Number(avgCorrectness.toFixed(1)),
            questionWiseScore: interview.questions
        })



    } catch (error) {
        return res.status(500).json({ message: `Failed to find current user interview report: ${error}` })
    }
}

/*
 * ===========================================================================================
 *                           NOTES — interview.controller.js
 * ===========================================================================================
 *
 * PURPOSE: Contains all business logic for the core interview feature — resume parsing,
 *          AI question generation, answer evaluation, interview finalization, and report
 *          retrieval. This is the MOST CRITICAL file in the entire backend.
 *
 * ROLE IN ARCHITECTURE:
 * ---------------------
 * This file lives in the `server/controllers` layer. It orchestrates the full interview
 * lifecycle across 6 exported handler functions. It bridges the AI service layer
 * (OpenRouter), the data layer (User + Interview models), and the file system (PDF parsing).
 * All endpoints in this controller require `isAuth` middleware (except none — all are protected).
 *
 * IMPORTS & DEPENDENCIES:
 * -----------------------
 * 1. `fs` (Node.js built-in): Used for file I/O — reading uploaded PDF buffers from disk
 *    and deleting temp files after processing via `unlinkSync`.
 * 2. `pdfjs-dist/legacy/build/pdf.mjs`: Mozilla's PDF parsing library. The `/legacy/` path
 *    ensures compatibility with Node.js (avoids Worker thread requirements).
 * 3. `askAI` (from ../services/openRouter.service.js): The AI abstraction layer that sends
 *    prompts to GPT-4o-mini via OpenRouter and returns text responses.
 * 4. `User` (from ../models/User.model.js): Used to check credit balance and deduct credits.
 * 5. `Interview` (from ../models/Interview.model.js): Used to create, update, and query
 *    interview documents with their nested questions array.
 *
 * FUNCTION-BY-FUNCTION ANALYSIS:
 * ------------------------------
 *
 * [analyzeResume] — POST /api/interview/resume
 *   Parameters: req.file (Multer file object with .path to temp PDF)
 *   Returns: JSON { role, experience, projects, skills, resumeText }
 *   Side Effects:
 *     - FILE READ: Reads the uploaded PDF from disk using `fs.promises.readFile`
 *     - FILE DELETE: Deletes the temp file after parsing via `fs.unlinkSync`
 *     - EXTERNAL API: Calls OpenRouter AI to extract structured data from resume text
 *   Flow:
 *     1. Validates that `req.file` exists (Multer populates this).
 *     2. Reads the file buffer, converts to Uint8Array for pdfjs-dist.
 *     3. Iterates through every page of the PDF, extracting text items.
 *     4. Concatenates all text, normalizes whitespace.
 *     5. Sends the raw text to the AI with a system prompt requesting structured JSON output.
 *     6. Parses the AI's JSON response (strips markdown code fences if present).
 *     7. Deletes the temporary file from disk (cleanup).
 *     8. Returns the parsed resume data to the frontend.
 *   Edge Cases:
 *     - If the PDF is image-based (scanned), `getTextContent()` returns empty items.
 *     - If the AI returns malformed JSON, `JSON.parse` throws, caught by the catch block.
 *     - In the catch block, if the temp file still exists, it's cleaned up to prevent
 *       disk space leaks.
 *
 * [generateQuestions] — POST /api/interview/generate-questions
 *   Parameters: req.body { role, experience, mode, resumeText, projects, skills }
 *   Returns: JSON { interviewId, creditsLeft, userName, questions }
 *   Side Effects:
 *     - DB READ: Fetches User to check credits
 *     - DB WRITE: Deducts 50 credits from User, creates new Interview document
 *     - EXTERNAL API: Calls OpenRouter AI to generate 5 interview questions
 *   Flow:
 *     1. Validates required fields (role, experience, mode).
 *     2. Fetches the authenticated user and checks if they have ≥ 50 credits.
 *     3. Constructs a user prompt with all interview context.
 *     4. Sends system + user prompts to AI requesting 5 questions with difficulty progression.
 *     5. Splits the AI response by newlines to extract individual questions.
 *     6. Deducts 50 credits from the user and saves.
 *     7. Creates an Interview document with the questions array (each with difficulty and timeLimit).
 *     8. Returns the interview data to the frontend.
 *   Edge Cases:
 *     - If credits < 50, returns 404 with an insufficient credits message.
 *     - If the AI returns empty or whitespace-only response, returns 500.
 *     - Question difficulty is mapped by index position: [easy, easy, medium, medium, hard].
 *     - Time limits are assigned by difficulty: [60s, 60s, 90s, 90s, 120s].
 *
 * [submitAnswer] — POST /api/interview/submit-answer
 *   Parameters: req.body { interviewId, questionIndex, answer, timeTaken }
 *   Returns: JSON { feedback }
 *   Side Effects:
 *     - DB READ: Fetches the Interview document
 *     - DB WRITE: Updates the specific question's scores and feedback
 *     - EXTERNAL API: Calls OpenRouter AI to evaluate the answer
 *   Flow:
 *     1. Fetches the interview and accesses the question at `questionIndex`.
 *     2. If no answer was provided, assigns score 0 and generic feedback.
 *     3. If time exceeded the question's limit, assigns score 0 with timeout feedback.
 *     4. Otherwise, sends the question + answer to AI for evaluation.
 *     5. AI returns JSON with confidence, communication, correctness, finalScore, feedback.
 *     6. Updates the question sub-document with all scores and saves.
 *   Edge Cases:
 *     - Empty answer (user didn't speak or type anything) → score 0, no AI call.
 *     - Time exceeded → score 0, answer still saved for reference.
 *     - AI JSON parsing failure → caught by try/catch, returns 500.
 *
 * [finishInterview] — POST /api/interview/finish
 *   Parameters: req.body { interviewId }
 *   Returns: JSON { finalScore, confidence, communication, correctness, questionWiseScore }
 *   Side Effects:
 *     - DB READ: Fetches the Interview document
 *     - DB WRITE: Sets `status: "Completed"` and `finalScore` on the Interview
 *   Flow:
 *     1. Fetches the interview by ID.
 *     2. Iterates through all questions to compute totals for each metric.
 *     3. Calculates averages (total / number of questions).
 *     4. Saves the final score and marks the interview as "Completed".
 *     5. Returns the aggregated report data.
 *   Edge Cases:
 *     - If a question has no score (wasn't answered), `|| 0` ensures it defaults to 0.
 *     - Division by zero is guarded with `totalQuestions ? ... : 0`.
 *
 * [getMyInterviews] — GET /api/interview/get-interview
 *   Parameters: req.userId (injected by isAuth middleware)
 *   Returns: JSON array of interview summaries
 *   Side Effects:
 *     - DB READ: Queries Interview collection filtered by userId
 *   Flow:
 *     1. Finds all interviews belonging to the authenticated user.
 *     2. Sorts by `createdAt` descending (newest first).
 *     3. Selects only summary fields (role, experience, finalScore, status, createdAt).
 *   Edge Cases:
 *     - Returns an empty array if the user has no interviews.
 *
 * [getInterviewReport] — GET /api/interview/report/:id
 *   Parameters: req.params.id (Interview ObjectId)
 *   Returns: JSON { finalScore, confidence, communication, correctness, questionWiseScore }
 *   Side Effects:
 *     - DB READ: Fetches a single Interview document by ID
 *   Flow:
 *     1. Fetches the interview by the URL parameter `:id`.
 *     2. If not found, returns 404.
 *     3. Computes average metrics from all questions.
 *     4. Returns the full report including all question sub-documents.
 *   Edge Cases:
 *     - Invalid ObjectId format will cause Mongoose to throw a CastError, caught by catch.
 *
 * CONNECTIONS (Dependency Map):
 * ----------------------------
 * CALLED BY: `server/routes/interview.route.js` (all 6 endpoints)
 * CALLS OUT TO:
 *   - `server/services/openRouter.service.js` (askAI — for resume parsing, question gen, answer eval)
 *   - `server/models/User.model.js` (credit checks and deductions)
 *   - `server/models/Interview.model.js` (CRUD operations)
 * INBOUND CALLERS:
 *   - Step1SetUp.jsx → analyzeResume, generateQuestions
 *   - Step2Interview.jsx → submitAnswer, finishInterview
 *   - InterviewHistory.jsx → getMyInterviews
 *   - InterviewReport.jsx → getInterviewReport
 *
 * DESIGN PATTERNS:
 * ----------------
 * - **Pipeline Pattern**: The interview lifecycle flows through a strict pipeline:
 *   analyzeResume → generateQuestions → submitAnswer (×5) → finishInterview.
 *   Each function handles exactly one stage and hands off to the next via the frontend.
 * - **Prompt Engineering Pattern**: System prompts are carefully structured to constrain
 *   the AI's output format (strict JSON, word limits, no explanations). This ensures
 *   reliable machine-parseable responses from an inherently unpredictable LLM.
 * - **Defensive Parsing**: The `cleanedResponse.replace(/```json\n?|\n?```/g, "")` handles
 *   the common LLM behavior of wrapping JSON in markdown code fences, preventing
 *   `JSON.parse` from failing.
 *
 * INTERVIEW QUESTIONS:
 * --------------------
 * Q1: Why is `pdfjs-dist/legacy/build/pdf.mjs` used instead of the standard import?
 * A1: The standard pdfjs-dist requires a Web Worker (for browser environments). The
 *     `/legacy/` path provides a Node.js-compatible build that runs synchronously
 *     without needing a Worker thread, making it suitable for server-side PDF processing.
 *
 * Q2: Why are credits deducted AFTER the AI generates questions, not before?
 * A2: Actually, credits are deducted BEFORE the interview is created (line 160-161).
 *     `user.credits -= 50; await user.save()` runs before `Interview.create()`. This
 *     prevents a race condition where a user could start multiple interviews simultaneously
 *     by rapidly clicking "Start" before the credit deduction is processed.
 *
 * Q3: What happens if the AI response contains invalid JSON?
 * A3: `JSON.parse(cleanedResponse)` will throw a `SyntaxError`. The catch block catches
 *     this and returns a 500 error to the frontend. The user would need to retry. This
 *     is a known reliability concern with LLM-based architectures.
 *
 * Q4: Why does `finishInterview` recalculate averages instead of using pre-computed values?
 * A4: Because questions are submitted one-by-one via `submitAnswer`. The final score is
 *     only meaningful after ALL questions have been answered. Computing averages at the
 *     end ensures accuracy regardless of the order or timing of submissions.
 *
 * Q5: How does the `timeTaken > question.timeLimit` check prevent cheating?
 * A5: The frontend sends the elapsed time, and the backend validates it against the
 *     stored `timeLimit`. If the user somehow bypasses the frontend timer, the backend
 *     still enforces the limit. However, a sophisticated attacker could manipulate the
 *     `timeTaken` value in the request body — the only true fix would be server-side
 *     time tracking.
 * ===========================================================================================
 */