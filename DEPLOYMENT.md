# DecentraNews Production Deployment Guide

## 1. Setup Neon Database

### Create Neon Account & Database
1. Go to [Neon Console](https://console.neon.tech/)
2. Sign up or log in
3. Create a new project named "decentranews"
4. Copy the connection string (it looks like: `postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require`)

### Initialize Database Schema
After getting your Neon connection string, run locally:

```bash
cd ~/decentranews/apps/backend

# Set your Neon database URL temporarily
export DATABASE_URL="your-neon-connection-string"

# Push schema to Neon database
npx prisma db push

# Generate Prisma client
npx prisma generate
```

## 2. Configure Vercel Environment Variables

Go to your Vercel project settings → Environment Variables and add:

### Backend Variables (for /api routes)
```
DATABASE_URL=<your-neon-connection-string>
FRONTEND_URL=<your-vercel-frontend-url>
CMC_API_KEY=<your-coinmarketcap-api-key>
SESSION_SECRET=<generate-random-32-char-string>
```

### Frontend Variables
```
VITE_API_URL=/api
```

> **Note**: We use `/api` instead of full URL because the backend and frontend are on the same Vercel domain.

## 3. Deploy to Vercel

### Option A: Deploy via Git (Recommended)
1. Push your code to GitHub:
```bash
cd ~/decentranews
git add .
git commit -m "Add Vercel serverless backend configuration"
git push origin main
```

2. Vercel will automatically detect the changes and redeploy

### Option B: Deploy via Vercel CLI
```bash
# Install Vercel CLI if not already installed
npm install -g vercel

# Deploy from project root
cd ~/decentranews
vercel --prod
```

## 4. Verify Deployment

After deployment completes, test these endpoints:

```bash
# Replace YOUR_DOMAIN with your actual Vercel domain
curl https://YOUR_DOMAIN.vercel.app/api
# Should return: "DecentraNews API is running"

curl https://YOUR_DOMAIN.vercel.app/api/nav-pages
# Should return navigation pages JSON

curl https://YOUR_DOMAIN.vercel.app/api/articles
# Should return articles JSON
```

## 5. Test Frontend Connection

1. Visit your Vercel frontend URL
2. Check browser console for any errors
3. Verify navigation menu loads
4. Verify articles display
5. Test wallet authentication

## Troubleshooting

### Database Connection Issues
- Ensure `DATABASE_URL` includes `?sslmode=require` for Neon
- Verify connection string is correct in Vercel environment variables
- Check Prisma was generated during build (check Vercel build logs)

### CORS Issues
- Verify `FRONTEND_URL` matches your Vercel domain
- Use relative URL `/api` in frontend instead of absolute URL

### Build Failures
- Check Vercel build logs for specific errors
- Ensure all dependencies are in package.json
- Verify Prisma schema is valid

## Environment Variables Reference

Create a `.env.production` file locally for reference (DO NOT COMMIT):

```env
# Database
DATABASE_URL="postgresql://user:password@ep-xxx.neon.tech/dbname?sslmode=require"

# API Configuration
PORT=3000
FRONTEND_URL="https://your-app.vercel.app"

# External Services
CMC_API_KEY="your-coinmarketcap-api-key"

# Security
SESSION_SECRET="random-32-character-string-here"
```

## Next Steps After Deployment

1. Seed initial data if needed:
```bash
# Update seed script with production data
npx tsx apps/backend/src/seed.ts
```

2. Monitor deployment:
- Check Vercel dashboard for logs
- Monitor Neon database dashboard for queries
- Set up error tracking (optional)

3. Update frontend repository environment variables if separate repo
