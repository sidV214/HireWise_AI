import React, { useState } from 'react'
import { motion } from 'motion/react'
import {
  FaUserTie,
  FaBriefcase,
  FaFileUpload,
  FaMicrophoneAlt,
  FaChartLine
} from 'react-icons/fa'
import axios from 'axios'
import { ServerURL } from '../App'
import { useDispatch, useSelector } from 'react-redux'
import { setUserData } from '../redux/userSlice'

function Step1SetUp({ onStart }) {
  const { userData } = useSelector((state) => state.user)
  const dispatch = useDispatch()
  const [role, setRole] = useState("")
  const [experience, setExperience] = useState("")
  const [mode, setMode] = useState("Technical")
  const [resumeFile, setResumeFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [projects, setProjects] = useState([])
  const [skills, setSkills] = useState([])
  const [resumeText, setResumeText] = useState("")
  const [analysisDone, setAnalysisDone] = useState(false)
  const [analysing, setAnalysing] = useState(false)

  const handleUploadResume = async () => {
    if (!resumeFile || analysing) return
    setAnalysing(true)
    const formData = new FormData()
    formData.append("resume", resumeFile)

    try {
      const result = await axios.post(ServerURL + "/api/interview/resume", formData, { withCredentials: true })
      console.log(result.data);
      setRole(result.data.role || "")
      setExperience(result.data.experience || "")
      setProjects(result.data.projects || [])
      setSkills(result.data.skills || [])
      setResumeText(result.data.resumeText || "")
      setAnalysisDone(true)
      setAnalysing(false)
    } catch (error) {
      console.log(error);
      setAnalysing(false)
    }
  }

  const handleStart = async (req, res) => {
    setLoading(true)
    try {
      const result = await axios.post(ServerURL + "/api/interview/generate-questions", { role, experience, mode, resumeText, projects, skills }, { withCredentials: true })

      console.log(result.data);

      if (userData) {
        dispatch(setUserData({ ...userData, credits: result.data.creditsLeft }))
      }

      setLoading(false)
      onStart(result.data)

    } catch (error) {
      console.log(error);
      setLoading(false)
      // Display the error message from the backend if it exists
      if (error.response && error.response.data && error.response.data.message) {
        alert(error.response.data.message);
      } else {
        alert("Failed to start the interview. Please try again.");
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className='min-h-screen flex items-center justify-center bg-gray-50 px-4' >
      <div className='w-full max-w-6xl bg-gray-100/30 backdrop-blur-xl border border-gray-200/50 rounded-3xl shadow-2xl grid md:grid-cols-2 overflow-hidden'>
        <motion.div
          initial={{ opacity: 0, x: -80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className='relative bg-emerald-900/10 border-r border-gray-200/30 p-12 flex-col justify-center'>
          <h2 className="text-4xl font-bold text-gray-800 mb-6">
            Start Your AI Interview
          </h2>
          <p className="text-gray-600 mb-10">
            Practical real interview scenarios powered by AI.
            Improve communication, technical skills and confidence.
          </p>
          <div className="space-y-5 ">
            {
              [
                {
                  icon: <FaUserTie className='text-emerald-600 text-xl' />,
                  text: "Choose Role & Experience"
                },
                {
                  icon: <FaMicrophoneAlt className='text-emerald-600 text-xl' />,
                  text: "Smart Voice Interview"
                },
                {
                  icon: <FaChartLine className='text-emerald-600 text-xl' />,
                  text: "Performance Analytics"
                }
              ].map((item, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 + index * 0.15 }}
                  whileHover={{ scale: 1.03 }}
                  key={index}
                  className="flex items-center space-x-4 bg-gray-100/50 border border-gray-200/50 p-4 rounded-xl shadow-sm cursor-pointer">
                  {item.icon}
                  <span className="text-gray-700 font-medium">{item.text}</span>
                </motion.div>
              ))
            }
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className='p-12 bg-gray-100/50'>
          <h2 className="text-3xl font-bold text-gray-800 mb-8">
            Interview Setup
          </h2>
          <div className="space-y-6">
            <div className="relative ">
              <FaUserTie className='absolute top-4 left-4 text-gray-400' />
              <input type="text" placeholder='Enter the role'
                className='w-full pl-12 pr-4 py-3 bg-transparent text-gray-800 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition'
                onChange={(e) => setRole(e.target.value)} value={role}
              />
            </div>
            <div className="relative ">
              <FaBriefcase className='absolute top-4 left-4 text-gray-400' />
              <input type="text" placeholder='Experience (e.g. 2 years)'
                className='w-full pl-12 pr-4 py-3 bg-transparent text-gray-800 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition'
                onChange={(e) => setExperience(e.target.value)} value={experience}

              />

            </div>
            <select value={mode}
              onChange={(e) => setMode(e.target.value)}
              className='w-full py-3 px-4 bg-transparent text-gray-800 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition'>
              <option value="Technical" className="bg-gray-100 text-gray-800">Technical Interview</option>
              <option value="HR" className="bg-gray-100 text-gray-800">HR Interview</option>
            </select>
            {!analysisDone && (
              <motion.div
                whileHover={{ scale: 1.02 }}
                onClick={() => document.getElementById("resumeUpload").click()}
                className='border-2 border-dashed border-gray-400 rounded-xl p-8 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-900/20 transition'>
                <FaFileUpload className='text-4xl mx-auto text-emerald-500 mb-3 ' />
                <input type="file" id='resumeUpload' accept='application/pdf'
                  className='hidden'
                  onChange={(e) => setResumeFile(e.target.files[0])}
                />
                <p className="text-gray-600 font-medium">
                  {resumeFile ? resumeFile.name : "Click to upload resume (Optional)"}
                </p>
                {resumeFile && (
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUploadResume()
                    }}
                    whileHover={{ scale: 1.02 }}
                    className='mt-4 bg-emerald-500 text-gray-900 px-5 py-2 rounded-lg hover:bg-emerald-400 font-medium transition shadow-md'>
                    {analysing ? "Analyzing..." : "Analyze Resume"}
                  </motion.button>
                )}
              </motion.div>
            )}

            {analysisDone && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className='bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4'>
                <h3 className="text-lg font-semibold text-gray-800 ">
                  Resume Analysis Result
                </h3>

                {projects.length > 0 && (
                  <div >
                    <p className="font-medium text-gray-700 mb-1">
                      Projects:
                    </p>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      {projects.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {skills.length > 0 && (
                  <div >
                    <p className="font-medium text-gray-700 mb-1">
                      Skills:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((s, i) => (
                        <span key={i} className='bg-emerald-100/50 border border-emerald-400/20 text-emerald-600 px-3 py-1 rounded-full text-sm'>{s}</span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            <motion.button
              onClick={handleStart}
              disabled={!role || !experience || loading}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              className='w-full disabled:bg-gray-200 disabled:text-gray-500 bg-emerald-500 hover:bg-emerald-400 text-gray-900 py-3 rounded-full text-lg font-semibold transition duration-300 shadow-md'>
              {loading ? "Starting..." : "Start Interview" }
            </motion.button>
          </div>

        </motion.div>
      </div>

    </motion.div>
  )
}

export default Step1SetUp