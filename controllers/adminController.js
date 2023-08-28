const POST = require("../models/postModel")
const USER = require("../models/userModel")
const ADMIN = require('../models/adminModel')

const bcrypt = require('bcrypt')
const fs = require('fs')

exports.createAdmin = async (req, res) => {
    try {
        const name = req.body.name;
        const email = req.body.email;
        const password = req.body.password;

        const bcryptedPassword = await bcrypt.hash(password, 10)

        const address = req.body.address
        const mobile = req.body.mobile
        const image = req.file.filename

        const admin = await ADMIN.create({
            name,
            email,
            password: bcryptedPassword,
            address,
            mobile,
            image
        })

        if (!admin) {
            const error = new Error('Admin invalid..')
            throw error
        }

        return res.json({
            success: true,
        })
    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        })
    }
}

exports.getLogin = (req, res) => {
    res.render('loginAdmin')
}

exports.loginUser = async (req, res) => {
    try {
        console.log(req.session);

        res.redirect('/api/admin/all-users')
    } catch (error) {
        res.redirect('/api/admin/login')
    }
}

exports.AllUsers = async (req, res) => {
    try {
        const page = req.query.page ? req.query.page : 1
        const pageNumber = Number(page)
        const actualPage = pageNumber - 1
        const record = 2 * actualPage


        const data = await USER.find().count()

        const totalPage = Math.ceil(data / 2)

        const users = await USER.find().skip(record).limit(2)

        const p = users.map(e => {
            e.image = `http://localhost:4000/images/${e.image}`
            return e
        })

        const adminId = req.session.passport.user

        const admin = await ADMIN.findById(adminId)

        admin.image = `http://localhost:4000/images/${admin.image}`

        res.render('index', { users: p, admin, page: pageNumber, totalPage })
    } catch (error) {
        console.log(error.message)
        return res.redirect('/api/admin/login')
    }
}

exports.AllPosts = async (req, res) => {

    try {
        const admin = req.user

        admin.image = `http://localhost:4000/images/${admin.image}`

        if (!admin) {
            const error = new Error('admin not found..')
            throw error
        }

        const page = req.query.page ? req.query.page : 1
        const pageNumber = Number(page)
        const actualPage = pageNumber - 1
        const record = 3 * actualPage

        const data = await POST.find().count()

        const totalPage = Math.ceil(data / 3)

        const lookup = {
            $lookup:
            {
                from: "users",
                localField: "userid",
                foreignField: "_id",
                as: "user_info"
            },
        }

        const posts = await POST.aggregate([
            // { $match: match },
            lookup,
            { $unwind: '$user_info' }
        ]).skip(record)
            .limit(3)

        const p = posts.map(e => {
            e.image = `http://localhost:4000/images/${e.image}`
            // ======================== date as DAY-MONTH-YEAR formate ======================== //
            // e.createdAt = date.toLocaleString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
            return e
        })

        res.render('postsData', { posts: p, page: pageNumber, totalPage, admin })
    } catch (error) {
        res.redirect('/api/admin/login')
    }
}

exports.successPost = async (req, res) => {
    const { id } = req.body

    const post = await POST.findById(id)

    if (post.status == true) {
        post.status = false
    } else {
        post.status = true
    }

    const updatedUser = await POST.updateOne({
        _id: post._id
    }, {
        status: post.status
    })

    res.redirect('/api/admin/posts')
}

exports.success = async (req, res) => {
    const { id } = req.body

    const user = await USER.findById(id)

    if (user.status == "Blocked") {
        user.status = "Active"
    } else {
        user.status = "Blocked"
    }

    const updatedUser = await USER.updateOne({
        _id: user._id
    }, {
        status: user.status
    })

    res.redirect('/api/admin/all-users')
}

exports.searchData = async (req, res) => {

    const searchQuery = req.body.search;
    const match = searchQuery
        ? { title: { $regex: searchQuery, $options: 'i' } } // Case-insensitive search by title
        : {}

    const page = req.body.pageIndex ? req.body.pageIndex : '1'
    const paging = page.split('"')[0]
    const pageNumber = Number(paging)
    const actualPage = pageNumber - 1
    const record = 3 * actualPage

    const seachData = await POST.aggregate([
        { $match: match },
    ]);

    const searchedPost = await POST.aggregate([
        { $match: match },
        {
            $lookup:
            {
                from: "users",
                localField: "userid",
                foreignField: "_id",
                as: "user_info"
            },
        },
        { $unwind: '$user_info' }
    ])
        .skip(record)
        .limit(3)

    const data = seachData.length;

    const totalPageCount = Math.ceil(data / 3)


    const posts = searchedPost.map(e => {
        e.image = `http://localhost:4000/images/${e.image}`
        return e
    })

    return res.json({
        success: true,
        // totaldata: data,
        dataCount: posts,
        totalPageCount,
        pageCount: pageNumber
    })

}

