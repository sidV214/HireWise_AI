import User from "../models/User.model.js"


export const getCurrentUser = async (req, res) => {
    try {
        const userId = req.userId
        const user = await User.findById(userId)
        if(!user){
            return res.status(404).json({message: "Couldn't find the user!!"})
        }
        return res.status(200).json(user)
    } catch (error) {
        return res.status(500).json({ message: `Failed to get the current user: ${error}` })
    }
}

/*
 * ===========================================================================================
 *                           NOTES — user.controller.js
 * ===========================================================================================
 *
 * PURPOSE: Retrieves the authenticated user's profile data from the database.
 *
 * ROLE IN ARCHITECTURE:
 * ---------------------
 * This file lives in the `server/controllers` layer. It handles the user profile domain.
 * It's the simplest controller in the application — a single read-only endpoint used by
 * the frontend to verify authentication state and fetch user metadata (name, email, credits)
 * on every page load.
 *
 * IMPORTS & DEPENDENCIES:
 * -----------------------
 * 1. `User` (from ../models/User.model.js): The Mongoose model for querying the `users`
 *    collection by ObjectId.
 *
 * FUNCTION-BY-FUNCTION ANALYSIS:
 * ------------------------------
 *
 * [getCurrentUser] — GET /api/user/current-user
 *   Parameters: req.userId (injected by the `isAuth` middleware from the JWT payload)
 *   Returns: JSON user document (name, email, credits, timestamps)
 *   Side Effects:
 *     - DB READ: `User.findById(userId)` — queries the users collection
 *   Flow:
 *     1. Reads `req.userId` (set by `isAuth` middleware after JWT verification).
 *     2. Queries MongoDB for a user document matching that ID.
 *     3. If no user is found (e.g., the user was deleted from the database but their
 *        token is still valid), returns a 404 error.
 *     4. Returns the full user document as JSON.
 *   Edge Cases:
 *     - If the JWT contains a userId for a deleted user, `findById` returns `null`,
 *       triggering the 404 response. This is important for handling account deletions.
 *     - If `req.userId` is undefined (middleware failure), `findById(undefined)` will
 *       throw a Mongoose CastError, caught by the catch block.
 *
 * CONNECTIONS (Dependency Map):
 * ----------------------------
 * CALLED BY: `server/routes/user.route.js` (GET /current-user)
 * CALLS OUT TO: `server/models/User.model.js` (User.findById)
 * INBOUND: Frontend App.jsx → useEffect → axios.get("/api/user/current-user")
 * OUTBOUND: Returns user data → dispatched to Redux store via `setUserData`
 *
 * DESIGN PATTERNS:
 * ----------------
 * - **Session Rehydration Pattern**: This endpoint is called on every page load (via
 *   `useEffect` in App.jsx) to rehydrate the frontend's Redux store with the current
 *   user data. Since JWTs are stateless and only contain the userId, the frontend must
 *   call the backend to fetch the full user profile (name, credits) on each refresh.
 * - **Guard Clause Pattern**: The `if(!user)` check returns early with a 404 before
 *   attempting to send a response with `null` data, preventing the frontend from
 *   crashing on `userData.name`.
 *
 * INTERVIEW QUESTIONS:
 * --------------------
 * Q1: Why not store user data directly in the JWT instead of making a DB call each time?
 * A1: JWTs are immutable once signed. If the user's credits change (e.g., after a purchase
 *     or interview), the JWT would contain stale data. By fetching from the DB, we always
 *     get the latest values. This is the trade-off of stateless auth: fast verification,
 *     but requires a DB call for fresh data.
 *
 * Q2: Could this endpoint be abused for user enumeration?
 * A2: No, because it only returns data for the currently authenticated user (identified
 *     by their JWT). An attacker cannot query other users' profiles since `req.userId` is
 *     extracted from the signed token, not from user input.
 *
 * Q3: Why doesn't this controller use `.select()` to restrict returned fields?
 * A3: The frontend needs all user fields (name, email, credits). Using `.select()` would
 *     only add complexity without benefit. If the schema grew to include sensitive fields
 *     (like password hashes), `.select('-password')` would become necessary.
 * ===========================================================================================
 */