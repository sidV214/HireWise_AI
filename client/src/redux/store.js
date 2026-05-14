import { configureStore } from '@reduxjs/toolkit'
import userSlice from "./userSlice.js"

export default configureStore({
  reducer: {
    user: userSlice
  },
})

/*
 * ===========================================================================================
 *                              NOTES — store.js
 * ===========================================================================================
 *
 * PURPOSE: Creates and configures the global Redux store for the application using
 *          Redux Toolkit's `configureStore` helper.
 *
 * ROLE IN ARCHITECTURE:
 * ---------------------
 * This file lives in `client/src/redux/`. It is the central state management hub.
 * The store is imported by `main.jsx` and injected into the component tree via
 * the `<Provider>` component. Every component that calls `useSelector` or `useDispatch`
 * reads from or writes to this store.
 *
 * IMPORTS & DEPENDENCIES:
 * -----------------------
 * 1. `configureStore` (@reduxjs/toolkit): A wrapper around Redux's `createStore` that
 *    auto-configures Redux DevTools, thunk middleware, and immutability checks.
 * 2. `userSlice` (./userSlice.js): The reducer function from the user slice. Handles
 *    the `user` domain of the global state tree.
 *
 * STATE SHAPE:
 * ------------
 * {
 *   user: {
 *     userData: null | { _id, name, email, credits, createdAt, updatedAt }
 *   }
 * }
 *
 * CONNECTIONS (Dependency Map):
 * ----------------------------
 * CONSUMED BY: `main.jsx` (Provider store={store})
 * CONTAINS: `userSlice` reducer
 *
 * DESIGN PATTERNS:
 * ----------------
 * - **Single Store Pattern**: Redux enforces a single, centralized store. All application
 *   state flows through one predictable state tree, making debugging deterministic.
 *
 * INTERVIEW QUESTIONS:
 * --------------------
 * Q1: Why use `configureStore` instead of `createStore`?
 * A1: `configureStore` is the recommended way since Redux Toolkit. It auto-adds thunk
 *     middleware, enables Redux DevTools, and adds development-only immutability checks.
 *     `createStore` is now deprecated.
 *
 * Q2: Could this app use React Context instead of Redux?
 * A2: For this scale (single slice, simple state), React Context would work. However,
 *     Redux provides middleware support, DevTools time-travel debugging, and a more
 *     structured pattern for state updates that scales better as features are added.
 * ===========================================================================================
 */
