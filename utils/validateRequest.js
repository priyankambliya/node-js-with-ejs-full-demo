const validators = require("./validators/index")

module.exports = function (validator) {
    if (!validators.hasOwnProperty(validator)) {
        throw new Error(`${validator} not exist..`)
    }
    return async function (req, res, next) {
        try {
            const validated = await validators[validator].validateAsync(req.body)
            req.body = validated
            next()
        } catch (error) {
            next(error)
        }
    }
}