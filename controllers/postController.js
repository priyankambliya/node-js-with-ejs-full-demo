const { default: mongoose } = require("mongoose")
const POST = require("../models/postModel")

const fs = require("fs")

//==================== CREATE POST BY LOGIN USER ====================//
exports.createPost = async (req, res) => {

    try {
        const title = req.body.title
        const description = req.body.description
        const image = req.file.filename
        const status = req.body.status

        const cord = req.body.coordinates
        const coordinates = cord.split(",")

        const post = await POST.create({
            title,
            description,
            image,
            status,
            loc: {
                type: "Point",
                coordinates: coordinates
            },
            userid: req.user.id
        })

        if (!post) {
            const error = new Error("Post not create...")
            throw error
        }

        return res.json({
            success: true,
            message: "post created successfully.."
        })
    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        })
    }
}

//==================== UPDATE POST BY LOGIN USER ====================//
exports.updatePost = async (req, res) => {

    try {
        const title = req.body.title
        const description = req.body.description
        const image = req.file.filename
        const status = req.body.status

        const cord = req.body.coordinates
        const coordinates = cord.split(",")

        const userid = req.user.id

        const post = await POST.findOne({ userid })

        fs.unlink(`public/images/${post.image}`, (e) => {
            if (e) {
                console.log(e)
            }
            else {
                console.log('file deleted success..')
            }
        })

        const user = await POST.findOneAndUpdate({ userid }, {
            title,
            description,
            image,
            loc: {
                type: "Point",
                coordinates: coordinates
            },
            status
        })

        if (!user) {
            const error = new Error("user not found..")
            throw error
        }

        return res.json({
            success: true,
            message: "user updated successfully.."
        })

    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        })
    }
}

//==================== DELETE POST BY POST ID ====================//
exports.deletePost = async (req, res) => {

    try {
        const id = req.body.id
        const post = await POST.findById(id)

        const postData = await POST.findByIdAndRemove(id)

        if (!postData) {
            const error = new Error("post not found..")
            throw error
        }

        fs.unlink(`public/images/${post.image}`, (e) => {
            if (e) {
                console.log(e)
            }
            else {
                console.log('file deleted success..')
            }
        })

        return res.json({
            success: true,
            message: "post deleted successfully.."
        })

    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        })
    }
}

//==================== GET ALL POSTS ====================//
exports.allPost = async (req, res) => {
    try {

        const onjectdata = {}
        const field = req.query.field
        const sortOrder = req.query.sortOrder
        const number = Number(sortOrder)

        onjectdata[field] = number

        const coordinates = req.query.coordinates

        const cord = coordinates.split(",")
        const array = []
        array.push(Number(cord[0]), Number(cord[1]))

        const page = req.query.page ? req.query.page : 1
        const actualPage = page - 1
        const record = 3 * actualPage

        const title = req.query.title
            ? { $match: { title: req.query.title, status: true } }
            : { $match: { status: true } }
        const project = { $project: { status: 0, loc: 0, updatedAt: 0, __v: 0 } }

        const near = {
            $geoNear: {
                near: { type: "Point", coordinates: array },
                distanceField: "calculated",
                maxDistance: 5000,
            }
        }

        const lookup = {
            $lookup:
            {
                from: "users",
                localField: "userid",
                foreignField: "_id",
                as: "user_info"
            },
        }

        const unset = {
            $unset: [
                "user_info._id",
                "user_info.__v",
                "user_info.otp",
                "user_info.token",
                "user_info.createdAt",
                "user_info.updatedAt",
                "user_info.loc",
                "user_info.password",
                "user_info.otpverification",
                "user_info.email",
                "user_info.address",
                "user_info.mobile"
            ]
        }

        const posts = await POST.aggregate([near, title, project, lookup, unset])
            .skip(record)
            .limit(7)
            .sort(onjectdata)
            .sort({ calculated: 1 })


        if (!posts.length) {
            const error = new Error("post not found..")
            throw error
        }

        const p = posts.map(e => {
            e.image = `http://localhost:4000/images/${e.image}`
            return e
        })

        const newArr = p.map(image => {
            image.user_info[0].image = `http://localhost:4000/images/${image.user_info[0].image}`
            console.log(image.user_info);
            image.user_info = image.user_info[0]
            return image
        })


        return res.json({
            success: true,
            data: newArr,
            admin,
            message: "Hear all post..."
        })
    }
    catch (error) {
        return res.json({
            success: false,
            message: error.message
        })
    }
}

//==================== GET POSTS BY LOGIN USER ====================//
exports.getPostByLoginUser = async (req, res) => {
    try {
        const userid = req.user.id

        const onjectdata = {}
        const field = req.query.field
        const sortOrder = req.query.sortOrder
        const number = Number(sortOrder)
        onjectdata[field] = number

        const coordinatesValue = req.query.coordinates

        const cord = coordinatesValue.split(",")
        const coordinates = []
        coordinates.push(Number(cord[0]), Number(cord[1]))
        console.log(coordinates)

        const pagess = req.query.page ? req.query.page : 1
        const actualPage = pagess - 1
        const record = 3 * actualPage

        const title = req.query.title
            ? { $match: { userid: new mongoose.Types.ObjectId(userid), title: req.query.title } }
            : { $match: { userid: new mongoose.Types.ObjectId(userid) } }
        const project = { $project: { userid: 0, status: 0, updatedAt: 0, __v: 0 } }

        const near = {
            $geoNear: {
                near: { type: "Point", coordinates },
                maxDistance: 7000,
                distanceField: "calculated",
            }
        }

        const posts = await POST.aggregate([
            near,
            title,
            project,
        ])
            .skip(record)
            .limit(3)
            .sort(onjectdata)
            .sort({ calculated: 1 })

        if (!posts) {
            const error = new Error("post not found")
            throw error
        }
        const p = posts.map(e => {
            e.image = `http://localhost:4000/images/${e.image}`
            return e
        })

        return res.json({
            success: true,
            data: p,
            message: "Hear all post..."
        })
    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        })
    }
}
