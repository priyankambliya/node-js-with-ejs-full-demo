const joi = require("joi")

const loginSchema = joi.object({
    oldPassword: joi.string().required().min(5).trim().messages({
        'any.required': 'password must be required.',
        'string.empty': 'password must be required.',
        'string.email': 'password must have at least 5 character.'
    }),
    newPassword: joi.string().required().min(5).trim().messages({
        'any.required': 'password must be required.',
        'string.empty': 'password must be required.',
        'string.email': 'password must have at least 5 character.'
    })
})

module.exports = loginSchema