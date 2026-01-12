---
description: How to safely deploy to Vercel without stale builds
---

# Safe Deployment to Vercel

// turbo-all

## Steps

1. Clean old build artifacts:
```bash
cd ~/decentranews
rm -rf apps/backend/dist apps/frontend/dist
```

2. Deploy to Vercel:
```bash
npx vercel --prod
```

## Why This Matters

- The `dist/` folder contains compiled JavaScript
- If you edit source code but don't clean `dist/`, Vercel may use old compiled code
- This causes mysterious 500 errors where API returns stale behavior

## Quick One-Liner

```bash
rm -rf apps/backend/dist apps/frontend/dist && npx vercel --prod
```
