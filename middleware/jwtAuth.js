const jwt = require("jsonwebtoken")
const USER = require("../models/userModel")


module.exports = async (req, res, next) => {
    try {
        const token = req.cookies.jwtToken

        if (!token) {
            const error = new Error("Token invalid..")
            throw error
        }

        let decodedToken
        try {
            decodedToken = jwt.verify(token, process.env.SECRET_KEY)
            if (!decodedToken) {
                const error = new Error("Token not decoded successfully..")
                throw error
            }
        } catch (error) {
            return res.json({
                success: false,
                message: error.message
            })
        }

        const user = await USER.findOne({ email: decodedToken.email })

        if (user.status == 'Blocked') {
            const error = new Error('Sorry but you can not login,wait for admin changes')
            throw error
        }

        if (!user) {
            const error = new Error("user not found..")
            throw error
        }

        req.user = user
        next()
    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        })
    }
}



// 