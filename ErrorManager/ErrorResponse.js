class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true; // Indicates if the error is user-defined
        Error.captureStackTrace(this, this.constructor);
    }
}

export default AppError;