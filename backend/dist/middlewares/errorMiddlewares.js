"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = void 0;
// Function to extract routes from Express router stack
const getRegisteredRoutes = (req) => {
    const routes = [];
    // Access the router stack
    const layers = req.app._router.stack;
    layers.forEach((layer) => {
        if (layer.route) {
            // This is a route layer
            const path = layer.route.path;
            const methods = Object.keys(layer.route.methods).map(method => method.toUpperCase());
            methods.forEach((method) => {
                routes.push({ method, path });
            });
        }
        else if (layer.name === 'router' && layer.handle.stack) {
            // This is a mounted router (e.g., app.use('/api/auth', authRoutes))
            const prefix = layer.regexp
                .toString()
                .replace('/^\\', '')
                .replace('?(?=\\/|$)/i', '')
                .replace(/\\\//g, '/')
                .replace(/^\//, '');
            // Iterate through the sub-router's stack
            layer.handle.stack.forEach((subLayer) => {
                if (subLayer.route) {
                    const subPath = subLayer.route.path;
                    const methods = Object.keys(subLayer.route.methods).map(method => method.toUpperCase());
                    const fullPath = prefix ? `/${prefix}${subPath}` : subPath;
                    methods.forEach((method) => {
                        routes.push({ method, path: fullPath });
                    });
                }
            });
        }
    });
    return routes;
};
// Middleware to catch all routes that don't exist
const notFound = (req, res, next) => {
    const errorMessage = `Resource Not Found - ${req.originalUrl}`;
    const error = new Error(errorMessage);
    const availableRoutes = getRegisteredRoutes(req);
    res.status(404).json({
        error: errorMessage,
        availableRoutes: availableRoutes.map(route => `${route.method} ${route.path}`)
    });
    next(error);
};
exports.notFound = notFound;
