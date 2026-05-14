import React from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, MotionConfig } from 'motion/react'
import Home from './pages/Home'
import Auth from './pages/Auth'
import { useEffect } from 'react'
import axios from 'axios'
import { useDispatch } from 'react-redux'
import { setUserData } from './redux/userSlice.js'
import InterviewPage from './pages/InterviewPage.jsx'
import InterviewHistory from './pages/InterviewHistory.jsx'
import Pricing from './pages/Pricing.jsx'
import InterviewReport from './pages/InterviewReport.jsx'

export const ServerURL = "https://hirewise-ai-s5oy.onrender.com"

function App() {

  const dispatch = useDispatch()
  const location = useLocation()

  useEffect(() => {
    const getUser = async () => {
      try {
        const result = await axios.get(ServerURL + "/api/user/current-user", { withCredentials: true })
        dispatch(setUserData(result.data));
      } catch (error) {
        console.log(error)
        dispatch(setUserData(null))
      }
    }
    getUser()
  }, [dispatch])

  return (
    <>
      <div className="fixed inset-0 z-[-2] overflow-hidden pointer-events-none">
         <motion.div 
           animate={{ rotate: 360, x: [0, 50, 0], y: [0, 30, 0] }}
           transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
           className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] min-w-[500px] min-h-[500px] rounded-full opacity-[0.10] bg-emerald-500/20 blur-[120px]"
         />
         <motion.div 
           animate={{ rotate: -360, x: [0, -30, 0], y: [0, 50, 0] }}
           transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
           className="absolute top-[40%] -right-[10%] w-[50%] h-[50%] min-w-[500px] min-h-[500px] rounded-full opacity-[0.05] bg-cyan-500/10 blur-[100px]"
         />
      </div>

      <div className="fixed inset-0 z-[-1] pointer-events-none opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")" }} />

      <MotionConfig reducedMotion="user">
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
        <Route path='/' element={<Home />} />
        <Route path='/auth' element={<Auth />} />
        <Route path='/interview' element={<InterviewPage />} />
        <Route path='/history' element={<InterviewHistory />} />
        <Route path='/pricing' element={<Pricing />} />
        <Route path='/report/:id' element={<InterviewReport />} />
      </Routes>
    </AnimatePresence>
    </MotionConfig>
    </>
  )
}

export default App

/*
 * ===========================================================================================
 *                              NOTES — App.jsx
 * ===========================================================================================
 *
 * PURPOSE: Root application component that defines the client-side routing table,
 *          performs session rehydration on mount, and renders the ambient background effects.
 *
 * ROLE IN ARCHITECTURE:
 * ---------------------
 * This file is the single top-level component rendered by `main.jsx`. It serves three
 * critical functions: (1) defines all application routes, (2) fetches the current user's
 * session on every page load, and (3) renders the persistent background animations that
 * give the app its premium dark-mode aesthetic.
 *
 * IMPORTS & DEPENDENCIES:
 * -----------------------
 * 1. `React`: Core library (implicit in JSX).
 * 2. `Route, Routes, useLocation` (react-router-dom): For defining URL-to-component mappings
 *    and accessing the current pathname for AnimatePresence transitions.
 * 3. `AnimatePresence, motion, MotionConfig` (motion/react): Framer Motion components for
 *    page transition animations. `AnimatePresence` enables exit animations when routes change.
 * 4. `useEffect` (React): Used for the session rehydration side effect on mount.
 * 5. `axios`: HTTP client for calling the backend API to fetch the current user.
 * 6. `useDispatch` (react-redux): Dispatches the fetched user data into the Redux store.
 * 7. `setUserData` (./redux/userSlice.js): Redux action creator for updating user state.
 * 8. Page components: Home, Auth, InterviewPage, InterviewHistory, Pricing, InterviewReport.
 *
 * KEY ELEMENTS:
 * -------------
 * [ServerURL] — Exported constant string pointing to the backend API base URL.
 *   - Used by ALL frontend files that make API calls (Navbar, Step1SetUp, Step2Interview, etc.).
 *   - Hardcoded to the Render deployment URL. For local development, this would need to be
 *     changed to `http://localhost:6000`.
 *
 * [Session Rehydration useEffect]:
 *   - Runs once on mount (dependency: `[dispatch]`).
 *   - Calls `GET /api/user/current-user` with `withCredentials: true` to send the JWT cookie.
 *   - On success: dispatches the user data to Redux (name, email, credits).
 *   - On failure: dispatches `null` (user is not logged in or token is invalid).
 *
 * [Ambient Background]:
 *   - Two `motion.div` elements with rotating, translating animations create soft emerald
 *     and cyan blurred blobs behind all content (`z-[-2]`).
 *   - A noise texture SVG overlay (`z-[-1]`) adds subtle grain for a premium feel.
 *   - These are `pointer-events-none` so they don't interfere with user interactions.
 *
 * [Route Table]:
 *   - `/` → Home (landing page)
 *   - `/auth` → Auth (Google login page)
 *   - `/interview` → InterviewPage (3-step wizard: setup → interview → report)
 *   - `/history` → InterviewHistory (list of past interviews)
 *   - `/pricing` → Pricing (credit purchase plans)
 *   - `/report/:id` → InterviewReport (detailed analytics for a specific interview)
 *
 * CONNECTIONS (Dependency Map):
 * ----------------------------
 * RENDERED BY: `main.jsx`
 * RENDERS: All page-level components
 * API CALL: `GET /api/user/current-user` → `user.controller.js` → `User.model.js`
 *
 * DESIGN PATTERNS:
 * ----------------
 * - **Centralized Route Definition**: All routes are defined in one place, making the
 *   application's URL structure immediately visible to any developer.
 * - **Animated Route Transitions**: Using `AnimatePresence` with `location.pathname` as
 *   key enables smooth fade/slide transitions between pages.
 * - **Session Rehydration on Mount**: The useEffect ensures that even after a full page
 *   refresh, the Redux store is repopulated with the user's session data.
 *
 * INTERVIEW QUESTIONS:
 * --------------------
 * Q1: Why is `key={location.pathname}` set on the `<Routes>` component?
 * A1: React uses keys to determine when a component should unmount and remount. By setting
 *     the key to the current URL path, React treats each route as a unique instance.
 *     `AnimatePresence` detects the old component unmounting and plays its `exit` animation
 *     before the new component's `initial` animation plays.
 *
 * Q2: Why is `ServerURL` hardcoded instead of using an environment variable?
 * A2: It could (and should) use `import.meta.env.VITE_SERVER_URL`. Hardcoding works but
 *     requires code changes when switching between development and production environments.
 *
 * Q3: What does `MotionConfig reducedMotion="user"` do?
 * A3: It respects the user's operating system "Reduce Motion" accessibility setting.
 *     If a user has enabled reduced motion in their OS (for reasons like motion sickness),
 *     Framer Motion will automatically skip animations, improving accessibility.
 *
 * Q4: Why dispatch `setUserData(null)` in the catch block?
 * A4: If the API call fails (expired token, network error, 401), the frontend needs to
 *     know the user is NOT authenticated. Setting `userData` to `null` triggers the
 *     unauthenticated UI state (showing login buttons instead of user profile).
 * ===========================================================================================
 */
