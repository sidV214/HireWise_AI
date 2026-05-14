import express from "express"
import { googleAuth, logOut } from "../controllers/auth.controller.js"

const authRouter = express.Router()

authRouter.post("/google-auth", googleAuth)
authRouter.get("/logout", logOut)

export default authRouter

/*
|==========================================================================
| FILE: auth.route.js
| PURPOSE: Defines the Express router for authentication-related endpoints
|          (Google Login and Logout).
|==========================================================================
|
| ROLE IN THE ARCHITECTURE
| ────────────────────────
| This file lives in the `server/routes` layer. It acts as the traffic director.
| When `index.js` receives a request starting with `/api/auth`, it forwards it
| here. This router then maps specific URL paths and HTTP methods to their
| respective controller functions.
|
| IMPORTS & DEPENDENCIES
| ──────────────────────
| 1. `express`: Used to create an `express.Router()` instance.
| 2. `googleAuth, logOut`: Controller functions imported from `auth.controller.js`.
|
| ENDPOINTS & DATA FLOW
| ─────────────────────
| 1. POST `/google-auth`
|    - ROUTE: `POST /api/auth/google-auth`
|    - PURPOSE: Receives Google OAuth credentials from the frontend to issue a JWT session cookie.
|    - MIDDLEWARE: None (It's a public route; users are unauthenticated at this point).
|    - CONTROLLER: `googleAuth`
|
| 2. GET `/logout`
|    - ROUTE: `GET /api/auth/logout`
|    - PURPOSE: Clears the JWT cookie to terminate the user's session.
|    - MIDDLEWARE: None.
|    - CONTROLLER: `logOut`
|
| CONNECTIONS (Dependency Map)
| ───────────
| MOUNTED IN: `server/index.js` (as `app.use("/api/auth", authRouter)`)
| DELEGATES TO: `server/controllers/auth.controller.js`
|
| DESIGN PATTERNS
| ───────────────
| - **Front Controller Pattern (Delegation)**: The router doesn't contain any business logic. It strictly acts as a mapping table connecting HTTP verbs + paths to the logic layer (controllers). This keeps the routing topology clean and highly readable.
|
| INTERVIEW QUESTIONS
| ───────────────────
| Q1: Why is `/google-auth` a POST request instead of a GET request?
| A1: Authentication involves sending a payload (the Google OAuth credential token) from the client to the server. GET requests shouldn't have bodies, and putting sensitive tokens in the URL query string (where they get logged in server access logs and browser histories) is a massive security vulnerability. POST requests securely encrypt the payload within the TLS/SSL body.
|
| Q2: Why isn't `isAuth` middleware applied to `/logout`?
| A2: While clearing a session usually implies the user is logged in, applying `isAuth` here could cause a bug: if a user's token expires or becomes invalid, `isAuth` would block them from calling `/logout` to clear the bad cookie, trapping them in a broken state on the frontend.
|
| Q3: What is the difference between `app.get()` and `router.get()`?
| A3: `app.get()` mounts a route globally on the root server instance. `router.get()` mounts a route on a modular, mini-application (the Router). Routers can be exported and mounted under specific prefixes (`/api/auth`) inside the main app, enabling modular code organization.
|==========================================================================
*/