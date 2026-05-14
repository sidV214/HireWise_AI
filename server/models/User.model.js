import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    credits: {
        type: Number,
        default: 100
    }
}, { timestamps: true })

const User = mongoose.model("User", userSchema)

export default User

/*
|==========================================================================
| FILE: User.model.js
| PURPOSE: Defines the Mongoose schema for the `users` database collection,
|          managing user identity, Google OAuth profiles, and credit balances.
|==========================================================================
|
| ROLE IN THE ARCHITECTURE
| ────────────────────────
| This file lives in the `server/models` layer. It acts as the single source of
| truth for the structural integrity of a user document in MongoDB. Controllers
| interact with this model to execute CRUD operations on the `users` collection.
|
| IMPORTS & DEPENDENCIES
| ──────────────────────
| 1. `mongoose`: The ODM library providing Schema definitions, data validation,
|    and the Model constructor.
|
| SCHEMA DEFINITION & DATA FLOW
| ─────────────────────────────
| [userSchema]
| - `name`: String. The user's full name, retrieved from Google OAuth. Required.
| - `email`: String. The user's primary email. Required and `unique: true` to prevent duplicate accounts and allow for fast indexing.
| - `credits`: Number. Tracks the user's available interview sessions. Defaults to 100 for new signups.
| - `timestamps: true`: Automatically manages `createdAt` and `updatedAt` Date fields on every document.
|
| CONNECTIONS (Dependency Map)
| ───────────
| CONSUMED BY: 
|  - `auth.controller.js` (To find/create users during OAuth).
|  - `user.controller.js` (To fetch profile data).
|  - `interview.controller.js` (To deduct credits when starting an interview).
|  - `payment.controller.js` (To increment credits after a successful Razorpay purchase).
|
| DESIGN PATTERNS
| ───────────────
| - **Active Record Pattern (via Mongoose)**: The exported `User` model acts as an Active Record, meaning it encapsulates both the data structure (Schema) and the data access methods (`.find()`, `.save()`, `.updateOne()`).
| - **Default Configuration Pattern**: Setting a `default: 100` for credits ensures that the application logic doesn't need to manually assign starting balances when creating a new user document.
|
| INTERVIEW QUESTIONS
| ───────────────────
| Q1: What does `unique: true` on the `email` field actually do under the hood?
| A1: In Mongoose, `unique: true` is NOT a validation rule. It is a command to MongoDB to build a unique index on the `email` field in the background. This ensures database-level constraint against duplicates and makes email lookups O(1) or O(log N) instead of a full collection scan O(N).
|
| Q2: How do `timestamps: true` help with system auditing?
| A2: It automatically injects `createdAt` and `updatedAt` fields. This is crucial for analytics (e.g., finding out how many users registered this month) and debugging (e.g., verifying when a user's credit balance was last updated).
|
| Q3: If a user logs in via Google OAuth twice, how do we prevent two documents from being created?
| A3: Because `email` has a unique index, attempting to `.save()` or `.create()` a second user with the same email will throw a MongoDB Duplicate Key Error (Code 11000). To handle this elegantly, `auth.controller.js` uses `.findOne({ email })` first, returning the existing user instead of creating a new one.
|
| Q4: What happens if we try to save a user without a `name`?
| A4: Mongoose intercepts the save operation. Because `required: true` is set on `name`, Mongoose's internal validation engine will throw a `ValidationError` before the request ever reaches the MongoDB server.
|
| Q5: Why is `credits` stored as a Number rather than a String?
| A5: Credits represent a quantitative value that will be subjected to mathematical operations (`$inc: -1` during interviews, `$inc: +X` during payments). Storing it as a Number allows MongoDB to perform these atomic mathematical updates directly in the database.
|==========================================================================
*/