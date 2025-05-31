const errorMiddleware = (err, req, res, next) => {
    console.error(err.stack);

    // Mongoose validation error
    if (err.name === "ValidationError") {
        const errors = Object.values(err.errors).map((error) => error.message);
        return res.status(400).json({ message: "Validation Error", errors });
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        return res.status(400).json({
            message: "Duplicate Key Error",
            field: Object.keys(err.keyValue)[0],
        });
    }

    // Mongoose cast error (invalid ID)
    if (err.name === "CastError") {
        return res
            .status(400)
            .json({ message: `Invalid ${err.path}: ${err.value}` });
    }

    // Default error
    res.status(err.statusCode || 500).json({
        message: err.message || "Internal Server Error",
        stack: process.env.NODE_ENV === "production" ? "🥞" : err.stack,
    });
};

export default errorMiddleware;
