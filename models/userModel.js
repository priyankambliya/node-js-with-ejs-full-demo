const { boolean, string } = require("joi")
const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    token: {
        type: String,
        required: false
    },
    otpverification: {
        type: Boolean,
        default: false
    },
    image: {
        type: String
    },
    mobile: {
        type: String
    },
    loc: {
        type: { type: String },
        coordinates: []
    },
    address: {
        type: String
    },
    status: {
        type: String,
        enum: ["Active", "Blocked"],
        default: "Active"
    },
    role: {
        type: String,
        default: 'user'
    }
}, { timestamps: true })

const USER = mongoose.model('USERS', userSchema)
module.exports = USER