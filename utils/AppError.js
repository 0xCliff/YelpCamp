class AppError extends Error {
    constructor(errMessage, statusCode) {
        super();
        this.errMessage = errMessage;
        this.statusCode = statusCode;
    }
}

module.exports = AppError;