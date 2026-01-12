import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import path from 'path';

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
        // Backend builds to CommonJS, so use require() via createRequire
        // Using explicit relative path from __dirname (api/) to dist (apps/backend/dist)
        const backendPath = path.resolve(__dirname, '../apps/backend/dist/index.js');

        // Clear cache for fresh instance in serverless
        try {
            delete require.cache[require.resolve(backendPath)];
        } catch (e) {
            // Ignore if strictly not found yet, module load will fail below
        }

        // Require the Express app
        const appModule = require(backendPath);
        const app = appModule.default || appModule;

        if (typeof app !== 'function') {
            console.error('[API] Not a function:', typeof app);
            return res.status(500).json({
                error: 'API configuration error',
                message: 'Backend loaded but is not a function'
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

        // Detailed debug info for Vercel logs
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
