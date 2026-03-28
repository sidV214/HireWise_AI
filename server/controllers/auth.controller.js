import generateToken from "../config/token.js"
import User from "../models/User.model.js"

export const googleAuth = async (req, res) => {
    try {
        const { name, email } = req.body
        let user = await User.findOne({ email })
        if (!user) {
            user = await User.create({
                name,
                email
            })
        }
        let token = await generateToken(user._id)
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        return res.status(200).json(user)

    } catch (error) {
        return res.status(500).json({ message: `Google Auth error: ${error}` })
    }
}

export const logOut = async (req, res) => {
    try {
        await res.clearCookie("token")
        return res.status(200).json({ message: "Logged out successfully!!" })
    } catch (error) {
        return res.status(500).json({ message: `Error while logging out: ${error}` })
    }
}