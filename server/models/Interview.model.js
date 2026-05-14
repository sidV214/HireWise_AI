import mongoose from 'mongoose'

const questionsSchema = new mongoose.Schema({
    question: String,
    difficulty: String,
    timeLimit: Number,
    answer: String,
    feedback: String,
    score: { type: Number, default: 0 },
    confidence: { type: Number, default: 0 },
    communication: { type: Number, default: 0 },
    correctness: { type: Number, default: 0 },
})

const interviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    role: {
        type: String,
        required: true
    },
    experience: {
        type: String,
        required: true
    },
    mode: {
        type: String,
        enum: ["HR", "Technical"],
        required: true
    },
    resumeText: {
        type: String,
    },
    questions: [questionsSchema],
    finalScore: { type: Number, default: 0 },
    status: {
        type: String,
        enum: ["Incompleted", "Completed"],
        default: "Incompleted"
    }
}, { timestamps: true })

const Interview = mongoose.model("Interview", interviewSchema)

export default Interview

/*
|==========================================================================
| FILE: Interview.model.js
| PURPOSE: Defines the Mongoose schemas for the `interviews` collection,
|          structuring interview metadata, nested questions, and scores.
|==========================================================================
|
| ROLE IN THE ARCHITECTURE
| ────────────────────────
| This file lives in the `server/models` layer. It dictates the data shape of the
| application's core feature: the AI mock interview. It provides the blueprint for
| saving, retrieving, and updating an interview session's state in the MongoDB
| `interviews` collection.
|
| IMPORTS & DEPENDENCIES
| ──────────────────────
| 1. `mongoose`: The ODM library providing Schema definitions and the Model constructor.
|
| SCHEMA DEFINITION & DATA FLOW
| ─────────────────────────────
| [questionsSchema] (Sub-document Schema)
| - `question`: String. The AI-generated question text.
| - `difficulty`: String. Difficulty level (e.g., Easy, Medium, Hard).
| - `timeLimit`: Number. The allocated time to answer in seconds.
| - `answer`: String. The transcribed user voice response.
| - `feedback`: String. The AI's evaluation feedback on the user's answer.
| - `score, confidence, communication, correctness`: Numbers. Specific metric scores given by the AI out of 10.
|
| [interviewSchema] (Main Document Schema)
| - `userId`: ObjectId (ref: "User"). Creates a relational link to the user who took the interview. Required.
| - `role, experience, mode`: Strings. Initial setup parameters chosen by the user. Required.
| - `resumeText`: String. The parsed text extracted from the user's uploaded PDF.
| - `questions`: Array of `questionsSchema`. A nested list of all questions asked and answered during this session.
| - `finalScore`: Number. The aggregated total score for the interview. Defaults to 0.
| - `status`: String. Tracks whether the interview is "Incompleted" or "Completed". Defaults to "Incompleted".
| - `timestamps: true`: Auto-manages `createdAt` and `updatedAt`.
|
| CONNECTIONS (Dependency Map)
| ───────────
| CONSUMED BY: 
|  - `interview.controller.js` (Used heavily to create interviews, push new questions/answers, and fetch history/reports).
| RELATES TO:
|  - `User.model.js` (Via the `userId` ObjectId reference).
|
| DESIGN PATTERNS
| ───────────────
| - **Embedded Document Pattern**: Instead of creating a separate `questions` collection and linking via ObjectIds, the `questions` array is embedded directly inside the `interview` document. This is chosen because questions inherently belong to a single interview and are always fetched together (1-to-few relationship). This optimizes read performance by eliminating the need for `$lookup` (JOIN) operations.
| - **State Machine Pattern (Primitive)**: The `status` field acts as a simple state tracker, distinguishing between active sessions and finalized reports.
|
| INTERVIEW QUESTIONS
| ───────────────────
| Q1: Why embed questions inside the Interview document instead of referencing them?
| A1: In MongoDB, data that is accessed together should be stored together. An interview typically has 5-10 questions. By embedding them, we can retrieve the entire interview and all its questions in a single, fast disk read. If we used references, we would need to perform expensive `$lookup` queries to reconstruct the data.
|
| Q2: What is the purpose of `type: mongoose.Schema.Types.ObjectId`?
| A2: It tells Mongoose that this field is not a standard string, but a 12-byte MongoDB ObjectId. The `ref: "User"` property enables Mongoose's `.populate('userId')` method, which automatically fetches the associated User document and replaces the ID with the actual user object during queries.
|
| Q3: How does the `enum` validator work on the `mode` and `status` fields?
| A3: The `enum` array restricts the allowed string values for those fields. If a controller attempts to save an interview with `mode: "Coding"`, Mongoose will throw a validation error because "Coding" is not in the allowed `["HR", "Technical"]` list. This ensures data integrity at the application layer.
|
| Q4: What happens if `resumeText` is very large?
| A4: MongoDB documents have a hard size limit of 16MB. While plain text resumes are usually just a few kilobytes and easily fit, storing massive binary files (like the PDF itself) would risk hitting this limit. Therefore, we only store the extracted text.
|
| Q5: Why define `questionsSchema` separately instead of inline?
| A5: Defining it separately keeps the code clean and allows us to easily add middleware, methods, or virtuals specifically to the sub-documents in the future, if needed.
|==========================================================================
*/