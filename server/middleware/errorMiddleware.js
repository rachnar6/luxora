// server/middleware/errorMiddleware.js
// Custom error handling middleware with verbose logging

const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        // Log the full stack trace even in development/production for debugging 
        // (remove 'err.stack' in production for security after debugging)
        stack: err.stack, // Always show stack for debugging this 500 error
    });
    // Also log to the backend console for visibility
    console.error("Backend Error Caught:", err.message);
    console.error(err.stack);
};

export { notFound, errorHandler };
