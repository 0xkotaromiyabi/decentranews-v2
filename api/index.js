import { createRequire } from 'module';
import path from 'path';

// Create require for ESM
const require = createRequire(import.meta.url);

export default async function handler(req, res) {
    try {
        // Backend builds to CommonJS, so use require() via createRequire
        // Assuming the build command successfully built apps/backend/dist/index.js
        const backendPath = path.resolve(process.cwd(), 'apps/backend/dist/index.js');

        // Note: In Vercel serverless, process.cwd() is usually the project root if configured correctly,
        // but files outside the function might not be included unless traced properly.
        // Since this is a monorepo, Vercel *should* bundle the necessary files if it detects the require.

        // Clear cache for fresh instance in serverless
        try {
            delete require.cache[require.resolve(backendPath)];
        } catch (e) {
            // Ignore if strictly not found yet, module load will fail below
        }

        // Validate file existence (optional but confirms path issues)
        // const fs = require('fs');
        // if (!fs.existsSync(backendPath)) { ... }

        // Require the Express app
        const appModule = require(backendPath);
        const app = appModule.default || appModule;

        if (typeof app !== 'function') {
            console.error('[API] Not a function:', typeof app);
            return res.status(500).json({
                error: 'API configuration error',
                message: 'Backend loaded but is not a function function'
            });
        }

        // Strip /api prefix because the backend app expects /articles, not /api/articles
        if (req.url) {
            req.url = req.url.replace(/^\/api/, '') || '/';
        }

        // Call Express app
        return app(req, res);
    } catch (error) {
        console.error('[API] Critical error:', error);
        return res.status(500).json({
            error: 'API handler failed',
            message: error.message,
            // Only show stack in dev or if needed for debugging
            stack: error.stack,
            cwd: process.cwd()
        });
    }
}
