import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import {Provider} from 'react-redux'
import store from './redux/store.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <Provider store={store}>
    <App />
    </Provider>
    </BrowserRouter>
  </StrictMode>,
)

/*
 * ===========================================================================================
 *                              NOTES — main.jsx
 * ===========================================================================================
 *
 * PURPOSE: The root entry point of the React application. Bootstraps the React tree into
 *          the DOM and wraps it with all necessary context providers.
 *
 * ROLE IN ARCHITECTURE:
 * ---------------------
 * This file sits at the absolute top of the frontend hierarchy. It is referenced by
 * `index.html` via `<script type="module" src="/src/main.jsx">`. It creates the React
 * root, injects global providers (Router, Redux), and mounts the `<App />` component.
 *
 * IMPORTS & DEPENDENCIES:
 * -----------------------
 * 1. `StrictMode` (React): Activates additional development warnings and double-invocations
 *    for detecting side effects. Has no impact in production builds.
 * 2. `createRoot` (react-dom/client): React 18+ API for creating a concurrent rendering root.
 * 3. `./index.css`: Global stylesheet that imports Tailwind CSS v4 and defines the custom
 *    dark-mode design tokens (inverted grays, emerald palette, glassmorphism utilities).
 * 4. `App`: The main application component containing all routing and layout logic.
 * 5. `BrowserRouter` (react-router-dom): Provides client-side routing using the HTML5
 *    History API for clean URLs without hash fragments.
 * 6. `Provider` (react-redux): Makes the Redux store accessible to all components in the
 *    React tree via `useSelector` and `useDispatch` hooks.
 * 7. `store` (./redux/store.js): The configured Redux Toolkit store containing the
 *    `user` slice for global authentication state.
 *
 * PROVIDER HIERARCHY:
 * -------------------
 * StrictMode → BrowserRouter → Provider (Redux) → App
 *
 * This order matters:
 * - BrowserRouter wraps Provider so that Redux-connected components can use routing hooks.
 * - Provider wraps App so that every component in the tree can access the Redux store.
 *
 * CONNECTIONS (Dependency Map):
 * ----------------------------
 * CALLED BY: `client/index.html` (via script tag)
 * MOUNTS: `App.jsx` as the root component
 *
 * DESIGN PATTERNS:
 * ----------------
 * - **Provider Pattern**: Multiple context providers are nested to inject global services
 *   (routing, state management) into the component tree. This is the standard React pattern
 *   for dependency injection without prop drilling.
 *
 * INTERVIEW QUESTIONS:
 * --------------------
 * Q1: Why use `createRoot` instead of `ReactDOM.render`?
 * A1: `createRoot` is the React 18+ concurrent rendering API. It enables features like
 *     automatic batching, transitions, and Suspense. `ReactDOM.render` is the legacy API
 *     and will be removed in future React versions.
 *
 * Q2: What does `StrictMode` actually do?
 * A2: In development, it double-invokes component functions, effects, and reducers to help
 *     detect impure renders and side effects. It also warns about deprecated APIs. It has
 *     zero overhead in production builds — the checks are completely stripped out.
 *
 * Q3: Why is `BrowserRouter` placed outside `Provider`?
 * A3: This is a convention. Either order works because BrowserRouter and Provider provide
 *     independent contexts. However, placing BrowserRouter outside allows the Redux store
 *     setup to potentially use routing information if needed in the future.
 * ===========================================================================================
 */
