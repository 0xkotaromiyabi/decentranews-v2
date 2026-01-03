# 🚀 Quick Deployment Checklist

Follow these steps in order to deploy your application to production.

## ✅ Pre-Deployment Checklist

- [ ] Neon database created
- [ ] Neon connection string obtained
- [ ] CoinMarketCap API key obtained (optional, for crypto ticker)
- [ ] GitHub repository up to date
- [ ] Vercel account ready

---

## 📋 Step-by-Step Deployment

### Step 1: Create Neon Database

```bash
# 1. Go to https://console.neon.tech/
# 2. Click "Create Project"
# 3. Name it: "decentranews"
# 4. Copy the connection string
# 5. Save it somewhere safe (you'll need it for Vercel)
```

### Step 2: Initialize Database Schema

```bash
# From your local machine, run:
cd ~/decentranews/apps/backend

# Set your Neon connection string (temporary, just for migration)
export DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/decentranews?sslmode=require"

# Push schema to Neon
npx prisma db push

# Verify it worked
npx prisma studio
# This opens a browser interface to view your database
```

### Step 3: Push Code to GitHub

```bash
cd ~/decentranews

# Add all changes
git add .

# Commit
git commit -m "Configure for Vercel serverless deployment with Neon"

# Push to GitHub
git push origin main
```

### Step 4: Configure Vercel

**4.1 Connect Repository to Vercel**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import `decentranews-v2` repository
4. Select the repository

**4.2 Configure Build Settings**
- Framework Preset: `Other`
- Root Directory: `./` (leave empty)
- Build Command: (leave default from vercel.json)
- Output Directory: (leave default from vercel.json)

**4.3 Add Environment Variables**

Click "Environment Variables" and add these:

| Name | Value | Environment |
|------|-------|-------------|
| `DATABASE_URL` | `postgresql://user:pass@ep-xxx.neon.tech/decentranews?sslmode=require` | Production, Preview, Development |
| `CMC_API_KEY` | Your CoinMarketCap API Key | Production, Preview, Development |
| `SESSION_SECRET` | Run `openssl rand -hex 32` to generate | Production, Preview, Development |
| `VITE_API_URL` | `/api` | Production, Preview, Development |

**4.4 Deploy**
- Click "Deploy"
- Wait for deployment to complete (2-3 minutes)

### Step 5: Verify Deployment

```bash
# Replace YOUR_DOMAIN with your actual Vercel domain
# Example: decentranews-v2.vercel.app

# Test API is running
curl https://YOUR_DOMAIN.vercel.app/api

# Test nav pages endpoint
curl https://YOUR_DOMAIN.vercel.app/api/nav-pages

# Test articles endpoint  
curl https://YOUR_DOMAIN.vercel.app/api/articles
```

### Step 6: Test Frontend

1. Open `https://YOUR_DOMAIN.vercel.app` in browser
2. Open browser DevTools (F12) → Console
3. Check for any errors
4. Verify:
   - [ ] Navigation menu loads
   - [ ] Articles display
   - [ ] Images load
   - [ ] Wallet connection works

---

## 🔧 Troubleshooting

### Database Connection Error
```
Error: Can't reach database server
```
**Solution**: 
- Check `DATABASE_URL` in Vercel environment variables
- Ensure it includes `?sslmode=require`
- Verify Neon database is active (not paused)

### Build Failed - Prisma Error
```
Error: Prisma schema not found
```
**Solution**:
- Check Vercel build logs
- Ensure `npx prisma generate` runs during build
- Verify `vercel-build` script in backend package.json

### API Returns 404
```
GET /api/articles → 404
```
**Solution**:
- Check `/api/index.ts` file exists at project root
- Verify `rewrites` in `vercel.json` is configured correctly
- Redeploy the project

### CORS Error in Browser
```
Access to fetch at '/api/articles' has been blocked by CORS
```
**Solution**:
- Check backend CORS configuration includes Vercel URL
- Verify `FRONTEND_URL` environment variable is set correctly
- Clear browser cache and retry

---

## 📞 Need Help?

Check these resources:
- [Vercel Deployment Docs](https://vercel.com/docs)
- [Neon Database Docs](https://neon.tech/docs)
- [Prisma with Neon](https://www.prisma.io/docs/guides/database/neon)

## ✨ Post-Deployment

After successful deployment:

1. **Add Initial Content**
   - Create admin articles via dashboard
   - Test NFT minting functionality
   - Verify all features work

2. **Set Up Monitoring** (Optional)
   - Configure Vercel Analytics
   - Set up error tracking (Sentry)
   - Monitor Neon database usage

3. **Configure Domain** (Optional)
   - Add custom domain in Vercel
   - Configure DNS settings
   - Enable SSL (automatic with Vercel)
