import React from 'react'
import { BsRobot } from 'react-icons/bs'

function Footer() {
    return (
        <div className='bg-gray-50 flex justify-center px-4 pb-10 py-4 pt-10'>
            <div className='w-full max-w-6xl bg-gray-100/30 backdrop-blur-xl rounded-[24px] shadow-sm border border-gray-200/40 py-8 px-3 text-center'>
                <div className='flex justify-center items-center gap-3 mb-3'>
                    <div className='bg-black text-white p-2 rounded-lg'> <BsRobot size={16} /> </div>
                    <h2 className='font-semibold'>HireWise_AI</h2>
                </div>
                <p className='text-gray-500 text-sm max-w-xl mx-auto'>
                    AI-powered interview preparation platform designed to improve communication skills, technical depth and professional confidence.
                </p>
            </div>
        </div>
    )
}

export default Footer

/*
 * ===========================================================================================
 *                              NOTES — Footer.jsx
 * ===========================================================================================
 *
 * PURPOSE: Simple branding footer rendered at the bottom of the Home page.
 *          Displays the HireWise_AI logo and tagline.
 *
 * ROLE IN ARCHITECTURE: Presentational component with zero logic or state.
 * Only rendered in Home.jsx. Uses glass-panel styling consistent with the design system.
 * ===========================================================================================
 */