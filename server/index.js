import express from "express";
import dotenv from "dotenv"
import connectDB from "./config/connectDB.js";
import cookieParser from "cookie-parser";
dotenv.config()
import cors from "cors"
import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";
import interviewRouter from "./routes/interview.route.js";
import paymentRouter from "./routes/payment.route.js";

const app = express();
app.use(cors({
    origin: ["http://localhost:5173", "https://hirewiseai-a4pn.onrender.com"],
    credentials: true
}))


app.use(express.json())
app.use(cookieParser())

app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)
app.use("/api/interview", interviewRouter)
app.use("/api/payment", paymentRouter)

const PORT = process.env.PORT || 6000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
    connectDB()
}) 

/*
|==========================================================================
| FILE: index.js
| PURPOSE: Bootstraps the Express server, configures global middleware, 
|          and mounts all application route handlers.
|==========================================================================
|
| ROLE IN THE ARCHITECTURE
| ────────────────────────
| This is the main entry point for the backend server (`server/`). It sits at
| the topmost layer of the application structure. Every HTTP request made by
| the frontend client passes through this file before being routed to specific
| module controllers.
|
| IMPORTS & DEPENDENCIES
| ──────────────────────
| 1. `express`: The core web framework used to create the server and handle routing.
| 2. `dotenv`: Used to load environment variables (like PORT, MONGODB_URI) into `process.env`.
| 3. `connectDB`: A custom utility imported from `./config/connectDB.js` to establish the Mongoose connection to MongoDB.
| 4. `cookie-parser`: Middleware to parse `Cookie` header and populate `req.cookies` with an object keyed by the cookie names. This is critical for JWT-based auth reading.
| 5. `cors`: Middleware to enable Cross-Origin Resource Sharing, allowing the React frontend (running on different ports/domains) to make requests to this API.
| 6. `authRouter, userRouter, interviewRouter, paymentRouter`: The modular route definitions that map specific URL prefixes to their respective controller logic.
|
| FUNCTIONS & EXECUTION FLOW
| ──────────────────────────
| [Global Server Setup]
| - STEP 1: Express app instance is created (`const app = express()`).
| - STEP 2: CORS middleware is configured to accept requests ONLY from localhost:5173 (dev) and the Render domain (prod). `credentials: true` ensures cookies (JWTs) can be sent cross-origin.
| - STEP 3: Body parsers (`express.json()`) and cookie parsers (`cookieParser()`) are mounted globally.
| - STEP 4: API routes are mounted to their specific prefixes (e.g., `/api/auth` -> `authRouter`).
| - STEP 5: Server listens on the designated `PORT`. Once listening, the `connectDB()` function is triggered to connect to MongoDB.
|
| CONNECTIONS (Dependency Map)
| ───────────
| FRONTEND: Receives HTTP requests from the React client.
| DATABASE: Connects to MongoDB via `connectDB`.
| ROUTES: Delegates to `auth.route.js`, `user.route.js`, `interview.route.js`, `payment.route.js`.
|
| DESIGN PATTERNS
| ───────────────
| - **Modular Routing Pattern**: By delegating routes to external router files using `app.use('/api/...', router)`, the codebase avoids becoming a massive monolithic file, ensuring separation of concerns.
| - **Middleware Chain Pattern**: The sequential application of `cors`, `json`, and `cookieParser` guarantees that by the time a request reaches a route handler, the payload and credentials are fully parsed and ready for use.
|
| INTERVIEW QUESTIONS
| ───────────────────
| Q1: Why is `dotenv.config()` called so early in the file?
| A1: It must be invoked before any other file (like `connectDB`) tries to read `process.env`. If a route or config file was imported and executed before `dotenv.config()`, the environment variables would be `undefined`.
|
| Q2: What happens if `credentials: true` is missing from the CORS config?
| A2: The frontend React app would not be able to send the JWT `token` cookie along with its HTTP requests, causing every protected API call (like fetching the user profile or history) to fail with a 401 Unauthorized error.
|
| Q3: Why is `connectDB()` called inside the `app.listen` callback instead of at the top level?
| A3: Calling it inside the listen callback ensures that we don't attempt to connect to the database until the HTTP server has successfully bound to the port. This prevents the DB connection from hanging indefinitely if the port is blocked.
|
| Q4: What is the purpose of `express.json()`?
| A4: It's a built-in middleware that parses incoming requests with JSON payloads (Content-Type: application/json) and makes the parsed data available on `req.body`. Without it, `req.body` would be undefined in the POST/PUT controllers.
|
| Q5: Why do we use `cookie-parser` instead of just reading `req.headers.cookie`?
| A5: `req.headers.cookie` returns a raw string (e.g., `token=123; user=abc`). `cookie-parser` automatically parses this string into a convenient JS object (`req.cookies.token`), saving us from writing custom string splitting logic in every middleware.
|==========================================================================
*/
