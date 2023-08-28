const joi = require("joi")

const loginSchema = joi.object({
    email: joi.string().email().trim().messages({
        'string.empty': 'email must be required.',
        'string.email': 'email must be valid email'
    }),
    otp: joi.string().trim().messages({
        'string.empty': 'otp must be required.',
    }),
    password: joi.string().min(5).trim().messages({
        'string.empty': 'password must be required.',
        'string.email': 'password must have at least 5 character.'
    })
})

module.exports = loginSchema