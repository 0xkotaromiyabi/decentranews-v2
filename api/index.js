import { fileURLToPath } from 'url';

// Force Vercel to bundle these dependencies (they are used by the dynamic backend require)
import 'express';
import 'cors';
import 'cookie-parser';
import 'cookie-session';
import 'siwe';
import '@prisma/client';
import '@supabase/supabase-js';
import 'multiparty';
import 'thirdweb';
import 'dotenv';

// Create require for ESM
const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function handler(req, res) {
    try {
        // Resolve path relative to this file (api/index.js)
        // From api/ -> ../apps/backend/dist/index.js
        const backendPath = path.resolve(__dirname, '../apps/backend/dist/index.js');

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
        // List files to debug if module not found
        let files = [];
        try {
            const backendDir = path.resolve(__dirname, '../apps/backend/dist');
            const fs = await import('fs');
            if (fs.existsSync(backendDir)) {
                files = fs.readdirSync(backendDir);
            } else {
                files = [`Directory not found: ${backendDir}`];
            }
        } catch (e) { files = [`Error listing files: ${e.message}`]; }

        return res.status(500).json({
            error: 'API handler failed',
            message: error.message,
            stack: error.stack,
            cwd: process.cwd(),
            __dirname,
            filesInBackendDist: files
        });
    }
}
