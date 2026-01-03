#!/bin/bash
# Fix for Vercel deployment - Regenerate pnpm lockfile

echo "🔧 Fixing outdated pnpm lockfile..."

# Navigate to project directory
cd ~/decentranews

# Remove old lockfile
echo "📦 Removing outdated pnpm-lock.yaml..."
rm -f pnpm-lock.yaml

# Reinstall with pnpm 9.15.4 to regenerate lockfile
echo "🔄 Running pnpm install to regenerate lockfile..."
pnpm install

echo "✅ Lockfile regenerated successfully!"
echo ""
echo "📤 Next steps:"
echo "1. Run: git add pnpm-lock.yaml .npmrc vercel.json package.json"
echo "2. Run: git commit -m 'fix: regenerate lockfile and update Vercel config'"
echo "3. Run: vercel --prod"
echo ""
echo "Or deploy directly:"
echo "  vercel --prod"
