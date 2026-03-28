import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ServerURL } from '../App'
import { FaArrowLeft } from 'react-icons/fa'

function InterviewHistory() {

    const [interviews, setInterviews] = useState([])
    const navigate = useNavigate()

    useEffect(() => {
        const getMyInterviews = async () => {
            try {
                const result = await axios.get(ServerURL + "/api/interview/get-interview", { withCredentials: true })
                console.log(result.data)
                setInterviews(result.data)
            } catch (error) {
                console.error(error)
            }
        }

        getMyInterviews()
    }, [])

    return (
        <div className='min-h-screen bg-linear-to-br from-gray-50 to-emerald-50 py-10'>
            <div className="w-[90vw] lg:w-[70vw] max-w-[90%] mx-auto">
                <div className="mb-10 w-full flex flex-wrap items-start gap-4">
                    <button
                        onClick={() => navigate("/")}
                        className='mt-1 p-3 rounded-full bg-gray-100 shadow hover:shadow-md transition'>
                        <FaArrowLeft className='text-gray-600' />
                    </button>
                    <div className="">
                        <h1 className="text-3xl font-bold flex-nowrap text-gray-800">Interview History</h1>
                        <p className="text-gray-500 mt-2">
                            Track your interviews and performance reports
                        </p>
                    </div>
                </div>

                {interviews.length === 0 ?
                    <div className='glass-panel p-10 rounded-2xl text-center'>
                        <p className="text-gray-400">
                            No interviews found. Start your first interview.
                        </p>
                    </div>
                    :
                    <div className='grid gap-6'>
                        {interviews.map((item, index) => (
                            <div
                                key={index}
                                onClick={() => navigate(`/report/${item._id}`)}
                                className="glass-panel p-6 rounded-2xl hover:shadow-xl transition-all duration-300 cursor-pointer">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800">
                                            {item.role}
                                        </h3>
                                        <p className="text-gray-500 text-sm mt-1">
                                            {item.experience} • {item.mode}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-2">
                                            {new Date(item.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-6">

                                        {/* Score */}
                                        <div className="text-right">
                                            <p className="text-xl font-bold text-emerald-600">
                                                {item.finalScore || 0}/10
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                Overall Score
                                            </p>
                                        </div>

                                        {/* Status Badge */}
                                        <span className={`px-4 py-1 rounded-full text-xs font-medium ${item.status === "Completed"
                                            ? "bg-emerald-100/50 text-emerald-600 border border-emerald-400/20"
                                            : "bg-yellow-900/40 text-yellow-500 border border-yellow-500/20"
                                            }`}>
                                            {item.status}
                                        </span>

                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                }
            </div>
        </div>
    )
}

export default InterviewHistory