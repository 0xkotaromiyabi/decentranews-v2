import type { VercelRequest, VercelResponse } from '@vercel/node';

// Export as Vercel serverless function
export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        // Dynamic import to ensure fresh module in serverless environment
        const appModule = await import('../apps/backend/dist/index.js');

        // Handle both default export and named export
        const app = appModule.default || appModule;

        // Verify app is a function
        if (typeof app !== 'function') {
            console.error('[API Handler] app is not a function:', typeof app, Object.keys(appModule));
            return res.status(500).json({
                error: 'API configuration error',
                message: 'Express app not properly exported'
            });
        }

        // Strip /api prefix from URL since backend routes don't expect it
        if (req.url) {
            const originalUrl = req.url;
            req.url = req.url.replace(/^\/api/, '') || '/';
            console.log(`[API Handler] ${req.method} ${originalUrl} -> ${req.url}`);
        }

        // Pass request to Express app
        return app(req, res);
    } catch (error: any) {
        console.error('[API Handler] Error:', error);
        res.status(500).json({
            error: 'API handler failed',
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}
