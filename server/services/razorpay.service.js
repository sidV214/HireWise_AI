import dotenv from 'dotenv'
dotenv.config()
import Razorpay from 'razorpay'

const razorpay = new Razorpay({
    key_id:process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
})

export default razorpay

/*
|==========================================================================
| FILE: razorpay.service.js
| PURPOSE: Initializes and exports a singleton instance of the Razorpay SDK
|          for use in payment creation and verification flows.
|==========================================================================
|
| ROLE IN THE ARCHITECTURE
| ────────────────────────
| This file lives in the `server/services` layer. It acts as the configuration
| module for the third-party payment gateway. Controllers import this pre-configured
| instance rather than creating new ones on every request.
|
| IMPORTS & DEPENDENCIES
| ──────────────────────
| 1. `dotenv`: Loaded explicitly here to ensure environment variables are available, just in case this service is imported in a test script that bypasses `index.js`.
| 2. `razorpay`: The official Node.js SDK provided by Razorpay to interact with their API securely.
|
| FUNCTIONS & EXECUTION FLOW
| ──────────────────────────
| [razorpay instance]
| - STEP 1: Reads `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` from `process.env`.
| - STEP 2: Instantiates the `Razorpay` class with these credentials.
| - STEP 3: Exports the instance.
|
| CONNECTIONS (Dependency Map)
| ───────────
| EXPORTED TO: `server/controllers/payment.controller.js`
| EXTERNAL API: Razorpay Servers.
|
| DESIGN PATTERNS
| ───────────────
| - **Singleton Pattern**: By instantiating `new Razorpay(...)` once globally at the module level and exporting that instance, Node.js caches the evaluated module. All subsequent imports across the application use the exact same initialized object, saving memory and CPU cycles.
|
| INTERVIEW QUESTIONS
| ───────────────────
| Q1: Why is `dotenv.config()` called here when it's already called in `index.js`?
| A1: In the normal server flow, `index.js` loads `dotenv` first, making it redundant here. However, if a developer runs a standalone script (e.g., `node server/scripts/refunds.js`) that imports this service, `process.env` would be empty without this call. It's a defensive programming technique.
|
| Q2: What is the difference between `key_id` and `key_secret`?
| A2: `key_id` is a public identifier (often safe to expose to the frontend SDK). `key_secret` is the private cryptographic key used server-side to sign requests and verify webhooks/signatures. It must never leave the backend.
|
| Q3: Does instantiating `new Razorpay()` make a network request?
| A3: No. It simply creates an object with the base URL and credentials stored in memory. The network request only happens when methods like `razorpay.orders.create()` are invoked later in the controller.
|==========================================================================
*/