import crypto from 'crypto'
import razorpay from "../services/razorpay.service.js"
import Payment from '../models/Payment.model.js'
import User from '../models/User.model.js'


export const createOrder = async (req, res) => {
    try {
        const { planId, amount, credits } = req.body
        if (!amount || !credits) {
            return res.status(400).json({ messaage: "Invalid plan data!!!" })
        }

        const razorpayOrder = await razorpay.orders.create({
            amount: amount * 100, // converted to paise
            currency: "INR",
            receipt: `receipt_${Date.now()}`
        })

        const payment = await Payment.create({
            userId: req.userId,
            planId,
            amount,
            credits,
            razorpayOrderId: razorpayOrder.id,
            status: "created"
        })

        return res.json(razorpayOrder)


    } catch (error) {
        return res.status(500).json({ message: `Failed to create razorpay order: ${error}` })
    }
}

export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body.response || req.body

        if (!razorpay_order_id || !razorpay_payment_id) {
            return res.status(400).json({ message: "Missing payment details in request" })
        }

        const body = razorpay_order_id + "|" + razorpay_payment_id

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex")

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ message: `Invalid payment signature` })
        }

        const payment = await Payment.findOne({
            razorpayOrderId: razorpay_order_id
        })
        if (!payment) {
            return res.status(404).json({ message: `Payment not found` })
        }
        if (payment.status === "paid") {
            return res.json({ message: `Already processed` })
        }

        payment.status = "paid"
        payment.razorpayPaymentId = razorpay_payment_id
        await payment.save()

        const updatedUser = await User.findByIdAndUpdate(payment.userId, {
            $inc: { credits: payment.credits }
        }, { new: true })

        res.json({
            success: true,
            message: "Payment verified and credits added",
            user: updatedUser
        })

    } catch (error) {
        return res.status(500).json({ message: `Failed to verify Razorpay payment: ${error}` })
    }
}