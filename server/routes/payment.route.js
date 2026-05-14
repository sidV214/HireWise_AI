import express from 'express'
import isAuth from '../middlewares/isAuth.js'
import { createOrder, verifyPayment } from '../controllers/payment.controller.js'

const paymentRouter = express.Router()

paymentRouter.post("/order", isAuth, createOrder)
paymentRouter.post("/verify", isAuth, verifyPayment)

export default paymentRouter

/*
 * ===========================================================================================
 *                              NOTES — payment.route.js
 * ===========================================================================================
 *
 * PURPOSE: Defines the Express router for all payment-related endpoints (order creation
 *          and payment verification via Razorpay).
 *
 * ROLE IN ARCHITECTURE:
 * ---------------------
 * This file lives in the `server/routes` layer. It maps HTTP POST requests under the
 * `/api/payment` prefix to the corresponding controller functions. Both endpoints are
 * protected by the `isAuth` middleware, ensuring only authenticated users can initiate
 * or verify payments.
 *
 * IMPORTS & DEPENDENCIES:
 * -----------------------
 * 1. `express`: Used to create the Router instance.
 * 2. `isAuth`: JWT verification middleware (guards both routes).
 * 3. `createOrder, verifyPayment`: Controller functions from `payment.controller.js`.
 *
 * ENDPOINTS & DATA FLOW:
 * ----------------------
 * 1. POST `/order`
 *    - ROUTE: `POST /api/payment/order`
 *    - MIDDLEWARE: `isAuth`
 *    - PURPOSE: Creates a Razorpay order object on the server and returns it to the
 *      frontend, which uses the order ID to open the Razorpay checkout widget.
 *    - CONTROLLER: `createOrder`
 *
 * 2. POST `/verify`
 *    - ROUTE: `POST /api/payment/verify`
 *    - MIDDLEWARE: `isAuth`
 *    - PURPOSE: Receives the Razorpay callback data after checkout, verifies the
 *      cryptographic signature, and credits the user's account.
 *    - CONTROLLER: `verifyPayment`
 *
 * CONNECTIONS (Dependency Map):
 * ----------------------------
 * MOUNTED IN: `server/index.js` (as `app.use("/api/payment", paymentRouter)`)
 * DELEGATES TO: `server/controllers/payment.controller.js`
 *
 * DESIGN PATTERNS:
 * ----------------
 * - **Front Controller Pattern**: Routes only define the HTTP verb + path mapping.
 *   Zero business logic exists in this file — all logic is delegated to the controller.
 *
 * INTERVIEW QUESTIONS:
 * --------------------
 * Q1: Why are both payment endpoints POST instead of POST + GET?
 * A1: Both operations involve sending sensitive data (payment details, signatures) in
 *     the request body. GET requests don't have bodies and would expose this data in URL
 *     query strings, which are logged in server access logs and browser history.
 *
 * Q2: Should there be a webhook endpoint alongside the client-side verify?
 * A2: In production, Razorpay recommends a server-side webhook (POST) that Razorpay
 *     calls directly, independent of the client. This handles cases where the user closes
 *     the browser after payment but before the client-side verify call executes.
 * ===========================================================================================
 */