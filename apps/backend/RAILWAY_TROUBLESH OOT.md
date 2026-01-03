# Troubleshooting Railway Deployment

## Error: Prisma schema validation - (get-config wasm)

### Penyebab

Prisma membutuhkan `DATABASE_URL` untuk validasi schema, tapi Railway belum provision PostgreSQL atau environment variable belum di-set.

### Solusi 1: Pastikan PostgreSQL sudah di-add

```bash
# Check apakah PostgreSQL service sudah ada
railway status

# Jika belum, add PostgreSQL
railway add
# Pilih: PostgreSQL
```

### Solusi 2: Set DATABASE_URL secara manual (temporary)

Jika PostgreSQL sudah ada tapi masih error:

```bash
# Get DATABASE_URL from Railway
railway variables

# Link ulang project
railway link
```

### Solusi 3: Deploy tanpa Prisma validation

Jika masih error, kita bisa skip validation dengan cara:

1. **Buat Nixpacks config file**:

```bash
# Di directory apps/backend
touch nixpacks.toml
```

2. **Isi nixpacks.toml**:
```toml
[phases.setup]
nixPkgs = ["nodejs", "pnpm"]

[phases.install]
cmds = [
    "pnpm install --frozen-lockfile"
]

[phases.build]
cmds = [
    "npx prisma generate",
    "npx tsc"
]

[start]
cmd = "npx prisma migrate deploy && node dist/index.js"
```

3. **Deploy ulang**:
```bash
railway up
```

### Solusi 4: Deploy via Railway Dashboard (Recommended)

Daripada pakai CLI, lebih mudah pakai dashboard:

1. **Login ke** https://railway.app
2. **New Project** → **Deploy from GitHub repo**
3. **Connect GitHub** → Pilih repository `decentranews`
4. **Add PostgreSQL** service
5. **Set Root Directory**: `apps/backend`
6. **Environment Variables**:
   - `FRONTEND_URL`: https://decentranews-v2.vercel.app
   - `PORT`: 3000
   - `CMC_API_KEY`: (optional)
7. **Deploy**

Railway akan auto-detect Prisma dan setup DATABASE_URL.

### Solusi 5: Cek Railway Logs

```bash
# Lihat error detail
railway logs

# Lihat environment variables
railway variables
```

### Quick Fix Command Sequence

Jalankan ini secara berurutan:

```bash
cd ~/decentranews/apps/backend

# Ensure Railway project linked
railway link

# Add PostgreSQL if not exists
railway add

# Wait 30 seconds for PostgreSQL to provision
sleep 30

# Check if DATABASE_URL is set
railway variables | grep DATABASE_URL

# If DATABASE_URL exists, try deploy again
railway up --detach

# Monitor logs
railway logs
```

## Alternative: Deploy Manual Steps

Jika CLI terus bermasalah, pilih opsi manual:

1. **Build locally dulu**:
```bash
cd ~/decentranews/apps/backend

# Set temporary DATABASE_URL for build
export DATABASE_URL="postgresql://temp:temp@localhost:5432/temp"

# Build
pnpm run build

# Check if dist/ created
ls -la dist/
```

2. **Push ke Git**:
```bash
git add .
git commit -m "fix: update Railway config"
git push
```

3. **Deploy via Railway GitHub integration**

Ini lebih reliable karena Railway punya kontrol penuh atas build process.
