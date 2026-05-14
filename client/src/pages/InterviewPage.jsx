import React, { useState } from 'react'
import Step1SetUp from '../components/Step1SetUp'
import Step2Interview from '../components/Step2Interview'
import Step3Report from '../components/Step3Report'

function InterviewPage() {
    const [step, setStep] = useState(1)
    const [interviewData, setInterviewData] = useState(null)
    return (
        <div className='min-h-screen bg-gray-50'>
            {step === 1 && (
                <Step1SetUp onStart={(data) => {
                    setInterviewData(data)
                    setStep(2)
                }} />
            )}
            {step === 2 && (
                <Step2Interview interviewData={interviewData}
                    onFinish={(report) => {
                        setInterviewData(report)
                        setStep(3)
                    }} />
            )}
            {step === 3 && (
                <Step3Report report={interviewData} />
            )}
        </div>
    )
}

export default InterviewPage

/*
 * ===========================================================================================
 *                              NOTES — InterviewPage.jsx
 * ===========================================================================================
 *
 * PURPOSE: 3-step wizard orchestrator that conditionally renders the interview flow:
 *          Step 1 (Setup) → Step 2 (Live Interview) → Step 3 (Report).
 *
 * STATE: `step` (1|2|3) controls which component is shown. `interviewData` holds the
 * data passed between steps (questions from Step1, report from Step2).
 *
 * DATA FLOW:
 * - Step1 onStart(data) → stores questions + interviewId → advances to step 2
 * - Step2 onFinish(report) → stores report data → advances to step 3
 * - Step3 receives report and renders the analytics dashboard
 *
 * CONNECTIONS: Imports Step1SetUp, Step2Interview, Step3Report. Mounted at /interview route.
 * ===========================================================================================
 */