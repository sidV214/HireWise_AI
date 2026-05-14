import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({     // somewhat same as useState 
    name:"user",
    initialState:{
        userData: null
    },
    reducers:{
        setUserData: (state, action) => {
            state.userData= action.payload
        }
    }
})

export const {setUserData} = userSlice.actions
export default userSlice.reducer

/*
 * ===========================================================================================
 *                              NOTES — userSlice.js
 * ===========================================================================================
 *
 * PURPOSE: Defines the Redux Toolkit slice for managing global user authentication state.
 *          Contains the user data (profile + credits) that persists across all components.
 *
 * ROLE IN ARCHITECTURE:
 * ---------------------
 * This file lives in `client/src/redux/`. It is the ONLY slice in the application, managing
 * the user's session state. It is consumed by nearly every component that needs to check
 * authentication status or display user-specific data (Navbar, Home, Pricing, Steps).
 *
 * IMPORTS & DEPENDENCIES:
 * -----------------------
 * 1. `createSlice` (@reduxjs/toolkit): Generates action creators and a reducer function
 *    from a single config object. Internally uses Immer for immutable state updates.
 *
 * SLICE DEFINITION:
 * -----------------
 * [name: "user"] — The namespace for this slice in the Redux store.
 *
 * [initialState]:
 *   - `userData: null` — Starts as null (unauthenticated). After login or session
 *     rehydration, it holds the full user object from MongoDB.
 *
 * [reducers]:
 *   - `setUserData(state, action)`: Sets `state.userData` to the action payload.
 *     Called with the user object after login, or with `null` after logout/auth failure.
 *     Thanks to Immer (built into createSlice), `state.userData = action.payload` is
 *     a direct mutation that Immer converts to an immutable update behind the scenes.
 *
 * EXPORTS:
 * --------
 * - `setUserData` (named export): The action creator, used by dispatchers.
 * - `userSlice.reducer` (default export): The reducer function, consumed by the store.
 *
 * CONNECTIONS (Dependency Map):
 * ----------------------------
 * CONSUMED BY: `store.js` (as the `user` reducer)
 * DISPATCHED BY:
 *   - `App.jsx` (session rehydration)
 *   - `Auth.jsx` (Google login)
 *   - `Navbar.jsx` (logout)
 *   - `Step1SetUp.jsx` (credit update after starting interview)
 *   - `Pricing.jsx` (credit update after payment)
 * READ BY: Any component using `useSelector((state) => state.user)`
 *
 * DESIGN PATTERNS:
 * ----------------
 * - **Flux/Redux Pattern**: Unidirectional data flow. Components dispatch actions →
 *   the reducer produces new state → components re-render with the updated state.
 * - **Single Source of Truth**: `userData` is the authoritative representation of the
 *   user's session. No component stores its own copy of the user data.
 *
 * INTERVIEW QUESTIONS:
 * --------------------
 * Q1: Why is `initialState.userData` set to `null` instead of an empty object?
 * A1: `null` explicitly means "no user / not authenticated." An empty object `{}` is
 *     truthy in JavaScript, so `if (userData)` would evaluate to `true`, incorrectly
 *     treating the user as logged in. `null` is falsy, enabling clean conditional checks.
 *
 * Q2: How does Immer enable direct mutations in Redux reducers?
 * A2: `createSlice` wraps the reducer in an Immer `produce()` call. Immer creates a
 *     draft proxy of the state. When you write `state.userData = action.payload`,
 *     you're mutating the draft, not the actual state. Immer then compares the draft
 *     to the original and produces a new immutable state object.
 *
 * Q3: Why not store the JWT token in Redux state?
 * A3: The JWT is stored as an httpOnly cookie, which is inaccessible to JavaScript.
 *     This is intentional for security (prevents XSS attacks from stealing the token).
 *     Redux only stores the user profile data, not the authentication credential itself.
 * ===========================================================================================
 */