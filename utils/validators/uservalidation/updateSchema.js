const joi = require("joi")

const updateUserSchema = joi.object({
    mobile: joi.string().required().trim().messages({
        'any.required': 'mobile must be required.',
        'string.empty': 'mobile must be required.',
    }),

    dob: joi.string().required().trim().messages({
        'any.required': 'dob must be required.',
        'string.empty': 'dob must be required.',
    }),
    address: joi.string().required().trim().messages({
        'any.required': 'address must be required.',
        'string.empty': 'address must be required.',
    }),
})

module.exports = updateUserSchema