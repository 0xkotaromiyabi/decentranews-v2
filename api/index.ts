import app from '../apps/backend/dist/index.js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Export as Vercel serverless function
export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Strip /api prefix from URL since backend routes don't expect it
    if (req.url) {
        req.url = req.url.replace(/^\/api/, '') || '/';
    }

    // Pass request to Express app
    return app(req, res);
}
