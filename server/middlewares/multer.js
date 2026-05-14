import multer from 'multer'
import os from 'os'

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, os.tmpdir())
    },
    filename: function (req, file, cb) {
        const filename = Date.now() + "-" + file.originalname
        cb(null, filename)
    }
})

export const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }
})

/*
|==========================================================================
| FILE: multer.js
| PURPOSE: Configures the Multer middleware to handle `multipart/form-data`
|          requests, specifically for uploading resume PDF files.
|==========================================================================
|
| ROLE IN THE ARCHITECTURE
| ────────────────────────
| This file lives in the `server/middlewares` layer. It parses incoming file
| uploads from the client, saves them temporarily to the server's disk, and
| makes the file metadata available to the downstream route controller.
|
| IMPORTS & DEPENDENCIES
| ──────────────────────
| 1. `multer`: A Node.js middleware for handling multipart/form-data.
| 2. `os`: A native Node.js module providing operating system-related utility methods.
|
| FUNCTIONS & EXECUTION FLOW
| ──────────────────────────
| [storage] - DiskStorage Configuration
| - STEP 1: Defines `destination` as `os.tmpdir()`. This tells Multer to save uploaded files in the operating system's temporary directory (e.g., `/tmp` on Linux, `C:\Users\...\AppData\Local\Temp` on Windows).
| - STEP 2: Defines `filename` as `Date.now() + "-" + file.originalname`. This ensures that if two users upload "resume.pdf" simultaneously, they won't overwrite each other.
|
| [upload] - Middleware Instance
| - STEP 1: Initializes the `multer` instance with the defined `storage` engine.
| - STEP 2: Applies a `limits` object, restricting the `fileSize` to 5 Megabytes (5 * 1024 * 1024 bytes).
| - STEP 3: Exports the configured middleware for use in routes.
|
| CONNECTIONS (Dependency Map)
| ───────────
| EXPORTED TO: `server/routes/interview.route.js`
| CONSUMED BY: `upload.single('resume')` middleware interceptor on the `/setup` endpoint.
|
| DESIGN PATTERNS
| ───────────────
| - **Strategy Pattern**: Multer supports different storage "strategies" (MemoryStorage, DiskStorage). We inject the DiskStorage strategy here to prevent large PDF files from exhausting the Node.js V8 memory heap, which could happen if MemoryStorage was used under heavy concurrent load.
|
| INTERVIEW QUESTIONS
| ───────────────────
| Q1: Why save the file to `os.tmpdir()` instead of a dedicated `uploads/` folder?
| A1: In modern cloud deployments (like Render, Heroku, or AWS Lambda), the local filesystem is ephemeral and can be wiped at any time. Saving to `os.tmpdir()` is a best practice for temporary processing (like parsing text from a PDF). The OS will automatically clean up the `/tmp` directory periodically, preventing the server's disk from filling up.
|
| Q2: What happens if a user uploads a 10MB file?
| A2: Because of the `limits: { fileSize: 5 * 1024 * 1024 }` configuration, Multer will intercept the file stream, realize it exceeds the limit, abort the upload, and throw a `MulterError: File too large`. This protects the server from Denial of Service (DoS) attacks via massive file uploads.
|
| Q3: How does the downstream controller access the uploaded file?
| A3: After Multer processes the request, it populates `req.file` with an object containing metadata, including the `path` (the absolute path to the file in `os.tmpdir()`), which the controller can then read using `fs.readFile`.
|
| Q4: What is the risk of using `file.originalname` in the filename?
| A4: Security risk. If a malicious user uploads a file named `../../../etc/passwd`, it could lead to Path Traversal attacks depending on how the application handles the string. While Multer strips directory paths from `originalname`, it's generally safer to generate a completely random UUID for the filename and ignore the user's input entirely.
|
| Q5: Why is `multipart/form-data` required for file uploads instead of standard JSON?
| A5: JSON is a text-based format. Encoding large binary files (like PDFs or images) into Base64 strings to fit inside JSON increases the payload size by ~33% and incurs heavy CPU overhead for encoding/decoding. `multipart/form-data` transmits raw binary streams, which is significantly more efficient.
|==========================================================================
*/