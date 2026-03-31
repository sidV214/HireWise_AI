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