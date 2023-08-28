const joi = require("joi")

const postcreateSchema = joi.object({
    title: joi.string().empty().required().trim().messages({
        'any.required': 'title must be required.',
        'string.empty': 'title must be required.'
    }),
    description: joi.string().empty().required().trim().messages({
        'any.required': 'description must be required.',
        'string.empty': 'description must be required.'
    }),
    image: joi.string().trim().messages({
        'string.empty': 'email must be required.',
    }),
    status: joi.boolean().empty().messages({
        'boolean.empty': 'status must be filled..'
    }),
    coordinates: joi.string().trim().messages({
        'string.empty': 'coordinates must be required.',
    }),
})

module.exports = postcreateSchema