import User from "../models/User.model.js"


export const getCurrentUser = async (req, res) => {
    try {
        const userId = req.userId
        const user = await User.findById(userId)
        if(!user){
            return res.status(404).json({message: "Couldn't find the user!!"})
        }
        return res.status(200).json(user)
    } catch (error) {
        return res.status(500).json({ message: `Failed to get the current user: ${error}` })
    }
}