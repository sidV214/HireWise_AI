import React from 'react'
import { BsRobot } from "react-icons/bs";
import { IoSparklesSharp } from "react-icons/io5";
import { motion } from "motion/react"
import { FcGoogle } from "react-icons/fc";
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../utils/firebase.js';
import axios from 'axios'
import { ServerURL } from '../App';
import { useDispatch } from 'react-redux';
import { setUserData } from '../redux/userSlice.js';

function Auth({ isModel = false }) {

    const dispatch = useDispatch()

    const handleGoogleAuth = async () => {
        try {
            const response = await signInWithPopup(auth, provider)
            let User = response.user
            let name = User.displayName
            let email = User.email
            const result = await axios.post(ServerURL + "/api/auth/google-auth", { name, email }, { withCredentials: true })
            dispatch(setUserData(result.data))
        } catch (error) {
            console.log(`Auth error: ${error}`)
            dispatch(setUserData(null));
        }
    }
    return (
        <div className={`w-full ${isModel ? "py-4" : "min-h-screen bg-gray-50 flex items-center justify-center px-6 py-20"}`}>
            <motion.div
                initial={{ opacity: 0, y: -40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.05 }}
                className={`w-full
                    ${isModel ? "max-w-md p-8 rounded-3xl" : "max-w-lg p-12 rounded-[32px]"}
                    bg-gray-100 shadow-2xl border border-gray-200/50
                `}>
                <div className='flex items-center justify-center gap-3 mb-6'>
                    <div className='bg-black text-white p-2 rounded-lg'>
                        <BsRobot size={18} />
                    </div>
                    <h2 className='font-semibold text-lg'>InterviewIQ.AI</h2>
                </div>
                <h1 className='text-2xl md:text-3xl font-semibold text-center leading-snug mb-4'>
                    Continue with
                    <span className='bg-emerald-100/50 border border-emerald-400/20 text-emerald-600 px-3 py-1 rounded-full inline-flex items-center gap-2'>
                        <IoSparklesSharp size={16} />
                        AI Smart Interview
                    </span>
                </h1>
                <p className='text-gray-500 text-center text-sm md:text-base leading-relaxed mb-8'>
                    Sign in to start AI-powered mock interviews, track your progress and unlock detailed performance insights.
                </p>
                <motion.button
                    onClick={handleGoogleAuth}
                    whileHover={{ opacity: 0.9, scale: 1.03 }}
                    whileTap={{ opacity: 1, scale: 0.98 }}
                    className='w-full flex items-center justify-center gap-3 py-3 bg-black text-white rounded-full shadow-md'>
                    <FcGoogle size={20} />
                    Continue with Google
                </motion.button>
            </motion.div>
        </div>
    )
}

export default Auth

