#!/bin/bash

# Script untuk Setup Supabase pada DecentraNews
# Jalankan script ini setelah mendapatkan credentials dari Supabase

echo "======================================"
echo "DecentraNews Supabase Setup Script"
echo "======================================"
echo ""

# Cek apakah sudah di directory backend
if [ ! -f "prisma/schema.prisma" ]; then
    echo "❌ Error: Script harus dijalankan dari directory apps/backend"
    echo "   Jalankan: cd ~/decentranews/apps/backend"
    exit 1
fi

echo "Masukkan credentials Supabase Anda:"
echo ""
read -p "Project Reference (contoh: abcdefghijklmnop): " PROJECT_REF
read -sp "Database Password: " DB_PASSWORD
echo ""
read -p "Region (contoh: ap-southeast-1): " REGION

echo ""
echo "Membuat file .env..."

# Buat file .env
cat > .env << EOF
# DecentraNews Backend Environment Variables - Supabase

# Supabase Database Connection (Transaction Pooler)
DATABASE_URL="postgresql://postgres.${PROJECT_REF}:${DB_PASSWORD}@aws-0-${REGION}.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# Supabase Direct Connection (for migrations)
DIRECT_URL="postgresql://postgres.${PROJECT_REF}:${DB_PASSWORD}@aws-0-${REGION}.pooler.supabase.com:5432/postgres"

# Server
PORT=3000

# Frontend URL
FRONTEND_URL="https://decentranews-v2.vercel.app"

# Session Secret (auto-generated)
SESSION_SECRET="$(openssl rand -base64 32)"
EOF

echo "✅ File .env created successfully!"
echo ""
echo "Tahap selanjutnya:"
echo "1. Install dependencies: npm install"
echo "2. Generate Prisma Client: npx prisma generate"
echo "3. Create migration: npx prisma migrate dev --name init_supabase"
echo ""
echo "Jalankan perintah berikut:"
echo ""
echo "npm install && npx prisma generate && npx prisma migrate dev --name init_supabase"
echo ""
