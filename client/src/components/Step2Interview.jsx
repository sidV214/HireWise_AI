import React, { useRef, useState, useMemo } from 'react'
import { motion } from 'motion/react'
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa'
import videoOne from '../assets/videos/Random_Video_Generation.mp4'
import videoTwo from '../assets/videos/Video_Generation_Complete.mp4'
import Timer from './Timer'
import { useEffect } from 'react'
import axios from 'axios'
import { ServerURL } from '../App'
import { BsArrowRight } from 'react-icons/bs'
import { useSelector } from 'react-redux'

function Step2Interview({ interviewData, onFinish }) {
    const { interviewId, questions, username } = interviewData
    const { userData } = useSelector((state) => state.user)
    const displayName = username || userData?.name || "Candidate"

    const [isIntroPhase, setIsIntroPhase] = useState(true)

    const [isMicOn, setIsMicOn] = useState(true)
    const isMicOnRef = useRef(true)
    
    const [isAIPlaying, setIsAIPlaying] = useState(false)
    const isAIPlayingRef = useRef(false)

    const setMicState = (state) => {
        isMicOnRef.current = state
        setIsMicOn(state)
    }

    const setAIState = (state) => {
        isAIPlayingRef.current = state
        setIsAIPlaying(state)
    }

    const recongitionRef = useRef(null)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [answer, setAnswer] = useState("")
    const [feedback, setFeedback] = useState("")
    const [timeLeft, setTimeLeft] = useState(questions[0]?.timeLimit || 60)
    const [selectedVoice, setSelectedVoice] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [voiceGender, setVoiceGender] = useState("female")
    const [subtitle, setSubtitle] = useState("")
    const [isTransitioning, setIsTransitioning] = useState(false)
    const [isFinishing, setIsFinishing] = useState(false)
    const actionLockRef = useRef(false)

    const videoRef = useRef(null)

    const currentQuestion = questions[currentIndex]

    useEffect(() => {
        const loadVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            if (!voices.length) return

            // 1. Broadly grab ANY possible Indian/Hindi voice available, including Google's Hindi which acts as Indian English
            const targetedNames = ["neerja", "heera", "veena", "aditi", "ravi", "prabhat", "google हिन्दी", "kavya", "ananya"];

            const indianVoices = voices.filter(v => 
                v.lang.toLowerCase().replace('_', '-').includes('en-in') || 
                v.lang.toLowerCase().replace('_', '-').includes('hi-in') || 
                v.name.toLowerCase().includes('india') ||
                v.name.toLowerCase().includes('indian') ||
                targetedNames.some(t => v.name.toLowerCase().includes(t))
            );
            
            let selected = null;

            if (indianVoices.length > 0) {
                // 2. Try to grab the most natural sounding female Indian voice
                selected = indianVoices.find(v => 
                    v.name.toLowerCase().includes('neerja') || 
                    v.name.toLowerCase().includes('google हिन्दी') || 
                    v.name.toLowerCase().includes('heera') || 
                    v.name.toLowerCase().includes('veena') || 
                    v.name.toLowerCase().includes('aditi') ||
                    v.name.toLowerCase().includes('female')
                );
                
                // If no recognizable female name, just pick the first purely Indian voice available
                if (!selected) selected = indianVoices[0];
            }
            
            // 3. Absolute worst-case fallback if the user has NO Indian language packs installed
            if (!selected) {
                 selected = voices.filter(v => v.lang.startsWith('en')).find(v => v.name.toLowerCase().includes('female') && !v.name.toLowerCase().includes('uk')) || voices[0];
            }
            
            setSelectedVoice(selected);
            const isMale = (selected.name.toLowerCase().includes("male") && !selected.name.toLowerCase().includes("female")) || selected.name.toLowerCase().includes("david") || selected.name.toLowerCase().includes("ravi") || selected.name.toLowerCase().includes("prabhat");
            setVoiceGender(isMale ? "male" : "female");
        }

        loadVoices()
        window.speechSynthesis.onvoiceschanged = loadVoices

    }, [])

    const videoSource = voiceGender === "male" ? videoOne : videoTwo

    /* ---------------- SPEAK FUNCTION --------------------- */

    const speakText = (text) => {
        return new Promise((resolve) => {
            if (!window.speechSynthesis || !selectedVoice) {
                resolve()
                return
            }
            window.speechSynthesis.cancel()

            const humanText = text
                .replace(/,/g, ", ... ")
                .replace(/\./g, ". ... ")

            const utterance = new SpeechSynthesisUtterance(humanText)

            utterance.voice = selectedVoice
            utterance.rate = 0.92
            utterance.pitch = 1.05
            utterance.volume = 1

            utterance.onstart = () => {
                setAIState(true)
                stopMic()
                videoRef.current?.play()
            }

            utterance.onend = () => {
                videoRef.current?.pause()
                if (videoRef.current) {
                    videoRef.current.currentTime = 0
                }
                setAIState(false)

                if (isMicOnRef.current) {
                    try { recongitionRef.current?.start() } catch(e) {}
                }

                setTimeout(() => {
                    setSubtitle("")
                    resolve()
                }, 300)
            }

            utterance.onerror = (e) => {
                console.error("SpeechSynthesis error:", e)
                setAIState(false)
                setTimeout(() => {
                    setSubtitle("")
                    resolve()
                }, 100)
            }

            setSubtitle(text)
            
            // Critical 50ms delay to prevent Chrome from silently dropping 
            // the utterance when cancel() is called immediately prior.
            setTimeout(() => {
                window.speechSynthesis.speak(utterance)
            }, 50)
        })
    }

    useEffect(() => {
        if (!selectedVoice) return
        const runIntro = async () => {
            if (isIntroPhase) {
                await speakText(`Hi ${displayName}, it's great to meet you today. I hope you're feeling confident and ready.`)
                await speakText("I'll ask you a few questions. Just answer naturally and take your time. Let's begin.")
                setIsIntroPhase(false)
            } else if (currentQuestion) {
                setIsTransitioning(true)
                await new Promise(r => setTimeout(r, 800))
                if (currentIndex === questions.length - 1) {
                    await speakText("Alright, this one might be a bit more challenging.")
                }
                await speakText(currentQuestion.question)
                setTimeLeft(currentQuestion.timeLimit || 60)
                setIsTransitioning(false)
            }
        }
        runIntro()
    }, [selectedVoice, isIntroPhase, currentIndex])

    useEffect(() => {
        if (isIntroPhase) return
        if (!currentQuestion) return
        if (isAIPlaying || isTransitioning) return // Pause the timer while AI is speaking

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer)
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [isIntroPhase, currentIndex, isAIPlaying, isTransitioning])

    useEffect(() => {
        if (!isIntroPhase && currentQuestion) {
            setTimeLeft(currentQuestion.timeLimit || 60)
        }
    }, [currentIndex])

    useEffect(() => {
        if (!("webkitSpeechRecognition" in window)) return
        const recognition = new window.webkitSpeechRecognition()
        recognition.lang = "en-IN" // Better context for Indian accents
        recognition.continuous = true
        recognition.interimResults = false

        recognition.onresult = (event) => {
            const transcript = event.results[event.results.length - 1][0].transcript
            setAnswer((prev) => prev + " " + transcript)
        }

        // Robust auto-restart if disconnected unexpectedly
        recognition.onend = () => {
            if (isMicOnRef.current && !isAIPlayingRef.current) {
                try { recognition.start() } catch (e) {}
            }
        }

        recongitionRef.current = recognition
    }, [])

    const startMic = () => {
        if (recongitionRef.current && !isAIPlayingRef.current) {
            try { recongitionRef.current.start() } catch (error) {}
        }
    }

    const stopMic = () => {
        if (recongitionRef.current) {
            try { recongitionRef.current.stop() } catch (error) {}
        }
    }

    const toggleMic = () => {
        const nextState = !isMicOn
        setMicState(nextState)
        if (nextState) {
            startMic()
        } else {
            stopMic()
        }
    }

    const submitAnswer = async () => {
        if (actionLockRef.current || isSubmitting) return
        actionLockRef.current = true
        stopMic()
        setIsSubmitting(true)
        try {
            const result = await axios.post(ServerURL + "/api/interview/submit-answer", {
                interviewId,
                questionIndex: currentIndex,
                answer,
                timeTaken: currentQuestion.timeLimit - timeLeft
            }, { withCredentials: true })

            setFeedback(result.data.feedback)
            speakText(result.data.feedback)
            setIsSubmitting(false)
            actionLockRef.current = false
        } catch (error) {
            console.error(error);
            setIsSubmitting(false)
            actionLockRef.current = false
        }
    }

    const handleNext = async () => {
        if (actionLockRef.current || isFinishing || isTransitioning) return
        actionLockRef.current = true

        if (currentIndex + 1 >= questions.length) {
            setIsFinishing(true)
            await speakText("That concludes our interview. Please wait a moment while I compile your final report.")
            await finishInterview()
            actionLockRef.current = false
            return
        }
        
        setIsTransitioning(true)
        
        if (currentIndex + 1 !== questions.length - 1) {
            await speakText("Alright, let's move to the next question.")
        }

        setAnswer("")
        setFeedback("")
        setCurrentIndex(currentIndex + 1)
        actionLockRef.current = false
    }

    const finishInterview = async () => {
        setMicState(false)
        stopMic()
        try {
            const result = await axios.post(ServerURL + "/api/interview/finish", { interviewId }, { withCredentials: true })
            console.log(result.data)
            onFinish(result.data)
        } catch (error) {
            console.log(error)
            setIsFinishing(false)
            setFeedback("Error generating report. The server may have timed out or crashed. Please submit again.")
        }
    }

    useEffect(() => {
        if (isIntroPhase) return
        if (!currentQuestion) return
        if (timeLeft === 0 && !isSubmitting && !feedback) {
            submitAnswer()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeLeft])

    useEffect(() => {
        return () => {
            if (recongitionRef.current) {
                recongitionRef.current.stop()
                recongitionRef.current.abort()
            }
            window.speechSynthesis.cancel()
        }
    }, [])

    return (
        <div className='min-h-screen bg-linear-to-br from-gray-50 via-gray-100 to-emerald-900/10 flex items-center justify-center p-4 sm:p-6'>
            <div className="w-full max-w-350 lg:h-[85vh] min-h-[80vh] bg-gray-100/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/30 flex flex-col lg:flex-row overflow-hidden">
                {/* VIDEO SECTION */}
                <div className="w-full lg:w-[35%] bg-gray-100/50 flex flex-col items-center p-6 space-y-6 border-r border-gray-200/30">
                    <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-xl">
                        {useMemo(() => (
                            <video
                                className='w-full h-auto object-cover'
                                muted
                                playsInline
                                preload='auto'
                                src={videoSource}
                                key={videoSource}
                                ref={videoRef} />
                        ), [videoSource])}
                    </div>

                    {/* Subtitle  */}
                    <div className={`w-full max-w-md bg-gray-50 border border-gray-200 rounded-xl shadow-md p-4 sm:p-6 transition-opacity duration-300 ${subtitle ? 'opacity-100' : 'opacity-0'}`}>
                        <p className="text-gray-700 text-sm sm:text-base font-medium text-center leading-relaxed min-h-[48px] flex items-center justify-center">
                            {subtitle || "Listening..."}
                        </p>
                    </div>

                    {/* Timer Area */}
                    <div className="w-full max-w-md bg-gray-100 border border-gray-200/40 rounded-2xl shadow-md p-6 space-y-5">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">
                                Interview Status
                            </span>
                            {isAIPlaying && <span className="text-sm font-semibold text-emerald-600">
                                {isAIPlaying ? "AI Speaking" : ""}
                            </span>}
                        </div>

                        <div className="h-px bg-gray-200"></div>

                        <div className="flex justify-center">
                            <Timer timeLeft={timeLeft} totalTime={currentQuestion?.timeLimit} />
                        </div>

                        <div className="h-px bg-gray-200"></div>

                        <div className="grid grid-cols-2 gap-6 text-center">
                            <div className="">
                                <span className="text-2xl font-bold text-emerald-600">{currentIndex + 1}</span>
                                <span className="text-xs text-gray-400 block mt-1">Current Question</span>
                            </div>
                            <div className="">
                                <span className="text-2xl font-bold text-emerald-600">{questions.length}</span>
                                <span className="text-xs text-gray-400 block mt-1">Total Questions</span>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Text Section */}
                <div className="flex-1 flex flex-col p-4 sm:p-6 md:p-8 relative overflow-y-auto">
                    <h2 className="text-xl sm:text-2xl font-bold text-emerald-600 mb-6">
                        AI Smart Interview
                    </h2>
                    {!isIntroPhase && (
                        <div className="relative mb-6 bg-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm">
                            <p className="text-xs sm:text-sm text-gray-400 mb-2">
                                Question {currentIndex + 1} of {questions.length}
                            </p>
                            <div className="text-base sm:text-lg font-semibold text-gray-800 leading-relaxed pr-16">{currentQuestion?.question}</div>
                        </div>
                    )}

                    <textarea
                        placeholder='Type your answer here...'
                        onChange={(e) => setAnswer(e.target.value)}
                        value={answer}
                        className='flex-1 bg-gray-100 p-4 sm:p-6 rounded-2xl resize-none outline-none border border-gray-200 focus-within:ring-2 focus:ring-emerald-500 transition text-gray-800'
                    />
                    {!feedback ? (
                        <div className="flex items-center gap-4 mt-6">
                            <motion.button
                                onClick={toggleMic}
                                whileTap={{ scale: 0.9 }}
                                className='w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-2xl bg-gray-100/50 border border-gray-200/50 text-emerald-600 shadow-md hover:bg-gray-100 transition'>
                                {isMicOn ? <FaMicrophone size={20} /> : <FaMicrophoneSlash size={20} className="text-red-400" />}

                            </motion.button>
                            <motion.button
                                onClick={submitAnswer}
                                disabled={isSubmitting}
                                whileTap={{ scale: 0.95 }}
                                className='flex-1 bg-linear-to-br from-emerald-600 to-teal-500 text-white py-3 sm:py-4 rounded-2xl shadow-lg hover:opacity-90 transition font-semibold disabled:bg-gray-500'>
                                {isSubmitting ? "Submitting..." : "Submit Answer"}
                            </motion.button>
                        </div>
                    ) : (
                        <motion.div className='mt-6 bg-emerald-900/20 border border-emerald-700/30 p-5 rounded-2xl shadow-sm'>
                            <p className="text-emerald-300 font-medium mb-4">{feedback} </p>

                            <button
                                onClick={handleNext}
                                disabled={isFinishing || isTransitioning}
                                className='w-full bg-linear-to-r from-emerald-600 to-teal-500 text-white py-3 rounded-xl shadow-md hover:opacity-90 transition flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed'>
                                {isFinishing ? "Finishing..." : "Next Question"} <BsArrowRight size={18} />
                            </button>
                        </motion.div>
                    )}
                </div>

            </div>
        </div>
    )
}

