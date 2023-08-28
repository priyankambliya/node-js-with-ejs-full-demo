const mongoose = require("mongoose")

const adminModel = new mongoose.Schema({
    name: {
        // required: [true, 'title is required..'],
        type: String
    },
    email: {
        type: String,
        // required: [true, 'title description id required..']
    },
    password: {
        type: String,
        // required: [true, 'image must be required..']
    },
    address: {
        type: String
    },
    mobile: {
        type: String
    },
    image: {
        type: String
    }
}, { timestamps: true })

const ADMIN = mongoose.model('ADMIN', adminModel)


module.exports = ADMIN