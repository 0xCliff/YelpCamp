const Joi = require("joi");
const AppError = require('../utils/AppError');
const { campgroundSchema } = require('../db/schemas');

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    
    if(error) {
        const msg = error.details.map(el => el.message).join(",");
        throw new AppError(msg, 400);
    } else {
        next();
    }
}

module.exports = validateCampground;