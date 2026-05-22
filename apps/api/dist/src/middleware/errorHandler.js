"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(statusCode).json({
        success: false,
        error: {
            code: err.code || 'INTERNAL_ERROR',
            message: message,
            details: err.details || [],
        },
        requestId: req.id,
    });
};
exports.errorHandler = errorHandler;
