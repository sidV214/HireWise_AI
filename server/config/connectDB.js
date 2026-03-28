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