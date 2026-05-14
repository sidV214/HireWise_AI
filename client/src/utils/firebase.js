// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth"

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: "interviewagentai.firebaseapp.com",
    projectId: "interviewagentai",
    storageBucket: "interviewagentai.firebasestorage.app",
    messagingSenderId: "19177431764",
    appId: "1:19177431764:web:bfe5fe6880ae2b3f061141",
    measurementId: "G-WEWFMLD7VV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const auth = getAuth(app)

const provider = new GoogleAuthProvider()

export { auth, provider }

/*
 * ===========================================================================================
 *                              NOTES — firebase.js
 * ===========================================================================================
 *
 * PURPOSE: Initializes Firebase SDK and exports the Auth instance + Google Auth Provider
 *          for use in the Auth.jsx component.
 *
 * CONFIGURATION: Uses Vite environment variables (VITE_FIREBASE_*) for all Firebase
 * project credentials. These are public keys — Firebase security rules and backend
 * validation provide the actual security, not key secrecy.
 *
 * EXPORTS:
 * - `auth`: Firebase Auth instance used for signInWithPopup().
 * - `provider`: GoogleAuthProvider instance configured for Google OAuth.
 *
 * CONNECTIONS: Consumed by Auth.jsx for authentication. Configuration values are
 * loaded from client/.env via import.meta.env (Vite's env variable system).
 * ===========================================================================================
 */