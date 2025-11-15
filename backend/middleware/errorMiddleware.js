// backend/middleware/errorMiddleware.js
const notFound = (req, res, next) => {
    console.log(`Route not found: ${req.originalUrl}`);
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    console.log(`Error handler: ${err.message}`);

    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
        error: true
    });
};

module.exports = { notFound, errorHandler };