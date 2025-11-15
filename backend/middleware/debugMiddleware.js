// backend/middleware/debugMiddleware.js
const debugResponse = (req, res, next) => {
    // Store the original json method
    const originalJson = res.json;

    // Override json method
    res.json = function (data) {
        console.log('API Response:', {
            path: req.originalUrl,
            method: req.method,
            isArray: Array.isArray(data),
            dataType: typeof data
        });

        // Call original json method
        return originalJson.call(this, data);
    };

    next();
};

module.exports = { debugResponse };