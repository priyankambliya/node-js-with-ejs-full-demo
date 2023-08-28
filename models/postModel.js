const mongoose = require("mongoose")
// const paginationPlugin = require("mongoose-paginate-v2")

const postSchema = new mongoose.Schema({
    title: {
        required: [true, 'title is required..'],
        type: String
    },
    description: {
        type: String,
        required: [true, 'title description id required..']
    },
    image: {
        type: String,
        required: [true, 'image must be required..']
    },
    status: {
        type: Boolean,
        enum: [true, false],
        default: false
    },
    loc: {
        coordinates: {
            type: [Number]
        },
        type: {
            type: String,
            enum: ["Point"], // 'location.type' must be 'Point'
            default: "Point"
        },
    },
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    }
}, { timestamps: true })

postSchema
    .index({ "loc": "2dsphere" })

const POST = mongoose.model('POST', postSchema)


module.exports = POST