"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Wraps an asynchronous route handler function to catch errors and pass them to the next middleware.
 *
 * @param fn - The asynchronous function to wrap.
 * @returns A function that executes the async function and catches any errors.
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.default = asyncHandler;
