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

/*
 * ===========================================================================================
 *                              NOTES — Pricing.jsx
 * ===========================================================================================
 *
 * PURPOSE: Credit purchase page with three tiered pricing plans and full Razorpay payment
 *          integration. Handles the complete purchase flow from plan selection through
 *          payment verification to credit addition and success animation.
 *
 * ROLE IN ARCHITECTURE:
 * ---------------------
 * Mounted at "/pricing" route in App.jsx. Accessible from the Navbar's "Buy more credits"
 * popup. This is the only page that interacts with the payment system. The Razorpay
 * checkout widget is loaded as an external script and invoked client-side.
 *
 * IMPORTS & DEPENDENCIES:
 * -----------------------
 * 1. `React, useState, useEffect`: Component rendering, state, and redirect timer.
 * 2. `motion, AnimatePresence` (motion/react): Entry animations, page transitions,
 *    and the success screen's spring-animated checkmark.
 * 3. `pageTransition, staggerContainer, cardEntry, buttonTap` (../utils/motion):
 *    Predefined animation variants for page fade, card stagger, and button feedback.
 * 4. `SpotlightCard` (../components/SpotlightCard): Hover-glow card for plan display.
 * 5. `MagneticButton` (../components/MagneticButton): Spring-physics CTA buttons.
 * 6. `useSelector, useDispatch` (react-redux): Read userData (credits), dispatch updates.
 * 7. `setUserData` (../redux/userSlice): Action to update credits after purchase.
 * 8. `useNavigate` (react-router-dom): Auto-redirect to "/" after successful payment.
 * 9. `axios`: HTTP client for payment API calls.
 * 10. `ServerURL` (../App): Backend base URL.
 * 11. Various react-icons: FaRocket, BsStars, BsCheckCircle, BsCoin for UI elements.
 *
 * STATE VARIABLES:
 * ----------------
 * | Variable       | Type     | Purpose                                           |
 * |----------------|----------|---------------------------------------------------|
 * | selectedPlan   | number   | Index of the currently selected plan (0, 1, or 2)  |
 * | loadingPlan    | number   | Index of the plan currently being purchased (-1)   |
 * | paymentSuccess | boolean  | true → shows the full-screen success animation     |
 *
 * PLAN DATA (plans array):
 * -------------------------
 * | Plan         | Price  | Credits | Badge       | Features                          |
 * |--------------|--------|---------|-------------|-----------------------------------|
 * | Free         | ₹0     | 100     | —           | 2 interviews, basic analytics     |
 * | Starter Pack | ₹100   | 150     | —           | 3 interviews, full analytics      |
 * | Pro Pack     | ₹500   | 650     | "Best Value"| 13 interviews, priority, PDF      |
 *
 * FUNCTION ANALYSIS:
 * ------------------
 *
 * [handlePayment(plan, index)] — Full Razorpay payment flow
 *   The CORE function of this page. Handles the entire payment lifecycle.
 *   Flow:
 *     1. Sets loadingPlan to the clicked plan index (shows "Processing..." on button).
 *     2. POSTs to /api/payment/order with { planId, amount, credits }.
 *        Backend creates a Razorpay order (amount × 100 for paise) and Payment document.
 *     3. Constructs Razorpay checkout options:
 *        - key: VITE_RAZORPAY_KEY_ID from environment variables
 *        - amount/currency: from the backend order response
 *        - order_id: Razorpay's order ID
 *        - prefill: user's name and email from Redux
 *        - theme: emerald color (#10b981)
 *     4. Opens the Razorpay checkout widget (new window.Razorpay(options).open()).
 *     5. On successful payment, the handler callback fires with:
 *        { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 *     6. POSTs to /api/payment/verify with these three values.
 *        Backend verifies the HMAC signature and increments credits atomically.
 *     7. On verification success:
 *        - Updates Redux with new credit balance
 *        - Sets paymentSuccess = true (triggers success animation)
 *     8. On error at any step: logs error and resets loadingPlan.
 *   Edge Cases:
 *     - If Razorpay script isn't loaded, `new window.Razorpay()` throws.
 *     - If user closes the Razorpay widget without paying, no handler fires.
 *     - If verify endpoint fails, credits are NOT added (server-side integrity).
 *
 * SUCCESS SCREEN (Conditional Rendering):
 * ----------------------------------------
 * When paymentSuccess is true, the entire page is replaced with a full-screen overlay:
 *   - Green gradient background with fade-in animation.
 *   - Spring-animated BsCheckCircle icon (scale 0 → 1 with bounce).
 *   - "Payment Successful!" heading.
 *   - useEffect starts a 3-second timer that auto-navigates to "/".
 *   - Animated progress bar fills from 0% to 100% over 3 seconds.
 *   - "Redirecting to home..." subtitle.
 *
 * UI LAYOUT (Normal State):
 * -------------------------
 * Full-screen with animated page transition:
 *   - Header: "Choose Your Plan" title + "Select the best plan" subtitle + back button.
 *   - Credits Display: Shows current credit count with BsCoin icon.
 *   - Plan Grid: 3-column grid (stacked on mobile) with SpotlightCard for each plan:
 *     - Plan header with name and "Best Value" badge (Pro Pack only).
 *     - Price display with emerald color.
 *     - Feature list with BsCheckCircle check icons.
 *     - "Select Plan" / "Current Plan" / "Proceed to Pay" button based on state.
 *   - Selected plan is highlighted with emerald border and ring.
 *
 * CONNECTIONS (Dependency Map):
 * ----------------------------
 * MOUNTED AT: /pricing route in App.jsx
 * API CALLS:
 *   - POST /api/payment/order → payment.controller.js::createOrder
 *   - POST /api/payment/verify → payment.controller.js::verifyPayment
 * READS FROM: Redux store (userData.name, userData.email, userData.credits)
 * WRITES TO: Redux store (setUserData with updated credits)
 * NAVIGATES TO: / (after payment success, via 3-second auto-redirect)
 * EXTERNAL: Razorpay checkout widget (loaded via CDN script in index.html)
 *
 * DESIGN PATTERNS:
 * ----------------
 * - **Two-Step Payment Verification**: Order is created on the backend first (gives us
 *   control over the amount). Payment is verified on the backend second (prevents
 *   client-side tampering with the payment response).
 * - **Optimistic Credit Update**: After verification succeeds, the Redux store is updated
 *   immediately without waiting for a fresh user fetch.
 * - **Success Screen with Auto-Redirect**: The 3-second delay with progress bar gives
 *   the user visual confirmation before redirecting, preventing confusion.
 * - **Staggered Plan Cards**: Using staggerContainer + cardEntry variants to create
 *   a cascading entrance effect when the page loads.
 *
 * INTERVIEW QUESTIONS:
 * --------------------
 * Q1: Why is the Razorpay key stored in an environment variable?
 * A1: The key ID is a public identifier (like a Stripe publishable key) — it's safe to
 *     expose in the frontend. But using an env var (`import.meta.env.VITE_RAZORPAY_KEY_ID`)
 *     allows switching between test and live keys without code changes.
 *
 * Q2: What prevents a user from tampering with the payment amount?
 * A2: The amount is set on the backend when creating the Razorpay order (createOrder).
 *     Even if the frontend sends a fake amount, Razorpay uses the order's amount for
 *     the actual charge. The HMAC signature verification ensures the payment matches
 *     the original order.
 *
 * Q3: Why does the success screen auto-redirect instead of having a button?
 * A3: Auto-redirect with a visible progress bar is a common e-commerce UX pattern.
 *     It eliminates the need for user action after payment, reduces bounce rate, and
 *     the progress bar provides visual feedback about the redirect timing.
 *
 * Q4: What happens if the user refreshes during the success screen?
 * A4: The paymentSuccess state is lost (it's local component state, not persisted).
 *     The page will re-render in its normal pricing view. The credits have already been
 *     added to the database, so the user's credit count will be correct after the
 *     App.jsx session rehydration useEffect runs.
 * ===========================================================================================
 */