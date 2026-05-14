import jwt from "jsonwebtoken"

const generateToken = async (userId) => {
    try {
        const token = jwt.sign({ userId }, process.env.JWT_SECRET_KEY)
        return token
    } catch (error) {
        console.log("Token related error: ", error)
    }
}

export default generateToken

/*
|==========================================================================
| FILE: token.js
| PURPOSE: Generates JSON Web Tokens (JWT) for user authentication sessions.
|==========================================================================
|
| ROLE IN THE ARCHITECTURE
| ────────────────────────
| This file lives in the `server/config` (utility) layer. It acts as the core
| cryptography module for session management. It is primarily consumed by the
| `auth.controller.js` to issue tokens upon successful Google OAuth login.
|
| IMPORTS & DEPENDENCIES
| ──────────────────────
| 1. `jsonwebtoken` (jwt): The industry-standard library used to cryptographically 
|    sign payloads using a secret key, ensuring the token cannot be tampered with.
|
| FUNCTIONS & EXECUTION FLOW
| ──────────────────────────
| [generateToken] - Asynchronous Function
| - PARAMETERS: `userId` (The MongoDB ObjectId string representing the authenticated user).
| - STEP 1: Wraps execution in a `try/catch` block for safety.
| - STEP 2: Calls `jwt.sign()` passing a payload object `{ userId }` and the `JWT_SECRET_KEY` from environment variables.
| - STEP 3: The JWT library hashes the payload with the secret using the default HMAC SHA256 (HS256) algorithm.
| - STEP 4: Returns the generated encoded string (Header.Payload.Signature).
| - EDGE CASE (Catch Block): If `JWT_SECRET_KEY` is missing or invalid, `jwt.sign` throws an error, which is caught and logged.
|
| CONNECTIONS (Dependency Map)
| ───────────
| CALLED BY: `server/controllers/auth.controller.js`
| CONSUMED BY: `server/middlewares/isAuth.js` (Which verifies these exact tokens).
|
| DESIGN PATTERNS
| ───────────────
| - **Stateless Authentication Pattern**: Instead of storing session IDs in a database or memory store (like Redis), all necessary user context (`userId`) is embedded securely within the token itself. This makes the server completely stateless and infinitely horizontally scalable.
|
| INTERVIEW QUESTIONS
| ───────────────────
| Q1: Why is the `userId` the only thing stored in the payload?
| A1: JWT payloads are Base64Url encoded, NOT encrypted. Anyone who intercepts the token can read its contents. Therefore, we only store non-sensitive identifiers (like the `userId`). Sensitive data (passwords, emails, balances) should never be in the JWT payload.
|
| Q2: What algorithm does `jsonwebtoken` use by default, and how does it work?
| A2: By default, it uses `HS256` (HMAC with SHA-256). It takes the Base64 header and Base64 payload, concatenates them, and hashes them using the `JWT_SECRET_KEY`. This signature is appended to the token, proving that the server (which holds the secret) issued the token and the payload hasn't been altered.
|
| Q3: Why doesn't this token have an expiration time (`expiresIn`)?
| A3: Currently, the token is signed without an explicit expiration. This means the token is valid indefinitely unless the secret key is rotated. In a strict production environment, an `{ expiresIn: '7d' }` option should be added to `jwt.sign` to mitigate the risk of stolen tokens.
|
| Q4: What happens if `process.env.JWT_SECRET_KEY` is undefined?
| A4: The `jwt.sign` method requires a secret string or buffer. If it receives `undefined`, it will throw a synchronous error ("secretOrPrivateKey must have a value"), which will be caught by the catch block, resulting in the function returning `undefined`.
|
| Q5: Why is `generateToken` marked as `async` when `jwt.sign` is synchronous here?
| A5: `jwt.sign` operates synchronously if no callback is provided. Marking the function as `async` wraps the return value in a Promise automatically. While not strictly necessary here, it maintains a consistent asynchronous API contract, allowing the controller to use `await generateToken()`.
|==========================================================================
*/