export default Step2Interview

/* 
 * ===========================================================================================
 *                           NOTES — Step2Interview.jsx
 * ===========================================================================================
 *
 * PURPOSE: The live interview session component (Step 2 of 3). This is the MOST COMPLEX
 *          component in the entire frontend. It manages the real-time interview experience
 *          by orchestrating 4 concurrent subsystems: Text-to-Speech, Speech-to-Text,
 *          a countdown timer, and video playback — all synchronized through React state
 *          and refs to deliver a seamless AI-interviewer experience.
 *
 * ROLE IN ARCHITECTURE:
 * ---------------------
 * Rendered by InterviewPage.jsx when step === 2. Receives `interviewData` (containing
 * `interviewId`, `questions[]`, and `username`) from Step1SetUp via the parent component.
 * On completion, calls `onFinish(reportData)` which advances to Step 3.
 *
 * COMPLETE WORKFLOW:
 * ------------------
 * Mount → Load Voices → Select Indian Voice → Run Intro Speech →
 * Read Question 1 Aloud → Start Timer → Enable Mic → User Speaks/Types →
 * Submit Answer (button or auto on timer=0) → AI Evaluates → Speak Feedback →
 * Show "Next Question" Button → Reset State → Repeat for Q2-Q5 →
 * After Last Question → Speak Closing Message → POST /finish → onFinish(report)
 *
 * IMPORTS & DEPENDENCIES:
 * -----------------------
 * 1. `React, useRef, useState, useMemo, useEffect`: Core React hooks for state, refs,
 *    memoization, and side effects.
 * 2. `motion` (motion/react): Framer Motion for button tap animations.
 * 3. `FaMicrophone, FaMicrophoneSlash` (react-icons/fa): Toggle icons for mic state.
 * 4. `videoOne, videoTwo` (../assets/videos/): Two MP4 avatar videos — one male, one female.
 *    Synced with TTS to create a "talking avatar" effect.
 * 5. `Timer` (./Timer): CircularProgressbar component showing countdown.
 * 6. `axios`: HTTP client for submitting answers and finishing the interview.
 * 7. `ServerURL` (../App): Backend API base URL.
 * 8. `BsArrowRight` (react-icons/bs): Arrow icon on the "Next Question" button.
 * 9. `useSelector` (react-redux): Reads userData for display name fallback.
 *
 * PROPS:
 * ------
 * - `interviewData`: { interviewId: string, questions: Array, username: string }
 * - `onFinish`: (reportData) => void — callback to advance to Step 3
 *
 * STATE VARIABLES (Complete Inventory):
 * -------------------------------------
 * | Variable          | Type     | Purpose                                              |
 * |-------------------|----------|------------------------------------------------------|
 * | isIntroPhase      | boolean  | true during AI intro speech, prevents timer start    |
 * | isMicOn           | boolean  | UI state for mic toggle button rendering              |
 * | isMicOnRef        | ref      | Mirror of isMicOn for use in callbacks (no stale)    |
 * | isAIPlaying       | boolean  | UI state — true when AI is speaking (pauses timer)   |
 * | isAIPlayingRef    | ref      | Mirror of isAIPlaying for callbacks                  |
 * | currentIndex      | number   | Index of the current question (0-4)                  |
 * | answer            | string   | User's transcribed/typed answer text                 |
 * | feedback          | string   | AI's evaluation feedback for the current question    |
 * | timeLeft          | number   | Countdown seconds remaining                          |
 * | selectedVoice     | object   | SpeechSynthesisVoice object chosen for TTS           |
 * | isSubmitting      | boolean  | true during answer submission API call                |
 * | voiceGender       | string   | "male" or "female" — determines which video to show  |
 * | subtitle          | string   | Text being spoken by AI, displayed as subtitle       |
 * | isTransitioning   | boolean  | true during question-to-question transition           |
 * | isFinishing       | boolean  | true during the final report generation API call      |
 * | actionLockRef     | ref      | Mutex lock preventing double-submit race conditions  |
 * | videoRef          | ref      | Reference to the <video> DOM element                 |
 * | recongitionRef    | ref      | Reference to webkitSpeechRecognition instance        |
 *
 * useEffect ANALYSIS (7 Effects):
 * --------------------------------
 *
 * [Effect 1 — Voice Loading] deps: []
 *   Runs once on mount. Calls `speechSynthesis.getVoices()` to get available system voices.
 *   Applies a priority-based voice selection:
 *   Priority 1: Named Indian voices (neerja, heera, veena, aditi, ravi, etc.)
 *   Priority 2: Any voice with lang "en-IN" or "hi-IN" or name containing "india"
 *   Priority 3: Any English female voice (excluding UK accents)
 *   Priority 4: First available voice (absolute fallback)
 *   Also sets voiceGender based on the selected voice name.
 *   Registers `onvoiceschanged` handler for Chrome (voices load asynchronously in Chrome).
 *
 * [Effect 2 — Intro & Question Speech] deps: [selectedVoice, isIntroPhase, currentIndex]
 *   Triggers when voice is ready or when intro phase / question index changes.
 *   If intro phase: speaks two greeting sentences, then sets isIntroPhase = false.
 *   If not intro phase: waits 800ms, optionally adds a "challenging" preamble for last Q,
 *   then speaks the current question and resets the timer.
 *
 * [Effect 3 — Timer Countdown] deps: [isIntroPhase, currentIndex, isAIPlaying, isTransitioning]
 *   Creates a 1-second setInterval that decrements timeLeft.
 *   PAUSES when: isIntroPhase, isAIPlaying, or isTransitioning is true.
 *   When timeLeft reaches 1, clears the interval and sets to 0.
 *   Returns cleanup function to clear interval on re-render.
 *
 * [Effect 4 — Timer Reset] deps: [currentIndex]
 *   Resets timeLeft to the new question's timeLimit when currentIndex changes.
 *   Guard: only runs after intro phase with a valid currentQuestion.
 *
 * [Effect 5 — Speech Recognition Setup] deps: []
 *   Runs once on mount. Creates a webkitSpeechRecognition instance with:
 *   - lang: "en-IN" (optimized for Indian accents)
 *   - continuous: true (doesn't stop after each phrase)
 *   - interimResults: false (only fires on final transcript)
 *   The onresult handler appends transcript to the answer state.
 *   The onend handler auto-restarts recognition if mic should be on and AI isn't speaking
 *   (uses refs, not state, to avoid stale closures).
 *
 * [Effect 6 — Auto-Submit on Timer Zero] deps: [timeLeft]
 *   When timeLeft === 0 and the user hasn't already submitted or received feedback,
 *   automatically calls submitAnswer(). This enforces the time limit.
 *
 * [Effect 7 — Cleanup on Unmount] deps: []
 *   Stops and aborts speech recognition. Cancels any in-progress speech synthesis.
 *   Prevents audio from continuing to play after navigating away.
 *
 * FUNCTION-BY-FUNCTION ANALYSIS:
 * ------------------------------
 *
 * [setMicState(state)] — Synchronized state updater
 *   Updates BOTH isMicOnRef.current AND isMicOn state simultaneously.
 *   This dual-update pattern ensures event handlers (which read refs) and React rendering
 *   (which reads state) always have the same value.
 *
 * [setAIState(state)] — Synchronized state updater
 *   Same pattern as setMicState but for the AI playing state.
 *
 * [speakText(text)] — Promise-based TTS function
 *   Returns a Promise that resolves when the speech finishes.
 *   Flow:
 *     1. Cancels any in-progress speech via speechSynthesis.cancel()
 *     2. Adds pauses after commas and periods for natural pacing
 *     3. Creates SpeechSynthesisUtterance with selected voice, rate 0.92, pitch 1.05
 *     4. onstart: sets AI state active, stops mic, plays avatar video
 *     5. onend: pauses video, resets to frame 0, sets AI inactive, restarts mic if enabled
 *     6. Sets subtitle text for visual display
 *     7. CRITICAL: 50ms setTimeout before speak() — Chrome silently drops utterances
 *        if speak() is called immediately after cancel()
 *   Edge Cases:
 *     - If speechSynthesis or selectedVoice is null, resolves immediately (no-op)
 *     - onerror handler catches synthesis failures (e.g., voice unavailable mid-session)
 *
 * [startMic() / stopMic()] — Recognition control
 *   Wrapped in try/catch because calling start() on an already-started recognition
 *   throws InvalidStateError, and stop() on already-stopped throws too.
 *
 * [toggleMic()] — UI mic button handler
 *   Flips mic state and calls startMic/stopMic accordingly.
 *
 * [submitAnswer()] — Answer submission to backend
 *   Protected by actionLockRef (prevents double-click submission).
 *   Flow:
 *     1. Sets lock, stops mic, shows "Submitting..." state
 *     2. POSTs { interviewId, questionIndex, answer, timeTaken } to /api/interview/submit-answer
 *     3. On success: stores feedback text, speaks feedback aloud
 *     4. On error: logs error, releases lock
 *   Edge Cases:
 *     - If user double-clicks Submit, actionLockRef prevents duplicate API calls
 *     - timeTaken = question.timeLimit - timeLeft (server validates this independently)
 *
 * [handleNext()] — Advance to next question
 *   Protected by actionLockRef + isFinishing + isTransitioning guards.
 *   Flow:
 *     If last question: speaks closing message → calls finishInterview()
 *     If not last: speaks transition phrase → clears answer/feedback → increments currentIndex
 *   Edge Cases:
 *     - For Q4 → Q5 transition, skips the "let's move to the next question" phrase
 *       to avoid redundancy with the "challenging" preamble in Effect 2.
 *
 * [finishInterview()] — Final report generation
 *   Disables mic permanently. POSTs { interviewId } to /api/interview/finish.
 *   On success: calls onFinish(result.data) → parent transitions to Step 3.
 *   On error: sets feedback with error message, resets isFinishing to allow retry.
 *
 * UI LAYOUT:
 * ----------
 * Split-panel layout (flex-col lg:flex-row):
 * LEFT PANEL (35%):
 *   - Avatar video (memoized to prevent remounting)
 *   - Subtitle box (shows AI speech text, fades when silent)
 *   - Timer panel with CircularProgressbar, question counter, total counter
 * RIGHT PANEL (65%):
 *   - "AI Smart Interview" header
 *   - Question card (hidden during intro phase)
 *   - Textarea for answer (accepts both typed and transcribed input)
 *   - Mic toggle button + Submit Answer button (shown before feedback)
 *   - Feedback card + Next Question button (shown after feedback)
 *
 * CONNECTIONS (Dependency Map):
 * ----------------------------
 * RENDERED BY: InterviewPage.jsx (step === 2)
 * RENDERS: Timer.jsx (circular countdown)
 * API CALLS:
 *   - POST /api/interview/submit-answer (per question, 5 times total)
 *   - POST /api/interview/finish (once, after all questions)
 * RECEIVES: interviewData from Step1SetUp via InterviewPage
 * PASSES TO: onFinish callback → InterviewPage → Step3Report
 *
 * DESIGN PATTERNS:
 * ----------------
 * - **Ref-State Mirror Pattern**: For values read in callbacks (event handlers, onend),
 *   a useRef mirror is maintained alongside useState. This avoids the classic React
 *   stale closure problem where callbacks capture old state values.
 * - **Mutex Lock Pattern**: actionLockRef acts as a manual mutex to prevent concurrent
 *   operations (double-submit, simultaneous next+submit).
 * - **Promise-based Speech Queue**: speakText returns a Promise, enabling sequential
 *   speech using async/await: `await speakText("first"); await speakText("second")`.
 * - **Graceful Degradation**: If webkitSpeechRecognition is not available, the user
 *   can still type answers. If speechSynthesis is unavailable, questions display as text.
 * - **Video Memoization**: The <video> element is wrapped in useMemo to prevent
 *   React from recreating it on every render (which would restart playback).
 *
 * INTERVIEW QUESTIONS:
 * --------------------
 * Q1: Why use useRef mirrors alongside useState instead of just useRef?
 * A1: useState triggers re-renders when the value changes (e.g., updating the mic icon).
 *     useRef doesn't trigger re-renders but always holds the current value. Callbacks like
 *     recognition.onend need the current value immediately (ref), while the UI needs to
 *     reflect changes visually (state). Using both gives us the best of both worlds.
 *
 * Q2: Why is there a 50ms delay between cancel() and speak()?
 * A2: Chrome's speech synthesis engine has an internal state machine. When cancel() is
 *     called, it needs time to transition from "speaking" to "idle." If speak() is called
 *     during this transition, Chrome silently discards the utterance. The 50ms delay ensures
 *     the engine has fully returned to idle before queuing a new utterance.
 *
 * Q3: How do you prevent the user from submitting the same answer twice?
 * A3: Three guards: (1) actionLockRef.current is set to true at the start of submitAnswer
 *     and released after completion, (2) isSubmitting state is checked, (3) the Submit
 *     button has disabled={isSubmitting}. All three must be false for submission to proceed.
 *
 * Q4: What happens if the browser doesn't support webkitSpeechRecognition?
 * A4: The Effect 5 guard `if (!("webkitSpeechRecognition" in window)) return` skips
 *     setup entirely. The mic button still renders but toggleMic() will be a no-op since
 *     recongitionRef.current will remain null. The user can still type their answers.
 *
 * Q5: Why does the timer pause when isAIPlaying or isTransitioning is true?
 * A5: It would be unfair to count down the user's time while the AI is speaking the
 *     question or transitioning between questions. The timer only runs when the user
 *     has control — i.e., when they can actually formulate and speak their answer.
 *
 * Q6: How does the voice selection algorithm work?
 * A6: It uses a cascading priority system. First, it searches for named Indian voices
 *     (neerja, heera, etc.) which are high-quality system voices. If none found, it falls
 *     back to any voice with "en-IN" or "hi-IN" locale. Then any English female voice.
 *     Finally, the first available voice. Chrome loads voices asynchronously, so the
 *     onvoiceschanged listener handles late-loading voice packs.
 *
 * Q7: Why is the <video> element memoized with useMemo?
 * A7: Without memoization, every re-render would create a new <video> JSX element.
 *     React would diff it against the old one and, because the component function is
 *     recreated, potentially remount it — resetting playback to 0. useMemo with
 *     [videoSource] as dependency ensures the element is only recreated when the
 *     video source actually changes (male vs. female voice selection).
 *
 * Q8: What is the humanText transformation in speakText?
 * A8: The code replaces commas with ", ... " and periods with ". ... " to insert
 *     artificial pauses into the speech. Without this, TTS engines speak continuously
 *     at machine speed, which sounds unnatural. The ellipsis characters add ~300ms
 *     pauses at natural breath points, making the AI voice more human-like.
 * ===========================================================================================
 */