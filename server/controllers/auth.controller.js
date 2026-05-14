import generateToken from "../config/token.js"
import User from "../models/User.model.js"

export const googleAuth = async (req, res) => {
    try {
        const { name, email } = req.body
        let user = await User.findOne({ email })
        if (!user) {
            user = await User.create({
                name,
                email
            })
        }
        let token = await generateToken(user._id)
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 100 * 365 * 24 * 60 * 60 * 1000 // Lasts until explicitly logged out (100 years)
        })

        return res.status(200).json(user)

    } catch (error) {
        return res.status(500).json({ message: `Google Auth error: ${error}` })
    }
}

export const logOut = async (req, res) => {
    try {
        await res.clearCookie("token")
        return res.status(200).json({ message: "Logged out successfully!!" })
    } catch (error) {
        return res.status(500).json({ message: `Error while logging out: ${error}` })
    }
}

/*
 * ===========================================================================================
 *                              NOTES — auth.controller.js
 * ===========================================================================================
 *
 * PURPOSE: Handles user authentication via Google OAuth (login/signup) and session
 *          termination (logout) using JWT cookies.
 *
 * ROLE IN ARCHITECTURE:
 * ---------------------
 * This file lives in the `server/controllers` layer. It contains the business logic for
 * the authentication domain. When a request reaches `/api/auth/*`, the route file
 * (`auth.route.js`) delegates to the exported functions here. This controller interacts
 * with the `User` model (data layer) and the `generateToken` utility (config layer).
 *
 * IMPORTS & DEPENDENCIES:
 * -----------------------
 * 1. `generateToken` (from ../config/token.js): Utility that creates a signed JWT containing
 *    the user's MongoDB ObjectId. Used to issue session tokens upon successful login.
 * 2. `User` (from ../models/User.model.js): The Mongoose model for the `users` collection.
 *    Used to find existing users by email or create new ones during first-time Google login.
 *
 * FUNCTION-BY-FUNCTION ANALYSIS:
 * ------------------------------
 *
 * [googleAuth] — POST /api/auth/google-auth
 *   Parameters: req.body.name (String), req.body.email (String)
 *   Returns: JSON user object with 200 status + sets `token` cookie
 *   Side Effects:
 *     - DB READ: `User.findOne({ email })` — checks if user already exists
 *     - DB WRITE: `User.create({ name, email })` — creates new user if not found
 *     - COOKIE SET: Sets `token` cookie with httpOnly, secure, sameSite:"none"
 *   Flow:
 *     1. Destructures `name` and `email` from the request body (sent by the frontend
 *        after Firebase Google OAuth popup completes).
 *     2. Queries the database for an existing user with that email.
 *     3. If no user exists, creates a new document (auto-assigns 100 default credits).
 *     4. Generates a JWT token embedding the user's `_id`.
 *     5. Sets the token as an httpOnly cookie with a 100-year maxAge (effectively permanent
 *        until explicit logout).
 *     6. Returns the full user document as JSON.
 *   Edge Cases:
 *     - If `name` or `email` are missing, Mongoose validation will throw, caught by the
 *       catch block which returns a 500 error.
 *     - The `maxAge: 100 * 365 * 24 * 60 * 60 * 1000` creates a near-permanent session.
 *       This is a design choice: the user stays logged in until they explicitly log out.
 *
 * [logOut] — GET /api/auth/logout
 *   Parameters: None (uses cookies)
 *   Returns: JSON success message with 200 status
 *   Side Effects:
 *     - COOKIE CLEAR: `res.clearCookie("token")` removes the JWT cookie from the browser.
 *   Flow:
 *     1. Calls `res.clearCookie("token")` to instruct the browser to delete the cookie.
 *     2. Returns a success message.
 *   Edge Cases:
 *     - `clearCookie` is synchronous in Express, so the `await` is unnecessary but harmless.
 *     - If no cookie named "token" exists, `clearCookie` silently does nothing (no error).
 *
 * CONNECTIONS (Dependency Map):
 * ----------------------------
 * CALLED BY: `server/routes/auth.route.js`
 * CALLS OUT TO:
 *   - `server/models/User.model.js` (User.findOne, User.create)
 *   - `server/config/token.js` (generateToken)
 * INBOUND: Frontend Auth.jsx → Firebase popup → POST /api/auth/google-auth
 * OUTBOUND: Returns user data to Redux store via frontend dispatch
 *
 * DESIGN PATTERNS:
 * ----------------
 * - **Upsert Pattern (Find-or-Create)**: Instead of separate registration and login
 *   endpoints, `googleAuth` combines both into a single handler. It first attempts to find
 *   the user, and if not found, creates one. This simplifies the frontend to a single
 *   API call regardless of whether the user is new or returning.
 * - **Cookie-Based Session Pattern**: By setting an httpOnly cookie, the server ensures
 *   the JWT is automatically sent with every subsequent request by the browser. This is
 *   more secure than storing tokens in localStorage (which is vulnerable to XSS).
 *
 * INTERVIEW QUESTIONS:
 * --------------------
 * Q1: Why use `sameSite: "none"` in the cookie options?
 * A1: Because the frontend (on localhost:5173 or a Vercel domain) and the backend
 *     (on Render) are on different origins. Without `sameSite: "none"`, the browser would
 *     block the cookie from being sent cross-origin. `secure: true` is required alongside
 *     it to enforce HTTPS.
 *
 * Q2: What security risk does a 100-year `maxAge` introduce?
 * A2: If a JWT is stolen (e.g., via a man-in-the-middle attack on an insecure network),
 *     the attacker has indefinite access. A shorter expiry (e.g., 7 days) with a refresh
 *     token mechanism would limit the damage window. The current design trades security
 *     for convenience.
 *
 * Q3: Why does the frontend send `name` and `email` instead of the Google ID token?
 * A3: The frontend handles Google OAuth entirely via Firebase SDK (client-side).
 *     Firebase verifies the Google token and provides the user's profile. The backend
 *     trusts the frontend to send the correct data. In a stricter setup, the backend
 *     should verify the Google ID token server-side using Google's `oauth2` library.
 *
 * Q4: What happens if two requests for the same new email arrive simultaneously?
 * A4: Because `email` has a `unique: true` index in the User schema, the second
 *     `User.create()` call would throw a MongoDB Duplicate Key Error (code 11000).
 *     The catch block would return a 500 error to the second request.
 *
 * Q5: Why isn't `isAuth` middleware applied to the `googleAuth` endpoint?
 * A5: The user is unauthenticated at this point — they're trying to log in. Applying
 *     `isAuth` would require a valid JWT before the user can obtain one, creating a
 *     chicken-and-egg problem.
 * ===========================================================================================
 */