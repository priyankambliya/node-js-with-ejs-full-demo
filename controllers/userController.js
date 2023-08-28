const USER = require("../models/userModel")
const nodeMailer = require("nodemailer")

const otp = require("otp-generator")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const fs = require("fs")

const TokenGenerator = require('token-generator')({
    salt: 'your secret ingredient for this magic recipe',
    timestampMap: 'abcdefghij', // 10 chars array for obfuscation proposes
})

//================== CREATE USER ===================//
exports.createUser = async (req, res) => {
    try {
        const username = req.body.username
        const email = req.body.email
        const pass = req.body.password

        const cord = req.body.coordinates
        const coordinates = cord.split(",")

        const password = await bcrypt.hash(pass, 10)

        // =========== SENDING OTP ============= //

        const oneTimePassword = otp.generate(4, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false
        })

        const token = TokenGenerator.generate()

        if (!token) {
            const error = new Error("Token not send properly..")
            throw error
        }

        const user = await USER.create({
            username,
            email,
            password,
            otp: oneTimePassword,
            loc: {
                type: "Point",
                coordinates: coordinates
            },
            token
        })

        if (!user) {
            const error = new Error("Usre not valid..")
            throw error
        }

        // ================ SENDING MAIL =================== //

        const transporter = nodeMailer.createTransport({
            service: "gmail",
            // secure: true,
            auth: {
                // TODO: replace `user` and `pass` values from <https://forwardemail.net>
                user: process.env.ADMIN_EMAIL,
                pass: process.env.ADMIN_PASSWORD
            }
        })

        const info = await transporter.sendMail({
            from: process.env.ADMIN_EMAIL, // sender address
            to: user.email, // list of receivers
            subject: "Hello ✔", // Subject line
            text: `Hello ${username} your otp is : ${oneTimePassword}`, // plain text body
            // html: "<b>Hello world?</b>", // html body
        })
        if (!info) {
            const error = new Error("Invalid message in email..")
            throw error
        }
        return res.json({
            success: true,
            data: token,
            message: "user created successfully..."
        })

    } catch (error) {

        return res.status(401).json({
            success: false,
            message: error.message
        })

    }
}

//================== VERIFY OTP WHICH SEND BY USER ===================//
exports.verifyOtp = async (req, res) => {
    try {
        const otpByUser = req.body.otp
        const token = req.headers.token

        const user = await USER.findOne({ token })

        if (!user) {
            const error = new Error("user not found..")
            throw error
        }
        else {
            if (otpByUser == user.otp) {
                const userData = await USER.findOneAndUpdate({ otp: otpByUser }, {
                    otpverification: true
                });

                if (!userData) {
                    const error = new Error("userdata not found..")
                    throw error
                }

                return res.json({
                    success: true,
                    message: "user have a permission to ENTER.."
                })
            }
            else {
                const error = new Error("token not matched..")
                throw error
            }
        }
    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        })
    }

}

//================== RESEND OTP ===================//
exports.resendOtp = async (req, res) => {
    try {
        const oneTimePassword = otp.generate(4, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false
        })
        const token = req.headers.token

        const transporter = nodeMailer.createTransport({
            service: "gmail",
            // secure: true,
            auth: {
                // TODO: replace `user` and `pass` values from <https://forwardemail.net>
                user: process.env.ADMIN_EMAIL,
                pass: process.env.ADMIN_PASSWORD
            }
        })

        const user = await USER.findOneAndUpdate({ token }, {
            otp: oneTimePassword
        })
        console.log(update)

        const info = await transporter.sendMail({
            from: process.env.ADMIN_EMAIL, // sender address
            to: user.email, // list of receivers
            subject: "Hello ✔", // Subject line
            text: `Hello user your new otp is : ${oneTimePassword}`, // plain text body
            // html: "<b>Hello world?</b>", // html body
        })
        if (!info) {
            const error = new Error("Invalid message in email..")
            throw error
        }
        return res.json({
            success: true,
            data: "otp send successfully.."
        })
    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        })
    }
}

//================== LOGIN USER ===================//
exports.loginUser = async (req, res) => {
    try {
        const email = req.body.email
        const password = req.body.password

        const user = await USER.findOne({ email })

        console.log(user)

        const newPassword = await bcrypt.compare(password, user.password)

        if (!newPassword) {
            const error = new Error("Password wrong..")
            throw error
        }
        if (!user.otpverification) {
            const error = new Error("otp verification failed..")
            throw error
        }

        const token = jwt.sign({ email, role: user.role }, process.env.SECRET_KEY, { expiresIn: "12h" })

        if (!token) {
            const error = new Error("Token not created..")
            throw error
        }

        res.cookie("jwtToken", token)

        return res.json({
            success: true,
            message: "User login done..",
            token
        })
    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        })
    }
}

//================== GET USER ===================//
exports.getUser = async (req, res) => {
    try {
        const token = req.headers.token

        const userData = await USER.findOne({ token })

        userData.image = `public/images/${userData.image}`

        if (!userData) {
            const error = new Error("User not found..")
            throw error
        }
        console.log(userData)
        return res.json({
            success: true,
            data: userData
        })

    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        })
    }
}

