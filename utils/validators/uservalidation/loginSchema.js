const joi = require("joi")

const loginSchema = joi.object({
    email: joi.string().required().email().trim().messages({
        'any.required': 'email must be required.',
        'string.empty': 'email must be required.',
        'string.email': 'email must be valid email'
    }),
    password: joi.string().required().min(5).trim().messages({
        'any.required': 'password must be required.',
        'string.empty': 'password must be required.',
        'string.email': 'password must have at least 5 character.'
    })
})

module.exports = loginSchema