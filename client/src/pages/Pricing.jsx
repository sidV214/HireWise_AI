import React, { useState } from 'react'
import { FaArrowLeft, FaCheckCircle } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { pageTransition, staggerContainer, cardEntry, buttonTap } from '../utils/motion'
import axios from 'axios'
import { ServerURL } from '../App'
import { useDispatch } from 'react-redux'
import { setUserData } from '../redux/userSlice'
import SpotlightCard from '../components/SpotlightCard'
import MagneticButton from '../components/MagneticButton'


function Pricing() {

    const navigate = useNavigate()
    const [selectedPlan, setSelectedPlan] = useState("free")
    const [loadingPlan, setLoadingPlan] = useState(null)
    const [paymentSuccess, setPaymentSuccess] = useState(false)
    const dispatch = useDispatch()

    const plans = [
        {
            id: "free",
            name: "Free",
            price: "₹0",
            credits: 100,
            description: "Perfect for beginners starting interview preparation.",
            features: [
                "100 AI Interview Credits",
                "Basic Performance Report",
                "Voice Interview Access",
                "Limited History Tracking"
            ],
            default: true
        },
        {
            id: "basic",
            name: "Starter Pack",
            price: "₹100",
            credits: 150,
            description: "Great for focused practice and skill improvement.",
            features: [
                "150 AI Interview Credits",
                "Detailed Feedback",
                "Performance Analytics",
                "Full Interview History"
            ],
        },
        {
            id: "pro",
            name: "Pro Pack",
            price: "₹500",
            credits: 650,
            description: "Best value for serious job preparation.",
            features: [
                "650 AI Interview Credits",
                "Advanced AI Feedback",
                "Skill Trend Analysis",
                "Priority AI Processing"
            ],
            badge: "Best Value"
        },
    ]

    const handlePayment = async (plan) => {
        try {
            setLoadingPlan(plan.id)

            const amount = plan.id === "basic" ? 100 : plan.id === "pro" ? 500 : 0

            const result = await axios.post(ServerURL + "/api/payment/order", {
                planId: plan.id,
                amount: amount,
                credits: plan.credits
            }, { withCredentials: true })
            console.log(result.data)

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: result.data.amount,
                currency: "INR",
                name: "HireWiseAI",
                description: `${plan.name} - ${plan.credits} Credits`,
                order_id: result.data.id,

                handler: async function (response) {
                    try {
                        const verifyPay = await axios.post(ServerURL + "/api/payment/verify", {
                            response
                        }, { withCredentials: true })
                        dispatch(setUserData(verifyPay.data.user))
                        
                        setPaymentSuccess(true)
                        setTimeout(() => {
                            navigate("/")
                        }, 3000)

                    } catch (verifyError) {
                        console.error("Verification error:", verifyError)
                        alert("Payment verification failed. Please contact support.")
                    }
                },
                theme: { color: "#10b981" },
            }

            const rzp = new window.Razorpay(options)
            rzp.open()
            setLoadingPlan(null)
        } catch (error) {
            console.log(error)
            setLoadingPlan(null)
        }
    }

    if (paymentSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-emerald-50">
                <motion.div 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="bg-gray-100 p-10 rounded-3xl shadow-2xl flex flex-col items-center text-center max-w-sm sm:max-w-md w-full"
                >
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6"
                    >
                        <FaCheckCircle className="text-emerald-500 text-6xl" />
                    </motion.div>
                    <motion.h2 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-3xl font-bold text-gray-800 mb-3"
                    >
                        Payment Successful!
                    </motion.h2>
                    <motion.p 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-gray-500 mb-8"
                    >
                        Your credits have been added successfully. You are now ready to crush your AI interviews!
                    </motion.p>
                    <div className="w-full relative overflow-hidden rounded-full">
                        <motion.div 
                            initial={{ x: "-100%" }}
                            animate={{ x: "0%" }}
                            transition={{ delay: 0.6, duration: 2.3, ease: "linear" }}
                            className="h-1.5 bg-emerald-500 w-full"
                        />
                    </div>
                    <p className="text-xs text-gray-400 mt-4 animate-pulse">Redirecting to Dashboard...</p>
                </motion.div>
            </div>
        )
    }

    return (
        <motion.div 
            variants={pageTransition}
            initial="initial"
            animate="animate"
            exit="exit"
            className='min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 py-16 px-6'
        >
            <div className='max-w-6xl mx-auto mb-14 flex items-center gap-4'>
                <button className="mt-2 p-3 rounded-full bg-gray-100 shadow hover:shadow-md transition">
                    <FaArrowLeft
                        onClick={() => navigate("/")}
                        className='text-gray-600' />
                </button>
                <div className="text-center w-full">
                    <h1 className="text-4xl font-bold text-gray-800">Choose Your Plan</h1>
                    <p className="text-gray-500 mt-3 text-lg">Flexible pricing to match your interview preparation goals.</p>
                </div>
            </div>

            <motion.div 
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
            >
                {plans.map((plan) => {
                    const isSelected = selectedPlan === plan.id
                    return (
                        <SpotlightCard
                            key={plan.id} tilt={true}
                            variants={cardEntry}
                            whileHover={!plan.default && { scale: 1.03 }}
                            onClick={() => !plan.default && setSelectedPlan(plan.id)}
                            className={`relative rounded-3xl p-8 transition-all duration-300 border
                            ${isSelected
                                    ? "border-emerald-500 shadow-premium bg-gray-100/80 backdrop-blur-xl"
                                    : "border-white/10 bg-gray-100/40 backdrop-blur-md shadow-glass hover:shadow-premium"
                                }
                            ${plan.default ? "cursor-default" : "cursor-pointer"}
                            `}>

                            {/* Badge */}
                            {plan.badge && (
                                <div className="absolute top-6 right-6 bg-emerald-600 text-white text-xs px-4 py-1 rounded-full shadow">
                                    {plan.badge}
                                </div>
                            )}

                            {/* Default Tag */}
                            {plan.default && (
                                <div className="absolute top-6 right-6 bg-gray-200 text-gray-700 text-xs px-3 py-1 rounded-full ">
                                    Default
                                </div>
                            )}

                            {/* Plan Name */}
                            <h3 className="text-xl font-semibold text-gray-800">
                                {plan.name}
                            </h3>

                            {/* Price */}
                            <div className="mt-4">
                                <span className="text-3xl font-bold text-emerald-600">
                                    {plan.price}
                                </span>
                                <p className="text-gray-500 mt-1">
                                    {plan.credits} Credits
                                </p>
                            </div>

                            {/* Description */}
                            <p className="text-gray-500 mt-4 text-sm leading-relaxed">
                                {plan.description}
                            </p>

                            {/* Features */}
                            <div className="mt-6 space-y-3 text-left">
                                {plan.features.map((feature, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <FaCheckCircle className='text-emerald-500 text-sm' />
                                        <span className="text-gray-700 text-sm">
                                            {feature}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            {!plan.default && (
                                <MagneticButton
                                    disabled={loadingPlan == plan.id}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        if (!isSelected) {
                                            setSelectedPlan(plan.id)
                                        } else {
                                            handlePayment(plan)
                                        }
                                    }

                                    }
                                    className={`w-full mt-8 py-3 rounded-xl font-medium transition 
                                        ${isSelected
                                            ? "bg-emerald-500 text-gray-900 shadow-md hover:opacity-90"
                                            : "bg-gray-100/50 border border-white/10 text-gray-300 hover:bg-gray-200/50 shadow-sm"
                                        }`}>
                                    {loadingPlan === plan.id
                                        ? "Processing"
                                        : isSelected
                                            ? "Proceed to Pay"
                                            : "Select Plan"
                                    }
                                </MagneticButton>
                            )}
                        </SpotlightCard>
                    )
                })}
            </motion.div>
        </motion.div>
    )
}

export default Pricing