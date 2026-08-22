# Render + Vercel Deployment Guide

## Render Backend Setup

### Environment Variables for Render Backend Service:
1. Go to your `govsync-backend` service on Render
2. Add Environment Variables:
   - `PYO3_USE_ABI3_FORWARD_COMPATIBILITY`: `1` (This fixes Python 3.14 compatibility)
   - `DATABASE_URL`: (From PostgreSQL database)
   - `JWT_SECRET`: Generate a secure secret key
   - `FRONTEND_ORIGIN`: (Will add Vercel URL later)

### Alternative: Use Python 3.12
If environment variable doesn't work, in Render service settings:
- Go to Advanced → Runtime
- Set Python version to 3.12

## Vercel Frontend Setup

### 1. Install Vercel CLI (optional)
```bash
npm install -g vercel
```

### 2. Deploy to Vercel
- Go to https://vercel.com
- Sign up with GitHub
- Click "New Project"
- Select `Tanya-garg10/govsync` repo
- Root Directory: `frontend`
- Environment Variables:
  - `NEXT_PUBLIC_API_URL`: (Add Render backend URL later)
- Click "Deploy"

### 3. Update Environment Variables
After deployment:
1. Copy Vercel frontend URL
2. Update Render backend: `FRONTEND_ORIGIN` = Vercel URL
3. Copy Render backend URL  
4. Update Vercel frontend: `NEXT_PUBLIC_API_URL` = Render backend URL

## Benefits of Render + Vercel:
- ✅ Render: Good for Python/PostgreSQL
- ✅ Vercel: Perfect for Next.js (built by Next.js creators)
- ✅ Both have free tiers
- ✅ Automatic SSL
- ✅ Easy deployment