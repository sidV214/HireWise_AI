import { motion } from 'motion/react'
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { BsRobot, BsCoin } from 'react-icons/bs'
import { HiOutlineLogout } from 'react-icons/hi'
import { FaUserAstronaut } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { ServerURL } from '../App'
import { setUserData } from '../redux/userSlice'
import AuthModel from './AuthModel'

function Navbar() {
    const { userData } = useSelector((state) => state.user)
    const [showCreditPopup, setShowCreditPopup] = useState(false)
    const [showUserPopup, setShowUserPopup] = useState(false)
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [showAuth, setShowAuth] = useState(false)
    const handleLogout = async () => {
        try {
            await axios.get(ServerURL + "/api/auth/logout", { withCredentials: true })
            dispatch(setUserData(null))
            setShowCreditPopup(false)
            setShowUserPopup(false)
            navigate("/")
        } catch (error) {
            console.log("Logout related error: ", error);

        }
    }
    return (
        <div className='bg-gray-50 flex justify-center px-4 pt-6'>
            <motion.div
                initial={{ opacity: 0, y: -40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className='w-full max-w-6xl glass-panel rounded-[24px] px-8 py-4 flex justify-between items-center relative'>
                <div className='flex items-center gap-3 cursor-pointer'>
                    <div className='bg-emerald-100/50 border border-emerald-400/20 text-emerald-600 p-2 rounded-lg'>
                        <BsRobot size={18} />
                    </div>
                    <h1 className='font-semibold hidden md:block text-lg'>HireWise_AI</h1>
                </div>
                <div className='flex items-center gap-6 relative'>
                    <div className='relative'>
                        <button
                            onClick={() => {
                                if (!userData) {
                                    setShowAuth(true)
                                    return
                                }
                                setShowCreditPopup(!showCreditPopup);
                                setShowUserPopup(false)
                            }}
                            className='flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full text-md hover:bg-gray-200 transition'>
                            <BsCoin size={20} />
                            {userData?.credits || 0}
                        </button>

                        {showCreditPopup && (
                            <div className='absolute right-0 mt-3 w-64 bg-gray-100 shadow-xl border border-gray-200 rounded-2xl p-5 z-50'>
                                <p className='text-sm text-gray-400 mb-4'>Need more credits to continue interviews.</p>
                                <button
                                    onClick={() => navigate("/pricing")}
                                    className='w-full bg-black text-white py-2 rounded-lg text-sm hover:opacity-90 transition'>Buy more credits</button>
                            </div>
                        )}
                    </div>
                    <div className='relative'>
                        <button
                            onClick={() => {
                                if (!userData) {
                                    setShowAuth(true)
                                    return
                                }
                                setShowUserPopup(!showUserPopup)
                                setShowCreditPopup(false)

                            }}
                            className='w-9 h-9 bg-black text-white rounded-full flex items-center justify-center font-semibold'>
                            {userData ? userData?.name.slice(0, 1).toUpperCase() : <FaUserAstronaut size={16} />}
                        </button>
                        {showUserPopup && (
                            <div className='absolute right-0 mt-3 w-48 bg-gray-100 shadow-xl border border-gray-200 rounded-2xl p-4 z-50'>
                                <p className='text-md text-emerald-500 font-medium mb-1'>{userData?.name}</p>
                                <button
                                    onClick={() => navigate("/history")}
                                    className='w-full text-left text-sm py-2 hover:text-white text-gray-400'> Interview History</button>
                                <button
                                    onClick={handleLogout}
                                    className='w-full text-left text-sm py-2 flex items-center gap-2 text-gray-400 hover:text-white transition'>
                                    Logout
                                    <HiOutlineLogout size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
            {showAuth && <AuthModel onClose={() => setShowAuth(false)} />}
        </div>
    )
}

export default Navbar

/*
 * ===========================================================================================
 *                              NOTES — Navbar.jsx
 * ===========================================================================================
 *
 * PURPOSE: Top navigation bar providing branding, credit display, user menu with dropdown,
 *          and authentication gating. This is the primary navigation and account control
 *          component visible on the Home page.
 *
 * ROLE IN ARCHITECTURE:
 * ---------------------
 * Rendered by Home.jsx. This is NOT a globally persistent navbar — it only appears on the
 * Home/landing page. Other pages (Interview, Pricing, History) have their own navigation.
 * The Navbar serves as the first auth checkpoint: if a user interacts with credits or
 * profile without being logged in, it opens the AuthModel overlay.
 *
 * IMPORTS & DEPENDENCIES:
 * -----------------------
 * 1. `motion` (motion/react): For the slide-down entrance animation of the navbar.
 * 2. `React, useState`: Component rendering and local popup toggle states.
 * 3. `useDispatch, useSelector` (react-redux): Read userData for auth state; dispatch
 *    setUserData(null) on logout.
 * 4. `BsRobot` (react-icons/bs): Robot icon for the brand logo.
 * 5. `BsCoin` (react-icons/bs): Coin icon for the credits button.
 * 6. `HiOutlineLogout` (react-icons/hi): Logout icon in the user dropdown.
 * 7. `FaUserAstronaut` (react-icons/fa): Placeholder avatar for unauthenticated users.
 * 8. `useNavigate` (react-router-dom): Navigates to /pricing, /history, or "/" on actions.
 * 9. `axios`: HTTP client for the logout API call.
 * 10. `ServerURL` (../App): Backend base URL.
 * 11. `setUserData` (../redux/userSlice): Redux action for clearing user state.
 * 12. `AuthModel` (./AuthModel): Modal login overlay.
 *
 * STATE VARIABLES:
 * ----------------
 * | Variable        | Type    | Purpose                                          |
 * |-----------------|---------|--------------------------------------------------|
 * | showCreditPopup | boolean | Toggles the credits dropdown ("Buy more" popup)  |
 * | showUserPopup   | boolean | Toggles the user profile dropdown                |
 * | showAuth        | boolean | Toggles the AuthModel login overlay               |
 *
 * FUNCTION ANALYSIS:
 * ------------------
 *
 * [handleLogout()] — Session termination
 *   Flow:
 *     1. Calls GET /api/auth/logout with credentials (backend clears the cookie).
 *     2. Dispatches setUserData(null) to clear Redux state.
 *     3. Closes both popups (credit and user).
 *     4. Navigates to "/" (home page).
 *   Edge Cases:
 *     - If the logout API fails, the error is logged but the UI doesn't change.
 *       The cookie may still be valid, but the Redux state is already cleared on catch.
 *
 * UI LAYOUT:
 * ----------
 * Centered max-w-6xl container with glass-panel styling:
 *
 * LEFT SIDE:
 *   - BsRobot icon in emerald badge + "HireWise_AI" text (hidden on mobile via md:block)
 *
 * RIGHT SIDE:
 *   - Credits button: Shows BsCoin icon + credit count (userData?.credits || 0).
 *     - If NOT logged in: opens AuthModel.
 *     - If logged in: toggles credit popup dropdown.
 *     - Credit popup contains: message text + "Buy more credits" button → /pricing.
 *   - Profile button: Shows user's first initial (uppercase) in a black circle.
 *     - If NOT logged in: shows FaUserAstronaut icon; opens AuthModel on click.
 *     - If logged in: toggles user dropdown.
 *     - User dropdown contains: user name, "Interview History" button → /history,
 *       "Logout" button with HiOutlineLogout icon.
 *
 * POPUP MUTUAL EXCLUSION:
 *   When one popup opens, the other closes:
 *   - Credit click: setShowCreditPopup(toggle), setShowUserPopup(false)
 *   - Profile click: setShowUserPopup(toggle), setShowCreditPopup(false)
 *
 * ANIMATIONS:
 * -----------
 * - Navbar slides down from y: -40 with 0.3s duration on mount.
 * - Popups appear immediately (no animation) via conditional rendering.
 *
 * CONNECTIONS (Dependency Map):
 * ----------------------------
 * RENDERED BY: Home.jsx
 * RENDERS: AuthModel (conditional)
 * READS FROM: Redux store (userData.name, userData.credits)
 * WRITES TO: Redux store (setUserData(null) on logout)
 * API CALLS: GET /api/auth/logout (clears httpOnly cookie)
 * NAVIGATES TO: /pricing (buy credits), /history (interview list), / (after logout)
 *
 * DESIGN PATTERNS:
 * ----------------
 * - **Auth Gate Pattern**: Both interactive buttons check `if (!userData)` before
 *   showing their dropdown. If not logged in, the AuthModel appears instead.
 *   Once login completes (userData becomes truthy), the AuthModel auto-closes.
 * - **Mutual Exclusion Popups**: Only one dropdown can be open at a time,
 *   preventing visual clutter and confusion.
 * - **Glass-panel Styling**: Uses the custom `.glass-panel` utility class from
 *   index.css (bg-gray-100/50 + backdrop-blur-xl + border + shadow-glass).
 *
 * INTERVIEW QUESTIONS:
 * --------------------
 * Q1: Why is logout a GET request instead of POST?
 * A1: RESTfully, logout should be POST (it modifies server state by clearing the cookie).
 *     Using GET works but is technically incorrect and could be triggered by a browser
 *     prefetch or crawler. A POST with CSRF protection would be more secure.
 *
 * Q2: What happens if the user clicks outside the popups?
 * A2: Currently, the popups don't close on outside clicks — only by clicking the same
 *     button again or clicking the other button (mutual exclusion). Adding a click-outside
 *     listener or using a library like Headless UI would improve the UX.
 *
 * Q3: Why show `userData?.credits || 0` instead of just `userData?.credits`?
 * A3: The `|| 0` fallback handles two cases: (1) userData is null (not logged in) →
 *     shows "0", (2) userData.credits is somehow undefined → still shows "0".
 *     The optional chaining `?.` prevents a crash if userData is null.
 * ===========================================================================================
 */