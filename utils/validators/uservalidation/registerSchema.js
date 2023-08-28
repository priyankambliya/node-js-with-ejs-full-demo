const joi = require("joi")

const registerUserSchema = joi.object({
    username: joi.string().empty().required().trim().messages({
        'any.required': 'username must be required.',
        'string.empty': 'username must be required.'
    }),
    email: joi.string().required().email().trim().messages({
        'any.required': 'email must be required.',
        'string.empty': 'email must be required.',
        'atring.email': 'email must be in valid email form..'
    }),
    password: joi.string().required().min(6).max(15).trim().messages({
        'any.required': 'password must be required.',
        'string.empty': 'password must be required.',
        'string.min': 'password must be at least 6 char.',
        'string.max': 'password max length 15 char.',
    }),
    coordinates: joi.string().trim().messages({
        'string.empty': 'coordinates must be required.',
    }),
})

module.exports = registerUserSchema