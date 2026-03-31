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
    WORKFLOW
    Mount -> Load Voice -> Intro Speak -> Question Speak -> Mic ON -> Timer Running -> Submit -> Feedback Speak -> Next Question -> Repeat -> Finish
    
*/