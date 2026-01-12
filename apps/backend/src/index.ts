import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import cookieSession from 'cookie-session';
import { generateNonce, SiweMessage } from 'siwe';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import multiparty from 'multiparty';
import fs from 'fs';
import path from 'path';
// import { handleX402Payment } from './x402'; // Import the controller

const app = express();
const PORT = process.env.PORT || 3000;
const prisma = new PrismaClient();

// Initialize Supabase client
// Use Service Role Key for backend operations (bypasses RLS)
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

if (!supabase) {
    console.warn('[Warning] Supabase client not initialized - SUPABASE_URL or SUPABASE_KEY missing');
}

const generateSlug = (text: string) => {
    return text
        .toLowerCase()
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-');
};

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

const ADMINS = [
    '0x242dfb7849544ee242b2265ca7e585bdec60456b',
    '0xdbca8ab9eb325a8f550ffc6e45277081a6c7d681'
];

// File upload constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];

// CORS Configuration - Allow frontend origins
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
    'http://localhost:5177',
    'http://localhost:5178',
    'http://localhost:5179',
    'http://localhost:5180',
    // Add Vercel frontend URL from environment variable
    process.env.FRONTEND_URL,
    // Common Vercel patterns
    'https://decentranews-v2-ncpeswibn-wahyudieko87s-projects.vercel.app',
    'https://decentranews-v2.vercel.app'
].filter(Boolean); // Remove undefined values

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);

        // Check if origin is in allowed list or matches Vercel pattern
        if (allowedOrigins.includes(origin) || origin.includes('vercel.app')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(cookieSession({
    name: 'session',
    keys: ['secret_key'],
    maxAge: 24 * 60 * 60 * 1000
}));

// app.use('/uploads', express.static(process.env.VERCEL ? '/tmp/uploads' : 'uploads'));

app.get('/nonce', function (req: any, res) {
    req.session.nonce = generateNonce();
    res.setHeader('Content-Type', 'text/plain');
    res.send(req.session.nonce);
});

app.post('/verify', async function (req: any, res) {
    try {
        if (!req.body.message) {
            res.status(422).json({ message: 'Expected prepareMessage object as body.' });
            return;
        }
        const message = new SiweMessage(req.body.message);
        const fields = await message.verify({ signature: req.body.signature, nonce: req.session.nonce });

        req.session.siwe = fields.data;
        req.session.nonce = null;

        res.json({ ok: true, data: fields.data });
    } catch (e: any) {
        req.session.siwe = null;
        req.session.nonce = null;
        console.error(e);
        res.status(401).json({ message: e.message });
    }
});

app.get('/me', async (req: any, res) => {
    if (!req.session?.siwe) {
        res.status(401).json({ message: 'You have to first sign_in' });
        return;
    }
    const address = req.session.siwe.address;

    // Get or Create user to ensure roles are synced
    let dbUser = await prisma.user.findUnique({ where: { address } });
    if (!dbUser) {
        const role = ADMINS.includes(address.toLowerCase()) ? 'ADMIN' : 'USER';
        dbUser = await prisma.user.create({ data: { address, role } });
    } else {
        // Force sync status for hardcoded admins if they exist but have wrong role
        const expectedRole = ADMINS.includes(address.toLowerCase()) ? 'ADMIN' : dbUser.role;
        if (dbUser.role !== expectedRole) {
            dbUser = await prisma.user.update({ where: { id: dbUser.id }, data: { role: expectedRole } });
        }
    }

    if (!dbUser) return res.status(500).json({ error: 'User sync failed' });

    res.json({ address, isAdmin: dbUser.role === 'ADMIN' || dbUser.role === 'EDITOR', role: dbUser.role });
});

app.get('/articles', async (req: any, res) => {
    try {
        const isAdmin = req.session?.siwe?.address && ADMINS.includes(req.session.siwe.address.toLowerCase());

        let whereClause = {};
        if (!isAdmin) {
            whereClause = {
                status: 'PUBLISHED'
            };
        }

        const articles = await prisma.article.findMany({
            where: {
                ...whereClause,
                ...(isAdmin ? {} : { type: 'POST' })
            },
            include: { author: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(articles);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to fetch articles' });
    }
});

// x402 Payment Endpoint for Premium Articles (TEMPORARILY DISABLED - thirdweb dependency missing)
// app.get('/articles/premium/:id', handleX402Payment);

// Temporary stub for premium articles endpoint while x402 is disabled
app.get('/articles/premium/:id', async (req: any, res) => {
    const { id } = req.params;
    try {
        // For now, return a message that premium features are in development
        res.status(503).json({
            error: 'Premium content feature is temporarily disabled',
            message: 'x402 payment integration is under maintenance. Please check back later.',
            articleId: id
        });
    } catch (e) {
        console.error('Error in premium endpoint:', e);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/nav-pages', async (req, res) => {
    try {
        const pages = await prisma.article.findMany({
            where: {
                type: 'PAGE',
                status: 'PUBLISHED'
            },
            select: {
                id: true,
                title: true
            }
        });
        res.json(pages);
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch nav pages' });
    }
});

app.get('/articles/:id', async (req: any, res) => {
    const { id } = req.params;
    console.log(`--- GET /articles/${id} Request Received ---`);
    try {
        const isUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);

        const article = await prisma.article.findUnique({
            where: isUUID ? { id } : { slug: id },
            include: { author: true }
        });

        if (!article) {
            console.log(`Article with ${isUUID ? 'ID' : 'slug'} ${id} not found.`);
            return res.status(404).json({ error: 'Not found' });
        }
        console.log(`Article found:`, article.title);
        res.json(article);
    } catch (e) {
        console.error('Error fetching article:', e);
        res.status(500).json({ error: 'Internal error' });
    }
});

// Debug endpoint to verify Supabase Storage connection
app.get('/test-storage', async (req, res) => {
    try {
        if (!supabase) {
            return res.status(503).json({ success: 0, error: 'Supabase not configured' });
        }
        console.log('Testing Supabase Storage connection...');
        console.log('URL:', process.env.SUPABASE_URL);
        // Don't log full key for security
        console.log('Key present:', !!process.env.SUPABASE_ANON_KEY);

        const { data, error } = await supabase.storage.listBuckets();

        if (error) {
            console.error('Supabase List Buckets Error:', error);
            return res.status(500).json({
                success: 0,
                error: 'Failed to list buckets',
                details: error.message
            });
        }

        const bucket = data.find(b => b.name === 'article-images');

        res.json({
            success: 1,
            message: 'Supabase Storage Connected',
            buckets: data.map(b => b.name),
            targetBucketExists: !!bucket,
            bucketDetails: bucket
        });
    } catch (e: any) {
        console.error('Storage Test Error:', e);
        res.status(500).json({ success: 0, error: e.message, stack: e.stack });
    }
});

// Debug endpoint to verify Supabase Storage upload
app.get('/test-upload', async (req, res) => {
    try {
        if (!supabase) {
            return res.status(503).json({ success: 0, error: 'Supabase not configured' });
        }
        console.log('Testing Supabase Storage upload...');

        const testFileName = `test-${Date.now()}.txt`;
        const fileContent = 'Hello Supabase Storage!';

        // Try to upload directly
        const { data, error } = await supabase.storage
            .from('article-images')
            .upload(testFileName, fileContent, {
                contentType: 'text/plain',
                upsert: true
            });

        if (error) {
            console.error('Supabase Upload Test Error:', error);
            // Check for specific row security violation error
            return res.status(500).json({
                success: 0,
                message: 'Upload Failed',
                error: error.message,
                details: error
            });
        }

        // Get public URL
        const { data: { publicUrl } } = supabase!.storage
            .from('article-images')
            .getPublicUrl(testFileName);

        res.json({
            success: 1,
            message: 'Supabase Storage Verified',
            uploadResult: data,
            publicUrl: publicUrl,
            bucket: 'article-images'
        });

    } catch (e: any) {
        console.error('Storage Test Error:', e);
        res.status(500).json({ success: 0, error: e.message, stack: e.stack });
    }
});

app.post('/upload', (req: any, res) => {
    const form = new multiparty.Form();

    form.parse(req, async (err: any, fields: any, files: any) => {
        try {
            if (err) {
                console.error('Form parse error:', err);
                return res.status(400).json({ success: 0, error: 'Failed to parse upload' });
            }

            const file = files.image?.[0];
            if (!file) {
                return res.status(400).json({ success: 0, error: 'No file uploaded' });
            }

            // Validate file type
            const contentType = file.headers?.['content-type'] || '';
            if (!ALLOWED_IMAGE_TYPES.includes(contentType)) {
                return res.status(400).json({ success: 0, error: 'Only image files are allowed (jpg, png, gif, webp)' });
            }

            // Validate file size
            if (file.size > MAX_FILE_SIZE) {
                return res.status(400).json({ success: 0, error: 'File too large (max 10MB)' });
            }

            // Generate unique filename
            const ext = path.extname(file.originalFilename || '.jpg');
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`;

            // Read file buffer
            const fileBuffer = fs.readFileSync(file.path);

            // Upload to Supabase Storage
            if (!supabase) {
                return res.status(503).json({ success: 0, error: 'Supabase not configured' });
            }
            const { data, error: uploadError } = await supabase.storage
                .from('article-images')
                .upload(fileName, fileBuffer, {
                    contentType: contentType,
                    upsert: false
                });

            if (uploadError) {
                console.error('Supabase upload error:', uploadError);
                return res.status(500).json({ success: 0, error: uploadError.message });
            }

            // Get public URL
            const { data: { publicUrl } } = supabase!.storage
                .from('article-images')
                .getPublicUrl(fileName);

            // Clean up temp file
            try {
                fs.unlinkSync(file.path);
            } catch (cleanupError) {
                console.warn('Failed to cleanup temp file:', cleanupError);
            }

            console.log('File uploaded successfully:', publicUrl);

            res.json({
                success: 1,
                file: {
                    url: publicUrl
                }
            });
        } catch (e: any) {
            console.error('Upload error:', e);
            res.status(500).json({
                success: 0,
                error: 'File upload failed',
                message: e.message
            });
        }
    });
});

app.post('/articles', async (req: any, res) => {
    const { title, content, status, category, type, slug, excerpt, featuredImage, seoTitle, seoDescription, nftTransactionHash, nftMetadataUri } = req.body;
    let address = req.session?.siwe?.address || ADMINS[0];

    try {
        let user = await prisma.user.findUnique({ where: { address } });
        if (!user) {
            user = await prisma.user.create({ data: { address } });
        }

        const baseSlug = slug || generateSlug(title);
        // Ensure slug uniqueness
        let finalSlug = baseSlug;
        let count = 0;
        while (await prisma.article.findUnique({ where: { slug: finalSlug } })) {
            count++;
            finalSlug = `${baseSlug}-${count}`;
        }

        const article = await prisma.article.create({
            data: {
                title,
                content,
                status: status || 'DRAFT',
                category: category || 'General',
                type: type || 'POST',
                slug: finalSlug,
                excerpt,
                featuredImage,
                seoTitle,
                seoDescription,
                nftTransactionHash,
                nftMetadataUri,
                publishedAt: new Date(),
                authorId: user.id
            }
        });
        res.json(article);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to create article' });
    }
});

app.put('/articles/:id', async (req: any, res) => {
    const { id } = req.params;
    try {
        const { title, content, status, category, type, slug, excerpt, featuredImage, seoTitle, seoDescription, nftTransactionHash, nftMetadataUri } = req.body;

        const data: any = {
            title,
            content,
            status,
            category,
            type,
            excerpt,
            featuredImage,
            seoTitle,
            seoDescription,
            nftTransactionHash,
            nftMetadataUri
        };

        if (slug) {
            data.slug = slug;
        }

        const article = await prisma.article.update({
            where: { id },
            data
        });
        res.json(article);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to update article' });
    }
});

app.delete('/articles/:id', async (req: any, res) => {
    const { id } = req.params;
    try {
        await prisma.article.delete({ where: { id } });
        res.json({ ok: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to delete article' });
    }
});

// Crypto Price Endpoint (Proxy for CoinMarketCap API)
app.get('/crypto', async (req: any, res) => {
    try {
        const apiKey = process.env.CMC_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'CoinMarketCap API key not configured' });
        }

        const response = await fetch(
            'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?limit=20&convert=USD',
            {
                headers: {
                    'X-CMC_PRO_API_KEY': apiKey,
                },
            }
        );

        if (!response.ok) {
            throw new Error(`CoinMarketCap API error: ${response.status}`);
        }

        const data = await response.json();
        res.json(data);
    } catch (e: any) {
        console.error('Error fetching crypto data:', e);
        res.status(500).json({ error: 'Failed to fetch crypto data', message: e.message });
    }
});


app.get('/', (req, res) => {
    res.send('DecentraNews API is running');
});

// Keep process alive hack (only if not in Vercel)
if (!process.env.VERCEL) {
    setInterval(() => { }, 1000);
}

const startServer = () => {
    if (process.env.VERCEL) return null;
    return app.listen(Number(PORT), '0.0.0.0', () => {
        console.log(`Server is running on http://0.0.0.0:${PORT}`);
    });
};

const server = startServer();

if (server) {
    process.on('SIGTERM', () => {
        console.log('SIGTERM signal received: closing HTTP server');
        server.close(() => {
            console.log('HTTP server closed');
        });
    });
}

export default app;

process.on('exit', (code) => {
    console.log(`Process exited with code: ${code}`);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