exports.userData = async (req, res) => {
    const match = req.body.value ? { $match: { status: req.body.value } } : { $match: {} }
    const searchValue = req.body.search_value ? { username: req.body.search_value } : {};

    const page = req.body.pageIndex ? req.body.pageIndex : '1'
    const paging = page.split('"')[0]
    const pageNumber = Number(paging)
    const actualPage = pageNumber - 1
    const record = 2 * actualPage

    const userList = await USER.aggregate([
        match
    ]);

    const users = await USER.aggregate([
        match,
        { $match: searchValue }
    ]).skip(record)
        .limit(2)

    const data = userList.length;

    const totalPageCount = Math.ceil(data / 2)

    const p = users.map(e => {
        e.image = `http://localhost:4000/images/${e.image}`
        return e
    })

    const adminId = req.session.passport.user

    const admin = await ADMIN.findById(adminId)

    admin.image = `http://localhost:4000/images/${admin.image}`

    return res.json({
        total: data,
        users: p,
        totalPageCount,
        pageCount: pageNumber,
        admin
    })
}

exports.adminProfile = async (req, res) => {
    try {
        console.log(req.session, "profile");
        const admin = await ADMIN.findById(req.session.passport.user)
        if (!admin) {
            const error = new Error('admin not found')
            throw error
        }

        admin.image = `http://localhost:4000/images/${admin.image}`

        res.render('profile', { admin })
        console.log(admin)
    } catch (error) {
        res.redirect('/api/admin/login')
    }
}

exports.updatePassword = async (req, res) => {
    try {
        const id = req.session.passport.user

        if (!id) {
            const error = new Error('admin not found')
            throw error
        }

        const admin = await ADMIN.findById(id)

        admin.image = `http://localhost:4000/images/${admin.image}`

        res.render('updateAdminPassword', { admin })
    } catch (error) {
        res.redirect('/api/admin/login')
    }
}

exports.updatePasswordByOldPassword = async (req, res) => {
    try {
        const oldpassword = req.body.oldpassword
        const newpassword = req.body.newpassword
        const id = req.session.passport.user

        const bcryptedPassword = await bcrypt.hash(newpassword, 10)

        const admin = await ADMIN.findById(id)

        const pass = await bcrypt.compare(oldpassword, admin.password)

        if (!pass) {
            const error = new Error('Old password not match please enter right password..')
            throw error
        }

        const updated = await ADMIN.findByIdAndUpdate(id,
            {
                password: bcryptedPassword
            }
        )

        return res.redirect('/api/admin/all-users')
    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        })
    }
}

exports.logoutAdmin = (req, res) => {
    try {
        const user = req.user

        if (!user) {
            const error = new Error('Admin not Found..')
            throw error
        }

        req.session.destroy()
        res.redirect('/api/admin/login')
    } catch (error) {
        res.render('errors/admin-error')
    }
}

exports.updateProfile = (req, res) => {
    try {
        const user = req.user

        if (!user) {
            const error = new Error('admin not found..')
            throw error
        }

        user.image = `http://localhost:4000/images/${user.image}`

        res.render('update-profile', { admin: user })
    } catch (error) {
        return res.redirect('/api/admin/login')
    }
}

exports.updateAdminProfile = async (req, res) => {
    try {
        const body = req.body

        const admin = req.user

        // const image = req.file.filename ? req.file.filename : admin.image
        let image;
        if (req.file) {
            image = req.file.filename;
            fs.unlink(`public/images/${admin.image}`, (e) => {
                if (e) {
                    console.log(e)
                }
                else {
                    console.log('file deleted success..')
                }
            })
        } else {
            image = admin.image
        }

        if (!admin) {
            const error = new Error('admin not found..')
            throw error
        }

        const updatedAdmin = await ADMIN.findByIdAndUpdate(admin._id, {
            name: body.name,
            email: body.email,
            address: body.address,
            mobile: body.mobile,
            image
        })

        res.redirect('/api/admin/all-users')

    } catch (error) {
        console.log(error.message)
        return res.redirect('/api/admin/login')
    }
}