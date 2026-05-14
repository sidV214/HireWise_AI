import mongoose from "mongoose";

const connectDB = async() => {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log("Database connected!!")
    } catch (error) {
        console.error(`Database error: ${error}`)
    }
}

export default connectDB

/*
|==========================================================================
| FILE: connectDB.js
| PURPOSE: Establishes a persistent connection to the MongoDB Atlas cluster
|          using the Mongoose Object Data Modeling (ODM) library.
|==========================================================================
|
| ROLE IN THE ARCHITECTURE
| ────────────────────────
| This file lives in the `server/config` layer. It is a fundamental infrastructure
| module. It is imported and executed precisely once during the server startup
| lifecycle (in `index.js`).
|
| IMPORTS & DEPENDENCIES
| ──────────────────────
| 1. `mongoose`: The official MongoDB object modeling tool for Node.js. Used here 
|    specifically for its `.connect()` method which handles connection pooling.
|
| FUNCTIONS & EXECUTION FLOW
| ──────────────────────────
| [connectDB] - Asynchronous Function
| - STEP 1: Wraps the connection attempt in a `try/catch` block to prevent unhandled promise rejections from crashing the Node process silently.
| - STEP 2: Calls `mongoose.connect(process.env.MONGODB_URI)`. This uses the connection string injected via environment variables.
| - STEP 3: If successful, it logs "Database connected!!" to the console.
| - EDGE CASE (Catch Block): If the connection fails (e.g., bad URI, IP not whitelisted in Atlas, network outage), it catches the error and logs the specific failure reason.
| - DATABASE OPERATIONS: Opens a persistent TCP connection pool to the MongoDB server.
|
| CONNECTIONS (Dependency Map)
| ───────────
| CALLED BY: `server/index.js`
| EXTERNAL API: MongoDB Atlas (Database Layer)
|
| DESIGN PATTERNS
| ───────────────
| - **Singleton Connection Pattern**: By calling `mongoose.connect()` once, Mongoose internally creates a default connection object. All subsequent model imports (`User`, `Interview`) will automatically reuse this singleton connection pool, avoiding the overhead of establishing new TCP handshakes per request.
|
| INTERVIEW QUESTIONS
| ───────────────────
| Q1: Why use Mongoose instead of the native MongoDB driver?
| A1: Mongoose provides a schema-based solution to model application data. It includes built-in type casting, validation, query building, and business logic hooks, which significantly reduces boilerplate code compared to the native driver's raw collection methods.
|
| Q2: What happens if `process.env.MONGODB_URI` is undefined?
| A2: `mongoose.connect` will throw an error immediately because it requires a valid connection string (starting with `mongodb://` or `mongodb+srv://`). The catch block will log the error, but the Express server will still start, resulting in database queries failing later.
|
| Q3: How does connection pooling work in Mongoose?
| A3: When `connect()` is called, Mongoose creates a pool of sockets (default 100) to the MongoDB server. When a route controller executes a DB query, it borrows a socket from the pool, runs the query, and returns the socket. This ensures high throughput without constantly opening/closing connections.
|
| Q4: Why is `connectDB` an `async` function?
| A4: Database connections involve network I/O, which takes time. `mongoose.connect` returns a Promise. Using `async/await` allows us to pause execution within this function until the connection resolves or rejects, making the code synchronous-looking and easier to read.
|
| Q5: Should we call `process.exit(1)` in the catch block?
| A5: In many production setups, yes. If the server absolutely depends on the database to function, failing to connect means the server is useless. Exiting the process allows process managers (like PM2 or Docker/Kubernetes) to restart the container and try again.
|==========================================================================
*/