import AppError from './ErrorResponse.js' 

const errorHandler = (err, req, res, next) => {
    // Set default values for error response
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'Something went wrong!';

    // Log the error (you can use a logging library like Winston or Morgan)
    console.error(err);

    // Send error response
    res.status(err.statusCode).json({
        status: 'error',
        statusCode: err.statusCode,
        message: err.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }), // Include stack trace in development
    });
};
export default errorHandler;