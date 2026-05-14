import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { FaTimes } from 'react-icons/fa'
import Auth from '../pages/Auth'

function AuthModel({ onClose }) {
    const { userData } = useSelector((state) => state.user)
    useEffect(() => {
        if (userData) {
            onClose()
        }
    }, [userData, onClose])
    return (
        <div className='fixed inset-0 z-999 flex items-center justify-center bg-black/10 backdrop-blur-sm px-4'>
            <div className='relative w-full max-w-md'>
                <button 
                onClick={onClose}
                className='absolute top-8 right-5 text-gray-800 hover:text-black text-xl'>
                    <FaTimes size={18}/>
                </button>
                <Auth isModel={true}/>
            </div>
        </div>
    )
}

export default AuthModel

/*
 * ===========================================================================================
 *                              NOTES — AuthModel.jsx
 * ===========================================================================================
 *
 * PURPOSE: A modal overlay that renders the Auth page inline (as a popup) when a user
 *          tries to access a protected feature without being logged in.
 *
 * ROLE IN ARCHITECTURE: Used by Navbar.jsx and Home.jsx as an inline authentication gate.
 * Instead of redirecting to /auth, this component overlays the current page with a
 * blurred backdrop and renders <Auth isModel={true}/> inside a constrained container.
 *
 * KEY BEHAVIORS:
 * - Auto-closes when `userData` becomes truthy (user logs in successfully).
 * - Close button (FaTimes) calls `onClose` callback to remove the overlay.
 * - Passes `isModel={true}` to Auth component, which adjusts its styling (smaller padding,
 *   no full-screen background) for modal context.
 *
 * CONNECTIONS: Reads userData from Redux, renders Auth page component, receives onClose prop.
 * ===========================================================================================
 */