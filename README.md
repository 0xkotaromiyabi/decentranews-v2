# DecentraNews - Decentralized News Platform

A Web3-powered news platform with NFT capabilities, built on blockchain technology.

## Architecture

- **Frontend**: React + Vite + TypeScript (Deployed on Vercel)
- **Backend**: Express + Prisma (Serverless on Vercel)
- **Database**: PostgreSQL (Neon)
- **Blockchain**: Thirdweb SDK
- **Authentication**: SIWE (Sign-In with Ethereum)

## Project Structure

```
decentranews/
├── apps/
│   ├── frontend/          # React frontend application
│   └── backend/           # Express API server
├── api/                   # Vercel serverless functions
│   └── index.ts          # API entry point
├── packages/             # Shared packages
├── DEPLOY_CHECKLIST.md   # Step-by-step deployment guide
├── DEPLOYMENT.md         # Detailed deployment documentation
└── vercel.json           # Vercel configuration
```

## Quick Start

### Local Development

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Start PostgreSQL database**
   ```bash
   docker-compose up -d postgres
   ```

3. **Configure environment**
   ```bash
   # Backend
   cd apps/backend
   cp .env.example .env
   # Edit .env with your values
   
   # Initialize database
   npx prisma db push
   ```

4. **Run development servers**
   ```bash
   # From project root
   pnpm run dev
   ```

   This will start:
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3000

## Production Deployment

### Prerequisites
- [Vercel Account](https://vercel.com)
- [Neon Database Account](https://neon.tech)
- [GitHub Account](https://github.com)

### Deployment Steps

Follow the detailed guide in **[DEPLOY_CHECKLIST.md](./DEPLOY_CHECKLIST.md)**

Quick overview:
1. Create Neon database
2. Initialize database schema
3. Push code to GitHub
4. Configure Vercel environment variables
5. Deploy via Vercel

## Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://..."
CMC_API_KEY="your-coinmarketcap-key"
SESSION_SECRET="random-32-char-string"
FRONTEND_URL="https://your-app.vercel.app"
```

### Frontend (.env)
```env
VITE_API_URL="/api"  # For production
# or
VITE_API_URL="http://localhost:3000"  # For local development
```

See [.env.production.example](./.env.production.example) for full reference.

## Documentation

- **[DEPLOY_CHECKLIST.md](./DEPLOY_CHECKLIST.md)** - Step-by-step deployment guide
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Detailed deployment documentation
- **[.env.production.example](./.env.production.example)** - Environment variables template

## Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- TanStack Query
- Thirdweb SDK
- EditorJS

### Backend
- Node.js
- Express
- Prisma ORM
- PostgreSQL
- SIWE Authentication

### DevOps
- Vercel (Hosting)
- Neon (Database)
- Docker (Local Development)
- pnpm (Package Manager)
- Turborepo (Monorepo)

## Available Scripts

```bash
# Development
pnpm run dev          # Start all services in development mode

# Build
pnpm run build        # Build all packages

# Database
cd apps/backend
npx prisma studio     # Open Prisma Studio
npx prisma migrate    # Run migrations
npx prisma generate   # Generate Prisma Client

# Deployment
vercel --prod         # Deploy to production
```

## Authentication

The platform uses **Sign-In with Ethereum (SIWE)** for authentication:
- Connect wallet via Thirdweb
- Sign a message to authenticate
- Session-based authentication
- Role-based access control (Admin/Editor/User)

## Features

- Web3 Wallet Authentication
- Article Publishing System
- NFT Minting for Articles
- Rich Text Editor (EditorJS)
- Image Upload
- Crypto Price Ticker
- Category Management
- SEO Optimization
- Responsive Design

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please open an issue on GitHub.