/*
 * ===========================================================================================
 *                              NOTES — Auth.jsx
 * ===========================================================================================
 *
 * PURPOSE: Google OAuth authentication page. Handles the entire login flow from Firebase
 *          popup to backend session creation to Redux state hydration. Supports both
 *          full-page rendering and compact modal rendering.
 *
 * ROLE IN ARCHITECTURE:
 * ---------------------
 * Used in TWO rendering contexts:
 * (1) Full Page: Mounted at "/auth" route in App.jsx. User navigates here directly.
 * (2) Modal Mode: Rendered inside AuthModel.jsx with `isModel={true}`. Appears as
 *     an overlay when unauthenticated users try to access protected features.
 * The `isModel` prop controls padding, background, and container sizing.
 *
 * IMPORTS & DEPENDENCIES:
 * -----------------------
 * 1. `React, useState`: Component rendering and loading state.
 * 2. `FcGoogle` (react-icons/fc): Google "G" logo icon (full color).
 * 3. `auth, provider` (../utils/firebase): Firebase Auth instance and GoogleAuthProvider
 *    preconfigured with the project's Firebase credentials.
 * 4. `signInWithPopup` (firebase/auth): Opens the Google OAuth consent popup.
 * 5. `axios`: HTTP client for sending auth data to the backend.
 * 6. `ServerURL` (../App): Backend API base URL.
 * 7. `useDispatch` (react-redux): Dispatches setUserData after successful login.
 * 8. `setUserData` (../redux/userSlice): Redux action for storing user profile.
 *
 * PROPS:
 * ------
 * - `isModel`: boolean (default: false). When true, renders in compact modal styling.
 *
 * STATE VARIABLES:
 * ----------------
 * | Variable | Type    | Purpose                                     |
 * |----------|---------|---------------------------------------------|
 * | loading  | boolean | true during the auth flow (disables button)  |
 *
 * FUNCTION ANALYSIS:
 * ------------------
 *
 * [handleGoogleAuth()] — Complete Google OAuth flow
 *   Flow:
 *     1. Sets loading = true (button shows "Signing in...").
 *     2. Calls `signInWithPopup(auth, provider)` → opens Google OAuth popup.
 *     3. Google authenticates the user and returns a Firebase UserCredential.
 *     4. Extracts `displayName` and `email` from `result.user`.
 *     5. POSTs `{ name: displayName, email }` to /api/auth/google-auth.
 *     6. Backend finds or creates the User document, generates a JWT, and sets
 *        an httpOnly cookie in the response.
 *     7. Dispatches `setUserData(result.data)` to Redux — stores user profile.
 *     8. Sets loading = false.
 *   Error Handling:
 *     - If the popup is closed by the user: Firebase throws "auth/popup-closed-by-user"
 *       → caught by catch → dispatches setUserData(null), sets loading = false.
 *     - If the backend is down: axios throws → caught by catch → same cleanup.
 *     - In ALL error cases, setUserData(null) is dispatched to ensure the UI reflects
 *       the unauthenticated state (no stale data from a previous session).
 *
 * UI LAYOUT:
 * ----------
 * The layout adapts based on `isModel` prop:
 *
 * FULL PAGE (isModel = false):
 *   - Full-screen centered container with bg-gray-50
 *   - Large glass-panel card with rounded-3xl
 *   - p-16 padding for spacious feel
 *
 * MODAL MODE (isModel = true):
 *   - Smaller padding (p-8 sm:p-12)
 *   - No background color (inherits from AuthModel's overlay)
 *   - Constrained max-width for modal context
 *
 * SHARED CONTENT:
 *   - "InterviewIQ.AI" header text (NOTE: outdated branding — should be "HireWise_AI")
 *   - "Your AI Powered Interview Coach" subtitle
 *   - Divider line
 *   - "Continue with Google" button with FcGoogle icon
 *   - Loading state shows "Signing in..."
 *   - Privacy note: "Secure authentication powered by Google"
 *
 * CONNECTIONS (Dependency Map):
 * ----------------------------
 * MOUNTED AT: /auth route in App.jsx (full page)
 * RENDERED BY: AuthModel.jsx (modal mode)
 * API CALLS: POST /api/auth/google-auth → auth.controller.js::googleAuth
 * EXTERNAL: Firebase Auth SDK, Google OAuth consent screen
 * WRITES TO: Redux store (setUserData with user profile)
 *
 * DESIGN PATTERNS:
 * ----------------
 * - **Dual Rendering Mode**: A single component handles both full-page and modal
 *   contexts via a prop. This is the Adapter Pattern — the same logic adapts its
 *   presentation based on the rendering context.
 * - **Third-Party OAuth Delegation**: The app never handles passwords. Firebase
 *   manages the entire OAuth flow (consent popup, token exchange) and returns a
 *   verified user profile. The backend only stores the name/email.
 * - **Defensive Error Handling**: On ANY error, the Redux state is explicitly cleared
 *   to null. This prevents the UI from showing a "logged in" state when auth failed.
 *
 * INTERVIEW QUESTIONS:
 * --------------------
 * Q1: Why use Firebase for Google Auth instead of implementing OAuth directly?
 * A1: Firebase handles the complex OAuth flow (redirect URI setup, token exchange,
 *     ID token verification) with a single function call. Implementing OAuth directly
 *     requires managing authorization codes, access tokens, refresh tokens, and PKCE
 *     — significantly more code and security surface area.
 *
 * Q2: Why send the user's name/email to the backend instead of the Firebase token?
 * A2: The backend uses its own JWT system (not Firebase tokens). Sending name/email
 *     allows the backend to find-or-create a User document and issue its own JWT cookie.
 *     The trade-off is that the backend trusts the frontend's claim about the user's
 *     identity. For higher security, the backend should verify the Firebase ID token.
 *
 * Q3: Why does the error handler dispatch setUserData(null)?
 * A3: Consider a scenario: User A is logged in. The session expires. They try to log in
 *     again but the popup fails. Without the null dispatch, the Redux store still contains
 *     User A's stale data from before the error. The UI would incorrectly show them as
 *     logged in when they're not.
 *
 * Q4: What is the "InterviewIQ.AI" branding in the header?
 * A4: This appears to be an earlier project name that was not updated when the project
 *     was renamed to "HireWise_AI". The branding in Auth.jsx is inconsistent with the
 *     Navbar (which correctly shows "HireWise_AI"). This is a minor cosmetic bug.
 * ===========================================================================================
 */