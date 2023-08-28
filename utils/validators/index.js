// ========================= USER VALIDATION ========================//

const register = require("../validators/uservalidation/registerSchema")
const login = require("../validators/uservalidation/loginSchema")
const update = require("../validators/uservalidation/updateSchema")
const pass = require("../validators/uservalidation/passwordResetSchema")
const forgotPass = require("../validators/uservalidation/forgotPasswordSchema")

// ========================= POST VALIDATION ========================//

const createpost = require("../validators/postvalidation/createPost")
const updatepost = require("../validators/postvalidation/updatePost")

module.exports = {
    register,
    login,
    update,
    pass,
    forgotPass,
    createpost,
    updatepost
}