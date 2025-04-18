"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = void 0;
//Middleware to catch all routes that dont exist 
const notFound = (req, res, next) => {
    const error = new Error(`Resource Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};
exports.notFound = notFound;
