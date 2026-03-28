import React, { useState } from 'react'
import Navbar from '../components/Navbar'
import { useSelector } from 'react-redux'
import { motion, useScroll, useTransform } from 'motion/react'
import { scrollReveal } from '../utils/motion'
import {
  BsRobot,
  BsMic,
  BsClock,
  BsBarChart,
  BsFileEarmarkText
} from 'react-icons/bs'
import { HiSparkles } from 'react-icons/hi'
import { useNavigate } from 'react-router-dom'
import AuthModel from '../components/AuthModel'
import hrImg from '../assets/image1.png'
import techImg from '../assets/image2.png'
import confidenceImg from '../assets/image3.png'
import creditImg from '../assets/image4.png'
import evalImg from '../assets/image5.png'
import resumeImg from '../assets/image6.png'
import pdfImg from '../assets/image7.png'
import analyticsImg from '../assets/image8.png'
import Footer from '../components/Footer'
import SpotlightCard from '../components/SpotlightCard'
import MagneticButton from '../components/MagneticButton'

function Home() {
  const { userData } = useSelector((state) => state.user)
  const [showAuth, setShowAuth] = useState(false)
  const navigate = useNavigate()
  const { scrollYProgress } = useScroll()
  const y1 = useTransform(scrollYProgress, [0, 1], [0, 400])
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -400])

  return (
    <div className='min-h-screen bg-gray-50 flex flex-col relative overflow-hidden text-gray-900'>
      {/* Background Parallax blobs (softened) */}
      <motion.div style={{ y: y1 }} className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-emerald-200 rounded-full mix-blend-multiply filter blur-[120px] opacity-15 pointer-events-none z-0" />
      <motion.div style={{ y: y2 }} className="absolute top-1/2 -right-32 w-[500px] h-[500px] bg-teal-200 rounded-full mix-blend-multiply filter blur-[120px] opacity-15 pointer-events-none z-0" />
      
      <div className="relative z-10">
      <Navbar />
      <div className='flex-1 px-6 py-20'>
        <div className='max-w-6xl mx-auto'>
          <div className='flex justify-center mb-6'>
            <div className='bg-emerald-500/10 border border-emerald-400/20 text-emerald-500 text-sm px-4 py-2 rounded-full flex items-center gap-2 font-medium'>
              <HiSparkles size={16} />
              AI Powered Smart Interview Platform
            </div>
          </div>
          <div className='text-center mb-28'>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}

              className='text-4xl md:text-6xl font-semibold leading-tight max-w-4xl mx-auto'>
              Practice Interviews with
              <span className='relative inline-block mt-2 sm:mt-0 sm:ml-4'>
                <span className='absolute inset-0 bg-emerald-500/20 blur-xl rounded-full'></span>
                <span className='relative bg-clip-text text-transparent bg-linear-to-r from-emerald-400 to-cyan-400 px-2'>
                  AI Intelligence
                </span>
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className='text-gray-500 mt-6 max-w-2xl mx-auto text-lg'>
              Role-based mock interviews with smart follow-ups, adaptive difficulty and real-time performance evaluation.
            </motion.p>
            <div className='flex flex-wrap justify-center gap-4 mt-10'>
              <MagneticButton
                onClick={() => {
                  if (!userData) {
                    setShowAuth(true)
                    return
                  }
                  navigate("/interview")
                }}
                className='bg-emerald-600 text-gray-900 border border-emerald-500 px-10 py-3 rounded-full hover:bg-emerald-500 transition shadow-[0_0_20px_rgba(16,185,129,0.2)] font-semibold font-sans tracking-wide'>
                Start Interview
              </MagneticButton>
              <MagneticButton
                onClick={() => {
                  if (!userData) {
                    setShowAuth(true)
                    return
                  }
                  navigate("/history")
                }}
                className='border border-gray-600/50 text-gray-400 px-10 py-3 rounded-full hover:bg-gray-100/10 transition font-sans'>
                View History
              </MagneticButton>
            </div>
          </div>
          <div className=' flex flex-col md:flex-row justify-center items-center gap-10 mb-28'>
            {
              [
                {
                  icon: <BsRobot size={24} />,
                  step: "STEP 1",
                  title: "Role and Experience Selection",
                  desc: "AI adjusts difficulty based on selected job role."
                },
                {
                  icon: <BsMic size={24} />,
                  step: "STEP 2",
                  title: "Smart Voice Interview",
                  desc: "Dynamic follow-up questions based on your answers."
                },
                {
                  icon: <BsClock size={24} />,
                  step: "STEP 3",
                  title: "Timer Based Simulation",
                  desc: "Real interview pressure with time tracking."
                }
              ].map((item, index) => (
                <motion.div key={index}
                  initial={{ opacity: 0, y: 60 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 + index * 0.2 }}
                  whileHover={{ rotate: 0, scale: 1.06 }}
                  className={`
                relative bg-gray-100/40 backdrop-blur-md rounded-3xl border-2 border-gray-200/50 hover:border-emerald-500 p-10 w-80 max-w-[90%] shadow-md hover:shadow-2xl transition-all duration-300
                ${index === 0 ? "rotate-[-4deg]" : ""}
                ${index === 1 ? "rotate-3 md:-mt-6 shadow-xl" : ""}
                ${index === 2 ? "-rotate-3" : ""}
              `}>

                  <div className='absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-100 border-2 border-emerald-500 text-emerald-500 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg'>
                    {item.icon}
                  </div>
                  <div className='pt-10 text-center'>
                    <span className='text-sm font-bold text-green-500 tracking-wider'>{item.step}</span>
                    <h3 className='text-xl font-bold mt-4 text-gray-800'>{item.title}</h3>
                    <p className='text-gray-600 mt-2'>{item.desc}</p>
                  </div>

                </motion.div>
              ))
            }
          </div>
          <div className='mb-32 relative'>
            <div className="sticky top-16 z-20 bg-gray-50/60 backdrop-blur-xl py-6 mb-10 rounded-2xl border-b border-white/10">
              <motion.h2
                variants={scrollReveal}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                className='text-4xl font-semibold text-center'>
                Advanced AI{" "}
                <span className='text-emerald-600'>Capabilities</span>
              </motion.h2>
            </div>
            <div className='grid md:grid-cols-2 gap-10'>
              {
                [
                  {
                    image: evalImg,
                    icon: <BsBarChart size={20} />,
                    title: "AI Answer Evaluation",
                    desc: "Scores communication, technical accuracy and confidence."
                  },
                  {
                    image: resumeImg,
                    icon: <BsFileEarmarkText size={20} />,
                    title: "Resume Based Interview",
                    desc: "Project-specific questions based on uploaded resume."
                  },
                  {
                    image: pdfImg,
                    icon: <BsFileEarmarkText size={20} />,
                    title: "Downloadable PDF Report",
                    desc: "Detailed strengths, weaknesses and improvement insights."
                  },
                  {
                    image: analyticsImg,
                    icon: <BsBarChart size={20} />,
                    title: "History & Analytics",
                    desc: "Track progress with performance graphs and topic analysis."
                  }
                ].map((item, index) => (
                  <SpotlightCard key={index} tilt={true}
                    variants={scrollReveal}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.01 }}
                    className='relative z-10 bg-gray-100/60 backdrop-blur-xl border border-gray-200/50 rounded-3xl p-8 shadow-glass hover:shadow-premium transition-all'>
                    <div className='flex flex-col md:flex-row items-center gap-8'>
                      <div className='w-full md:w-1/2 flex justify-center'>
                        <img src={item.image} alt={item.title} className='w-full h-auto object-contain max-h-64' />
                      </div>
                      <div className='w-full md:w-1/2'>
                        <div className='bg-emerald-100/50 border border-emerald-400/20 text-emerald-600 w-12 h-12 rounded-xl flex items-center justify-center mb-6 shadow-md'>
                          {item.icon}
                        </div>
                        <h3 className='font-semibold mb-3 text-xl'>{item.title}</h3>
                        <p className='text-gray-400 text-sm leading-relaxed'>{item.desc}</p>
                      </div>
                    </div>
                  </SpotlightCard>
                ))
              }
            </div>
          </div>

          <div className='mb-32 relative'>
            <div className="sticky top-16 z-20 bg-gray-50/60 backdrop-blur-xl py-6 mb-10 rounded-2xl border-b border-white/10">
              <motion.h2
                variants={scrollReveal}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                className='text-4xl font-semibold text-center'>
                Multiple Interview{" "}
                <span className='text-emerald-600'>Modes</span>
              </motion.h2>
            </div>
            <div className='grid md:grid-cols-2 gap-10'>
              {
                [
                  {
                    img: hrImg,
                    title: "HR Interview Mode",
                    desc: "Behavioral and communication based evaluation."
                  },
                  {
                    img: techImg,
                    title: "Technical Mode",
                    desc: "Deep technical questioning based on selected role."
                  },
                  {
                    img: confidenceImg,
                    title: "Confidence Detection",
                    desc: "Basic tone and voice analysis insights."
                  },
                  {
                    img: creditImg,
                    title: "Credits System",
                    desc: "Unlock premium interview sessions easily."
                  }
                ].map((mode, index) => (
                  <motion.div key={index}
                    variants={scrollReveal}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -4, scale: 1.01 }}
                    className='relative z-10 bg-gray-100/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-glass hover:shadow-premium transition-all'>
                    <div className='flex justify-between items-center gap-6'>
                      <div className='w-1/2'>
                        <h3 className='font-semibold text-xl mb-3'>
                          {mode.title}
                        </h3>
                        <p className='text-gray-500 text-sm leading-relaxed'>
                          {mode.desc}
                        </p>
                      </div>
                      <div className='w-1/2 flex justify-end'>
                        <img src={mode.img} alt={mode.title} className='w-28 h-28 object-contain' />
                      </div>
                    </div>
                  </motion.div>
                ))
              }
            </div>
          </div>
        </div>
        </div>
      </div>
      {showAuth && <AuthModel onClose={() => setShowAuth(false)} />}
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  )
}

export default Home 