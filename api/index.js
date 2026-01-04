const path = require('path');

// Export as Vercel serverless function
module.exports = async function handler(req, res) {
    try {
        // Backend builds to CommonJS, so use require()
        const backendPath = path.join(__dirname, '../apps/backend/dist/index.js');

        // Clear cache for fresh instance in serverless
        delete require.cache[require.resolve(backendPath)];

        // Require the Express app
        const appModule = require(backendPath);
        const app = appModule.default || appModule;

        // Verify it's a function (Express app)
        if (typeof app !== 'function') {
            console.error('[API] Not a function:', typeof app, 'Keys:', Object.keys(appModule));
            return res.status(500).json({
                error: 'API configuration error',
                message: 'Backend not properly configured',
                debug: { type: typeof app, hasDefault: !!appModule.default }
            });
        }

        // Strip /api prefix
        if (req.url) {
            const originalUrl = req.url;
            req.url = req.url.replace(/^\/api/, '') || '/';
            console.log(`[API] ${req.method} ${originalUrl} -> ${req.url}`);
        }

        // Call Express app
        return app(req, res);
    } catch (error) {
        console.error('[API] Critical error:', error);
        return res.status(500).json({
            error: 'API handler failed',
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};
