const AppError = require("../utils/AppError");

module.exports = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            // BUG-17 fix: abortEarly:false collects ALL errors; send them all, not just details[0]
            const message = error.details.map(d => d.message).join("; ");
            return next(new AppError(message, 400));
        }
        
        req.body = value;
        next();
    };
};
