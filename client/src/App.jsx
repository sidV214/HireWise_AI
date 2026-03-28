import React from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useScroll, useSpring, MotionConfig } from 'motion/react'
import CustomCursor from './components/CustomCursor'
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
  
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

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
      <CustomCursor />
      <motion.div
        style={{ scaleX, transformOrigin: "0%" }}
        className="fixed top-0 left-0 right-0 h-1.5 bg-emerald-600 z-50 origin-left"
      />
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