//================== UPDATE USER ===================//
exports.updateUser = async (req, res) => {
    try {
        const image = req.file.filename
        const mobile = req.body.mobile
        const dob = req.body.dob
        const address = req.body.address

        const email = req.user.email

        if (!req.user.otpverification) {
            const error = new Error("Otp verification not done..")
            throw error
        }

        if (req.user.image) {
            // return true
            fs.unlink(`public/images/${req.user.image}`, (e) => {
                if (e) {
                    console.log(e)
                }
                else {
                    console.log('file deleted success..')
                }
            })
        }

        const user = await USER.findOneAndUpdate({ email }, {
            dob,
            mobile,
            image,
            address
        })

        if (!user) {
            const error = new Error("User not valid...")
            throw error
        }

        return res.json({
            success: true,
            message: "User updated successfully.."
        })
    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        })
    }
}

//================== UPDATE USER PASSWORD ===================//
exports.updateUserPassword = async (req, res) => {
    try {
        const newPassword = req.body.newPassword
        const password = req.body.oldPassword

        const email = req.user.email

        const bcryptedPass = await bcrypt.hash(newPassword, 10)


        if (!req.user.otpverification) {
            const error = new Error("Otp verification not done..")
            throw error
        }

        const isEqual = await bcrypt.compare(password, req.user.password)

        if (!isEqual) {
            const error = new Error("You enter wrong password..")
            throw error
        }
        else {
            const updatedUser = await USER.findOneAndUpdate({ email }, {
                password: bcryptedPass
            })

            if (!updatedUser) {
                const error = new Error("User not found..")
                throw error
            }
        }

        return res.json({
            success: true,
            message: "User updated successfully.."
        })
    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        })
    }
}

//================== FORGOT USER PASSWORD ===================//
exports.forgotPassword = async (req, res) => {
    try {
        if (req.params.id == "1") {
            const email = req.body.email

            const user = await USER.findOne({ email })

            if (!user) {
                const error = new Error("user not found..")
                throw error
            }

            const oneTimePassword = otp.generate(4, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false
            })

            const transporter = nodeMailer.createTransport({
                service: "gmail",
                // secure: true,
                auth: {
                    // TODO: replace `user` and `pass` values from <https://forwardemail.net>
                    user: process.env.ADMIN_EMAIL,
                    pass: process.env.ADMIN_PASSWORD
                }
            })

            const info = await transporter.sendMail({
                from: process.env.ADMIN_EMAIL, // sender address
                to: user.email, // list of receivers
                subject: "Hello ✔", // Subject line
                text: `Hello ${user.username} your otp is : ${oneTimePassword}`, // plain text body
                // html: "<b>Hello world?</b>", // html body
            })

            if (!info) {
                const error = new Error("Invalid message in email..")
                throw error
            }
            const userData = await USER.findOneAndUpdate({ email }, {
                otp: oneTimePassword
            })
            return res.json({
                success: true,
                message: "otp send by admin .. waiting for your response.."
            })
        }
        else if (req.body.id = "2") {
            const otp = req.body.otp
            const pass = req.body.password

            const password = await bcrypt.hash(pass, 10)

            if (!password) {
                const error = new Error("User password not converted..")
                throw error
            }
            const user = await USER.findOneAndUpdate({ otp }, {
                password
            })

            if (!user) {
                const error = new Error("user not found..")
                throw error
            }
            return res.json({
                success: true,
                message: "User updated successfully.."
            })
        }
    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        })
    }
}

//================== LOGOUT USER ===================//
exports.logout = (req, res) => {
    res.clearCookie('jwtToken')
    return res.json({
        success: true,
        message: "User log out successfully.."
    })
}

//================== DELETE USER ===================//
exports.deleteUser = async (req, res) => {
    try {
        if (req.body.type == "1") {
            const oneTimePassword = otp.generate(4, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false
            })
            // ================ SENDING MAIL =================== //

            const transporter = nodeMailer.createTransport({
                service: "gmail",
                // secure: true,
                auth: {
                    // TODO: replace `user` and `pass` values from <https://forwardemail.net>
                    user: process.env.ADMIN_EMAIL,
                    pass: process.env.ADMIN_PASSWORD
                }
            })

            const info = await transporter.sendMail({
                from: process.env.ADMIN_EMAIL, // sender address
                to: req.user.email, // list of receivers
                subject: "Hello ✔", // Subject line
                text: `Hello ${req.user.username} your otp is : ${oneTimePassword}`, // plain text body
                // html: "<b>Hello world?</b>", // html body
            })
            if (!info) {
                const error = new Error("Invalid message in email..")
                throw error
            }
            const updateUser = await USER.findOneAndUpdate({ email: req.user.email }, {
                otpverification: false,
                otp: oneTimePassword
            })
        } else if (req.body.type == "2") {
            const otp = req.body.otp

            const user = await USER.findOne({ otp })

            if (otp == user.otp) {
                const validUserUpdate = await USER.findOneAndDelete({ otp })
                if (!validUserUpdate) {
                    const error = new Error("otp not match..")
                    throw error
                }
            }
        }

        return res.json({
            success: true,
            data: "user deleted successfully.."
        })
    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        })
    }

}