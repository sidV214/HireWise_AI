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

/*
 * ===========================================================================================
 *                           NOTES — payment.controller.js
 * ===========================================================================================
 *
 * PURPOSE: Handles the complete Razorpay payment lifecycle — creating payment orders
 *          and verifying payments via cryptographic signature validation, then allocating
 *          purchased credits to the user's account.
 *
 * ROLE IN ARCHITECTURE:
 * ---------------------
 * This file lives in the `server/controllers` layer. It manages the monetization domain
 * of the application. It bridges three systems: the Razorpay payment gateway (external),
 * the Payment model (audit trail), and the User model (credit balance).
 *
 * IMPORTS & DEPENDENCIES:
 * -----------------------
 * 1. `crypto` (Node.js built-in): Used to create HMAC-SHA256 hashes for verifying
 *    Razorpay payment signatures — ensuring the payment was genuinely processed by
 *    Razorpay and not forged by a malicious actor.
 * 2. `razorpay` (from ../services/razorpay.service.js): The pre-configured Razorpay SDK
 *    singleton instance used to create orders on Razorpay's servers.
 * 3. `Payment` (from ../models/Payment.model.js): Mongoose model for the payments collection.
 *    Stores the audit trail of every transaction attempt.
 * 4. `User` (from ../models/User.model.js): Mongoose model used to atomically increment
 *    the user's credit balance after successful payment verification.
 *
 * FUNCTION-BY-FUNCTION ANALYSIS:
 * ------------------------------
 *
 * [createOrder] — POST /api/payment/order
 *   Parameters: req.body { planId, amount, credits }, req.userId (from isAuth)
 *   Returns: JSON Razorpay order object (contains order id, amount, currency)
 *   Side Effects:
 *     - EXTERNAL API: Creates an order on Razorpay's servers via `razorpay.orders.create()`
 *     - DB WRITE: Creates a Payment document with `status: "created"`
 *   Flow:
 *     1. Validates `amount` and `credits` are present.
 *     2. Calls `razorpay.orders.create()` with amount converted to paise (×100).
 *     3. Creates a local Payment record linking the user to the Razorpay order.
 *     4. Returns the Razorpay order object (the frontend needs `order.id` to open checkout).
 *   Edge Cases:
 *     - Amount is multiplied by 100 because Razorpay expects the smallest currency unit.
 *     - If Razorpay API is down, `razorpay.orders.create()` throws, caught by catch block.
 *
 * [verifyPayment] — POST /api/payment/verify
 *   Parameters: req.body { response: { razorpay_order_id, razorpay_payment_id, razorpay_signature } }
 *   Returns: JSON { success, message, user }
 *   Side Effects:
 *     - CRYPTO: Computes HMAC-SHA256 signature for verification
 *     - DB READ: Finds the Payment document by razorpayOrderId
 *     - DB WRITE: Updates Payment status to "paid", increments User credits
 *   Flow:
 *     1. Extracts Razorpay callback data from `req.body.response || req.body`.
 *     2. Concatenates `order_id + "|" + payment_id` to form the signing body.
 *     3. Computes the expected HMAC-SHA256 signature using `RAZORPAY_KEY_SECRET`.
 *     4. Compares the computed signature to the one sent by Razorpay.
 *     5. If signatures don't match → payment is invalid/forged → returns 400.
 *     6. Finds the corresponding Payment record by order ID.
 *     7. If already `"paid"`, returns early (idempotent protection).
 *     8. Updates Payment status to `"paid"` and stores the payment ID.
 *     9. Atomically increments the user's credits using MongoDB's `$inc` operator.
 *     10. Returns the updated user object.
 *   Edge Cases:
 *     - The `|| req.body` fallback handles different frontend payload structures.
 *     - Idempotent: calling verify twice for the same order won't double-credit.
 *     - `$inc: { credits: payment.credits }` is an atomic MongoDB operation,
 *       preventing race conditions from concurrent credit updates.
 *
 * CONNECTIONS (Dependency Map):
 * ----------------------------
 * CALLED BY: `server/routes/payment.route.js` (POST /order, POST /verify)
 * CALLS OUT TO:
 *   - Razorpay API (external) via `razorpay.orders.create()`
 *   - `server/models/Payment.model.js` (Payment.create, Payment.findOne)
 *   - `server/models/User.model.js` (User.findByIdAndUpdate with $inc)
 * INBOUND: Frontend Pricing.jsx → handlePayment → createOrder → Razorpay checkout → verifyPayment
 *
 * DESIGN PATTERNS:
 * ----------------
 * - **HMAC Signature Verification Pattern**: The server independently computes the expected
 *   hash and compares it to the hash sent by Razorpay. This cryptographic handshake ensures
 *   that the payment data hasn't been tampered with during transit. If an attacker tried to
 *   forge a "success" response, they would need the server's private key to compute a
 *   matching signature, which is impossible.
 * - **Idempotent Operation Pattern**: The `if (payment.status === "paid")` check ensures
 *   that re-processing the same payment webhook doesn't add credits twice. This is critical
 *   for payment systems where duplicate webhook delivery is common.
 * - **Atomic Update Pattern**: Using `$inc` instead of read-modify-write prevents concurrent
 *   requests from overwriting each other's credit changes.
 *
 * INTERVIEW QUESTIONS:
 * --------------------
 * Q1: Why is the amount multiplied by 100 when creating a Razorpay order?
 * A1: Razorpay's API requires amounts in the smallest currency unit to avoid floating-point
 *     precision issues. For INR, ₹100 becomes 10000 paise. For USD, $10 becomes 1000 cents.
 *     This is an industry-standard practice across payment gateways (Stripe, PayPal, etc.).
 *
 * Q2: What would happen if we used `user.credits += payment.credits; user.save()` instead of `$inc`?
 * A2: Race condition. If two payments complete simultaneously, both would read the same
 *     initial credit value, add their credits independently, and save — causing one
 *     payment's credits to be overwritten. `$inc` is atomic at the database level.
 *
 * Q3: How does the HMAC signature verification prevent fraud?
 * A3: An attacker could modify the Razorpay callback to claim a successful payment for
 *     a different order. The HMAC hash is computed using the server's private
 *     `RAZORPAY_KEY_SECRET`, which only the server and Razorpay know. Without this key,
 *     an attacker cannot produce a valid signature for a modified payload.
 *
 * Q4: Why use `req.body.response || req.body` for destructuring?
 * A4: The Razorpay checkout handler wraps the callback data inside a `response` key.
 *     However, if a webhook is used instead, the data may come at the root level. The
 *     fallback ensures both payload shapes are handled.
 *
 * Q5: What is a `receipt` in the Razorpay order creation?
 * A5: The receipt is a merchant-defined unique string (here: `receipt_${Date.now()}`)
 *     used for reconciliation. Razorpay stores it alongside the order and includes it
 *     in dashboard exports, making it easy to match Razorpay records to internal records.
 * ===========================================================================================
 */