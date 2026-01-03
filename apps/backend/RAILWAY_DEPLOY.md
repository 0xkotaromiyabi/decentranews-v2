# Railway Deployment Guide - DecentraNews Backend

## Prerequisite

Install Railway CLI:
```bash
npm install -g @railway/cli
```

## Step 1: Initialize Railway Project

```bash
# Navigate to backend directory
cd ~/decentranews/apps/backend

# Login to Railway
railway login

# Initialize new project
railway init
```

Pilih:
- **Create new project**: Yes
- **Project name**: decentranews-backend (atau nama lain)

## Step 2: Add PostgreSQL Database

```bash
# Add PostgreSQL service
railway add
```

Pilih: **PostgreSQL**

Railway akan otomatis membuat `DATABASE_URL` environment variable.

## Step 3: Configure Environment Variables

Buka Railway dashboard atau gunakan CLI:

```bash
# Set FRONTEND_URL (ganti dengan Vercel URL Anda)
railway variables set FRONTEND_URL=https://decentranews-v2.vercel.app

# Set PORT (optional, default 3000)
railway variables set PORT=3000

# Set CMC_API_KEY (jika punya)
railway variables set CMC_API_KEY=your_api_key_here

# Set SESSION_SECRET
railway variables set SESSION_SECRET=$(openssl rand -base64 32)
```

## Step 4: Deploy Backend

```bash
# Deploy from backend directory
railway up
```

Railway akan:
1. Install dependencies
2. Build TypeScript
3. Run Prisma migrations
4. Start server

## Step 5: Get Railway URL

```bash
# Get your deployment URL
railway domain
```

Atau check di Railway dashboard.

## Step 6: Run Initial Migration

```bash
# Connect to your Railway project
railway run npx prisma migrate dev --name init
```

## Step 7: Update Frontend API_URL

Setelah backend deployed, update frontend:

1. Edit `apps/frontend/src/api.ts`
2. Ganti `API_URL` dengan Railway URL Anda
3. Redeploy frontend ke Vercel

## Verifikasi

Test API endpoints:

```bash
# Health check
curl https://your-railway-url.railway.app/

# Get articles
curl https://your-railway-url.railway.app/articles

# Get nonce
curl https://your-railway-url.railway.app/nonce
```

## Troubleshooting

### Database Connection Error
```bash
# Check DATABASE_URL
railway variables

# Reconnect
railway link
```

### Build Fails
```bash
# Check build logs
railway logs

# Redeploy
railway up --detach
```

### CORS Error
Pastikan `FRONTEND_URL` di Railway sudah benar:
```bash
railway variables set FRONTEND_URL=https://your-exact-vercel-url.vercel.app
```

## Useful Commands

```bash
# View logs
railway logs

# Open Railway dashboard
railway open

# List environment variables
railway variables

# Connect to database
railway connect postgres
```
