import jwt from 'jsonwebtoken'


const isAuth = async (req, res, next) => {
    try {
        let { token } = req.cookies
        if (!token) {
            return res.status(400).json({ message: "User does not have a token OR User is not authenticated!!!" })
        }
        const verifyToken = jwt.verify(token, process.env.JWT_SECRET_KEY)
        if (!verifyToken) {
            return res.status(400).json({ message: "User does not have a valid token!!!" })
        }
        req.userId = verifyToken.userId
        next()
    } catch (error) {
        return res.status(500).json({ message: `isAuth error ${error}` })
    }
}

export default isAuth

/*
|==========================================================================
| FILE: isAuth.js
| PURPOSE: Express middleware that guards protected routes by verifying the
|          JSON Web Token (JWT) sent via cookies.
|==========================================================================
|
| ROLE IN THE ARCHITECTURE
| ────────────────────────
| This file lives in the `server/middlewares` layer. It acts as the gatekeeper
| for the API. Any route wrapped with `isAuth` will reject unauthenticated
| requests before they ever reach the controller logic.
|
| IMPORTS & DEPENDENCIES
| ──────────────────────
| 1. `jsonwebtoken` (jwt): Used to decrypt and verify the signature of the token cookie.
|
| FUNCTIONS & EXECUTION FLOW
| ──────────────────────────
| [isAuth] - Asynchronous Middleware Function
| - PARAMETERS: `req` (Request), `res` (Response), `next` (Next function in the chain).
| - STEP 1: Extracts the `token` variable from `req.cookies` (made possible by `cookie-parser` in `index.js`).
| - STEP 2: If no token is found, returns an immediate 400 response, halting the request.
| - STEP 3: Calls `jwt.verify(token, process.env.JWT_SECRET_KEY)`. This cryptographically checks if the token was signed by this server and hasn't been altered.
| - STEP 4: If verification fails (e.g., token expired or manipulated), returns a 400 response.
| - STEP 5: If successful, it extracts the `userId` from the decoded token payload and attaches it to the request object (`req.userId = verifyToken.userId`).
| - STEP 6: Calls `next()` to pass control to the actual route controller.
| - EDGE CASE (Catch Block): If `jwt.verify` throws an exception (which it does for invalid signatures), it catches it and returns a 500 status code.
|
| CONNECTIONS (Dependency Map)
| ───────────
| CALLED BY: Route definitions in `user.route.js`, `interview.route.js`, `payment.route.js`.
| CALLS OUT TO: The next controller in the Express middleware chain.
|
| DESIGN PATTERNS
| ───────────────
| - **Decorator/Interceptor Pattern**: Middleware intercepts the request, augments it (by adding `req.userId`), and passes it along. This decouples authentication logic from business logic, adhering to the Single Responsibility Principle.
| - **Stateless Session Pattern**: By extracting the identity (`userId`) mathematically from the token rather than querying a session database, the middleware operates with zero database I/O, ensuring blazing fast response times.
|
| INTERVIEW QUESTIONS
| ───────────────────
| Q1: Why attach `userId` to the `req` object?
| A1: Because HTTP is stateless. By attaching `req.userId`, downstream controllers (like fetching a user's profile) instantly know *who* is making the request without having to parse the token themselves or rely on the frontend sending a user ID in the body (which would be a security risk).
|
| Q2: Why read the token from `req.cookies` instead of the `Authorization: Bearer` header?
| A2: Using `httpOnly` cookies is significantly more secure against Cross-Site Scripting (XSS) attacks. If the token was stored in `localStorage` to be sent via headers, malicious JavaScript injected into the frontend could steal it. Browsers automatically attach cookies to requests, keeping the token hidden from JS.
|
| Q3: What is a potential bug in the catch block returning a 500 status code?
| A3: If a user sends a deliberately mangled token, `jwt.verify` throws a `JsonWebTokenError`. This is a client error (they sent bad data), so it should ideally return a 401 (Unauthorized) or 400 (Bad Request), not a 500 (Internal Server Error). Returning 500 triggers server-side error monitoring alerts unnecessarily.
|
| Q4: What happens if `next()` is not called?
| A4: The HTTP request will hang indefinitely until the client times out. Express relies on middlewares calling `next()` or terminating the request via `res.send/json`.
|
| Q5: How does `jwt.verify` know if a token was modified by a hacker?
| A5: The token consists of Base64(Header) + Base64(Payload) + Signature. `jwt.verify` takes the Header and Payload, hashes them using the server's private `JWT_SECRET_KEY`, and compares the result to the Signature attached to the token. If they don't match perfectly, it means the payload was tampered with.
|==========================================================================
*/