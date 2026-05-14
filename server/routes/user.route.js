import express from 'express'
import isAuth from '../middlewares/isAuth.js'
import { getCurrentUser } from '../controllers/user.controller.js'

const userRouter = express.Router()

userRouter.get("/current-user", isAuth, getCurrentUser)


export default userRouter

/*
 * ===========================================================================================
 *                              NOTES — user.route.js
 * ===========================================================================================
 *
 * PURPOSE: Defines the Express router for user profile-related endpoints.
 *
 * ROLE IN ARCHITECTURE:
 * ---------------------
 * This file lives in the `server/routes` layer. It handles requests under the `/api/user`
 * prefix. Currently, it has a single endpoint for fetching the authenticated user's profile,
 * which serves as the session rehydration mechanism for the frontend.
 *
 * IMPORTS & DEPENDENCIES:
 * -----------------------
 * 1. `express`: Used to create the Router instance.
 * 2. `isAuth`: JWT verification middleware (protects the current-user endpoint).
 * 3. `getCurrentUser`: Controller function from `user.controller.js`.
 *
 * ENDPOINTS & DATA FLOW:
 * ----------------------
 * 1. GET `/current-user`
 *    - ROUTE: `GET /api/user/current-user`
 *    - MIDDLEWARE: `isAuth`
 *    - PURPOSE: Returns the authenticated user's profile (name, email, credits).
 *      Called automatically by App.jsx on every page load to populate the Redux store.
 *    - CONTROLLER: `getCurrentUser`
 *
 * CONNECTIONS (Dependency Map):
 * ----------------------------
 * MOUNTED IN: `server/index.js` (as `app.use("/api/user", userRouter)`)
 * DELEGATES TO: `server/controllers/user.controller.js`
 *
 * DESIGN PATTERNS:
 * ----------------
 * - **Minimal Route Pattern**: A single endpoint file. As the application grows,
 *   additional user endpoints (update profile, delete account) can be added here
 *   without impacting other route modules.
 *
 * INTERVIEW QUESTIONS:
 * --------------------
 * Q1: Why is `/current-user` a GET request?
 * A1: It's a read-only operation that doesn't modify server state. GET is the semantically
 *     correct HTTP verb for retrieval operations. The user identity is derived from the
 *     JWT cookie (not from the URL or body), so no sensitive data is exposed.
 *
 * Q2: Why not combine user routes with auth routes?
 * A2: Separation of concerns. Auth routes handle session lifecycle (login/logout), while
 *     user routes handle profile data. As the app grows (e.g., adding profile editing,
 *     password changes, account deletion), keeping these domains separate prevents the
 *     route files from becoming monolithic.
 * ===========================================================================================
 */