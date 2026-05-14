import React, { useState } from 'react'
import { motion } from 'motion/react'
import {
  FaUserTie,
  FaBriefcase,
  FaFileUpload,
  FaMicrophoneAlt,
  FaChartLine
} from 'react-icons/fa'
import axios from 'axios'
import { ServerURL } from '../App'
import { useDispatch, useSelector } from 'react-redux'
import { setUserData } from '../redux/userSlice'

function Step1SetUp({ onStart }) {
  const { userData } = useSelector((state) => state.user)
  const dispatch = useDispatch()
  const [role, setRole] = useState("")
  const [experience, setExperience] = useState("")
  const [mode, setMode] = useState("Technical")
  const [resumeFile, setResumeFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [projects, setProjects] = useState([])
  const [skills, setSkills] = useState([])
  const [resumeText, setResumeText] = useState("")
  const [analysisDone, setAnalysisDone] = useState(false)
  const [analysing, setAnalysing] = useState(false)

  const handleUploadResume = async () => {
    if (!resumeFile || analysing) return
    setAnalysing(true)
    const formData = new FormData()
    formData.append("resume", resumeFile)

    try {
      const result = await axios.post(ServerURL + "/api/interview/resume", formData, { withCredentials: true })
      console.log(result.data);
      setRole(result.data.role || "")
      setExperience(result.data.experience || "")
      setProjects(result.data.projects || [])
      setSkills(result.data.skills || [])
      setResumeText(result.data.resumeText || "")
      setAnalysisDone(true)
      setAnalysing(false)
    } catch (error) {
      console.log(error);
      setAnalysing(false)
    }
  }

  const handleStart = async (req, res) => {
    setLoading(true)
    try {
      const result = await axios.post(ServerURL + "/api/interview/generate-questions", { role, experience, mode, resumeText, projects, skills }, { withCredentials: true })

      console.log(result.data);

      if (userData) {
        dispatch(setUserData({ ...userData, credits: result.data.creditsLeft }))
      }

      setLoading(false)
      onStart(result.data)

    } catch (error) {
      console.log(error);
      setLoading(false)
      // Display the error message from the backend if it exists
      if (error.response && error.response.data && error.response.data.message) {
        alert(error.response.data.message);
      } else {
        alert("Failed to start the interview. Please try again.");
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className='min-h-screen flex items-center justify-center bg-gray-50 px-4' >
      <div className='w-full max-w-6xl bg-gray-100/30 backdrop-blur-xl border border-gray-200/50 rounded-3xl shadow-2xl grid md:grid-cols-2 overflow-hidden'>
        <motion.div
          initial={{ opacity: 0, x: -80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className='relative bg-emerald-900/10 border-r border-gray-200/30 p-12 flex-col justify-center'>
          <h2 className="text-4xl font-bold text-gray-800 mb-6">
            Start Your AI Interview
          </h2>
          <p className="text-gray-600 mb-10">
            Practical real interview scenarios powered by AI.
            Improve communication, technical skills and confidence.
          </p>
          <div className="space-y-5 ">
            {
              [
                {
                  icon: <FaUserTie className='text-emerald-600 text-xl' />,
                  text: "Choose Role & Experience"
                },
                {
                  icon: <FaMicrophoneAlt className='text-emerald-600 text-xl' />,
                  text: "Smart Voice Interview"
                },
                {
                  icon: <FaChartLine className='text-emerald-600 text-xl' />,
                  text: "Performance Analytics"
                }
              ].map((item, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 + index * 0.15 }}
                  whileHover={{ scale: 1.03 }}
                  key={index}
                  className="flex items-center space-x-4 bg-gray-100/50 border border-gray-200/50 p-4 rounded-xl shadow-sm cursor-pointer">
                  {item.icon}
                  <span className="text-gray-700 font-medium">{item.text}</span>
                </motion.div>
              ))
            }
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className='p-12 bg-gray-100/50'>
          <h2 className="text-3xl font-bold text-gray-800 mb-8">
            Interview Setup
          </h2>
          <div className="space-y-6">
            <div className="relative ">
              <FaUserTie className='absolute top-4 left-4 text-gray-400' />
              <input type="text" placeholder='Enter the role'
                className='w-full pl-12 pr-4 py-3 bg-transparent text-gray-800 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition'
                onChange={(e) => setRole(e.target.value)} value={role}
              />
            </div>
            <div className="relative ">
              <FaBriefcase className='absolute top-4 left-4 text-gray-400' />
              <input type="text" placeholder='Experience (e.g. 2 years)'
                className='w-full pl-12 pr-4 py-3 bg-transparent text-gray-800 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition'
                onChange={(e) => setExperience(e.target.value)} value={experience}

              />

            </div>
            <select value={mode}
              onChange={(e) => setMode(e.target.value)}
              className='w-full py-3 px-4 bg-transparent text-gray-800 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition'>
              <option value="Technical" className="bg-gray-100 text-gray-800">Technical Interview</option>
              <option value="HR" className="bg-gray-100 text-gray-800">HR Interview</option>
            </select>
            {!analysisDone && (
              <motion.div
                whileHover={{ scale: 1.02 }}
                onClick={() => document.getElementById("resumeUpload").click()}
                className='border-2 border-dashed border-gray-400 rounded-xl p-8 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-900/20 transition'>
                <FaFileUpload className='text-4xl mx-auto text-emerald-500 mb-3 ' />
                <input type="file" id='resumeUpload' accept='application/pdf'
                  className='hidden'
                  onChange={(e) => setResumeFile(e.target.files[0])}
                />
                <p className="text-gray-600 font-medium">
                  {resumeFile ? resumeFile.name : "Click to upload resume (Optional)"}
                </p>
                {resumeFile && (
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUploadResume()
                    }}
                    whileHover={{ scale: 1.02 }}
                    className='mt-4 bg-emerald-500 text-gray-900 px-5 py-2 rounded-lg hover:bg-emerald-400 font-medium transition shadow-md'>
                    {analysing ? "Analyzing..." : "Analyze Resume"}
                  </motion.button>
                )}
              </motion.div>
            )}

            {analysisDone && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className='bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4'>
                <h3 className="text-lg font-semibold text-gray-800 ">
                  Resume Analysis Result
                </h3>

                {projects.length > 0 && (
                  <div >
                    <p className="font-medium text-gray-700 mb-1">
                      Projects:
                    </p>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      {projects.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {skills.length > 0 && (
                  <div >
                    <p className="font-medium text-gray-700 mb-1">
                      Skills:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((s, i) => (
                        <span key={i} className='bg-emerald-100/50 border border-emerald-400/20 text-emerald-600 px-3 py-1 rounded-full text-sm'>{s}</span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            <motion.button
              onClick={handleStart}
              disabled={!role || !experience || loading}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              className='w-full disabled:bg-gray-200 disabled:text-gray-500 bg-emerald-500 hover:bg-emerald-400 text-gray-900 py-3 rounded-full text-lg font-semibold transition duration-300 shadow-md'>
              {loading ? "Starting..." : "Start Interview" }
            </motion.button>
          </div>

        </motion.div>
      </div>

    </motion.div>
  )
}

export default Step1SetUp

/*
 * ===========================================================================================
 *                              NOTES — Step1SetUp.jsx
 * ===========================================================================================
 *
 * PURPOSE: The interview setup wizard (Step 1 of 3). This is the user's entry point
 *          into the interview experience. It collects all necessary configuration data
 *          (role, experience, mode) and optionally analyzes a resume PDF using AI to
 *          personalize the interview questions.
 *
 * ROLE IN ARCHITECTURE:
 * ---------------------
 * Rendered by InterviewPage.jsx when step === 1. It is the gateway component that:
 * (1) Validates user input before allowing an interview to start,
 * (2) Calls two backend endpoints (resume analysis + question generation),
 * (3) Deducts credits from the user's account,
 * (4) Passes the generated interview data to the parent via onStart() callback,
 *     which triggers the transition to Step 2 (live interview).
 *
 * IMPORTS & DEPENDENCIES:
 * -----------------------
 * 1. `React, useState`: Core React for component rendering and local state management.
 * 2. `motion` (motion/react): Framer Motion for slide-in animations, hover scales, and
 *    button tap effects on the feature cards and form elements.
 * 3. `FaUserTie, FaBriefcase, FaFileUpload, FaMicrophoneAlt, FaChartLine` (react-icons/fa):
 *    Icons used in the left panel feature list and form input decorations.
 * 4. `axios`: HTTP client for API calls (resume upload and question generation).
 * 5. `ServerURL` (../App): Backend base URL for API endpoints.
 * 6. `useDispatch, useSelector` (react-redux): Redux hooks for reading user state and
 *    dispatching credit updates after question generation.
 * 7. `setUserData` (../redux/userSlice): Action creator for updating the Redux store
 *    with the new credit balance after deduction.
 *
 * PROPS:
 * ------
 * - `onStart`: (interviewData) => void — Callback receiving the generated questions,
 *   interviewId, credits left, and username. Called after successful question generation.
 *
 * STATE VARIABLES (Complete Inventory):
 * -------------------------------------
 * | Variable      | Type     | Default       | Purpose                                    |
 * |---------------|----------|---------------|--------------------------------------------|
 * | role          | string   | ""            | Target job role (e.g., "Frontend Developer")|
 * | experience    | string   | ""            | Experience level (e.g., "2 years")          |
 * | mode          | string   | "Technical"   | Interview type: "Technical" or "HR"         |
 * | resumeFile    | File     | null          | The selected PDF file object                |
 * | loading       | boolean  | false         | true during question generation API call    |
 * | projects      | array    | []            | Extracted project names from resume         |
 * | skills        | array    | []            | Extracted skills from resume                |
 * | resumeText    | string   | ""            | Full extracted text from the PDF            |
 * | analysisDone  | boolean  | false         | true after successful resume analysis       |
 * | analysing     | boolean  | false         | true during resume analysis API call        |
 *
 * FUNCTION-BY-FUNCTION ANALYSIS:
 * ------------------------------
 *
 * [handleUploadResume()] — Resume PDF analysis
 *   Guard: returns early if no file selected or already analysing.
 *   Flow:
 *     1. Creates a FormData object and appends the PDF file as "resume".
 *     2. POSTs to /api/interview/resume with withCredentials (sends JWT cookie).
 *     3. The backend (interview.controller.js::analyzeResume) reads the PDF using pdfjs-dist,
 *        extracts all text, sends it to GPT-4o-mini for structured extraction.
 *     4. On success: populates role, experience, projects[], skills[], resumeText.
 *     5. Sets analysisDone = true, which hides the upload zone and shows the results panel.
 *   Edge Cases:
 *     - If the resume is an image-based PDF (scanned), the backend returns empty fields.
 *     - The `|| ""` and `|| []` fallbacks handle missing fields in the AI response.
 *     - Error state resets `analysing` to false, allowing the user to retry.
 *
 * [handleStart()] — Generate interview questions and begin
 *   NOTE: The function signature `(req, res)` is a leftover from copy-pasting a backend
 *   controller pattern — these parameters are never used.
 *   Flow:
 *     1. Sets loading = true (disables the Start button, shows "Starting...").
 *     2. POSTs { role, experience, mode, resumeText, projects, skills } to
 *        /api/interview/generate-questions with credentials.
 *     3. The backend checks credits >= 50, generates 5 questions via AI, deducts credits,
 *        creates an Interview document, and returns the data.
 *     4. Updates Redux store with new credit balance:
 *        dispatch(setUserData({ ...userData, credits: result.data.creditsLeft }))
 *     5. Calls onStart(result.data) which passes the data to InterviewPage.jsx,
 *        triggering setStep(2) and rendering Step2Interview.
 *   Edge Cases:
 *     - Insufficient credits: backend returns error → caught by catch → shows alert
 *       with the backend error message.
 *     - Network failure: caught by catch → shows generic "Failed to start" alert.
 *     - Button is disabled when role or experience is empty, or when loading is true.
 *
 * UI LAYOUT:
 * ----------
 * Full-screen centered layout with a max-w-6xl split-panel card:
 *
 * LEFT PANEL (hidden on mobile):
 *   - "Start Your AI Interview" heading with subtitle
 *   - Three animated feature cards (staggered entrance by 0.15s each):
 *     1. 👔 "Choose Role & Experience" (FaUserTie icon)
 *     2. 🎙️ "Smart Voice Interview" (FaMicrophoneAlt icon)
 *     3. 📊 "Performance Analytics" (FaChartLine icon)
 *   - Each card scales 1.03x on hover for interactive feedback
 *
 * RIGHT PANEL:
 *   - "Interview Setup" heading
 *   - Role input field with FaUserTie icon prefix
 *   - Experience input field with FaBriefcase icon prefix
 *   - Mode dropdown (Technical / HR)
 *   - CONDITIONAL: Resume upload zone (shown when analysisDone is false)
 *     - Dashed border clickable area with FaFileUpload icon
 *     - Hidden <input type="file" accept="application/pdf">
 *     - "Analyze Resume" button appears after file selection
 *   - CONDITIONAL: Resume analysis results (shown when analysisDone is true)
 *     - Projects list (bulleted)
 *     - Skills list (emerald pill badges in flexbox wrap)
 *   - "Start Interview" button (disabled until role + experience are filled)
 *
 * ANIMATIONS:
 * -----------
 * - Left panel slides in from x: -80 with 0.7s duration
 * - Right panel slides in from x: +80 with 0.7s duration (creates split-open effect)
 * - Feature cards stagger (0.3s base + 0.15s * index)
 * - Analysis results animate in with y: 20 opacity fade
 * - Buttons have whileHover (scale 1.03) and whileTap (scale 0.95)
 *
 * CONNECTIONS (Dependency Map):
 * ----------------------------
 * RENDERED BY: InterviewPage.jsx (step === 1)
 * API CALLS:
 *   - POST /api/interview/resume → interview.controller.js::analyzeResume
 *   - POST /api/interview/generate-questions → interview.controller.js::generateQuestions
 * READS FROM: Redux store (userData for credit display check)
 * WRITES TO: Redux store (setUserData for credit update)
 * PASSES TO: InterviewPage.jsx → Step2Interview (via onStart callback)
 *
 * DESIGN PATTERNS:
 * ----------------
 * - **Progressive Disclosure**: The resume upload zone is hidden after analysis,
 *   replaced by the results panel. The Start button is disabled until required fields
 *   are filled. This guides the user through the setup flow naturally.
 * - **Optimistic Credit Update**: Credits are updated in Redux immediately after the
 *   API returns, rather than waiting for a separate user fetch. This provides instant
 *   feedback in the Navbar's credit display.
 * - **Split-Panel Information Architecture**: Left panel educates (what will happen),
 *   right panel collects (user input). This is a common SaaS onboarding pattern.
 *
 * INTERVIEW QUESTIONS:
 * --------------------
 * Q1: Why does handleStart have `(req, res)` parameters?
 * A1: It's a code artifact from copying the Express controller pattern. In React event
 *     handlers, these would normally be `(event)` or `()`. The parameters are never used
 *     and could be safely removed.
 *
 * Q2: Why use FormData for the resume upload instead of JSON?
 * A2: File uploads require `multipart/form-data` encoding. JSON cannot carry binary file
 *     data efficiently. FormData automatically sets the correct Content-Type header that
 *     Multer on the backend expects.
 *
 * Q3: What happens if the user doesn't upload a resume?
 * A3: The resume is optional. If no resume is uploaded, resumeText, projects, and skills
 *     are all empty. The backend still generates questions based on just the role,
 *     experience, and mode — the questions will be more generic rather than personalized.
 *
 * Q4: Why update Redux credits inline instead of re-fetching the user?
 * A4: Performance optimization. Instead of making a separate GET /api/user/current-user
 *     call, we spread the existing userData and override just the credits field. This
 *     avoids an extra network roundtrip and provides instant UI feedback.
 *
 * Q5: How is the file input triggered without a visible input element?
 * A5: The actual `<input type="file">` has `className="hidden"`. When the user clicks
 *     the dashed upload zone, `document.getElementById("resumeUpload").click()` is
 *     called programmatically, which opens the native file picker. The `e.stopPropagation()`
 *     on the "Analyze Resume" button prevents the click from re-opening the file picker.
 * ===========================================================================================
 */