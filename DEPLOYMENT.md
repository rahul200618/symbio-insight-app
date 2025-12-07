# Vercel Deployment Guide

## Quick Deploy to Vercel

### Prerequisites
- GitHub account
- Vercel account (free tier works)
- Code pushed to GitHub repository

### Steps to Deploy

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to https://vercel.com
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect the configuration

3. **Environment Variables**
   Set these in Vercel Dashboard → Settings → Environment Variables:
   
   **Backend:**
   - `NODE_ENV` = `production`
   - `JWT_SECRET` = your-secret-key-here
   - `PORT` = `3002`
   
   **Frontend:**
   - `VITE_API_URL` = your-vercel-backend-url/api

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy automatically
   - You'll get a live URL

### Project Structure
```
symbio-insight-app/
├── frontend/          # Vite React app
├── backend/           # Express API
├── vercel.json       # Vercel configuration
└── .vercelignore     # Files to ignore
```

### Configuration Files Created

**vercel.json** - Main deployment config
- Routes API calls to backend
- Serves frontend as static site

**.vercelignore** - Exclude from deployment
- node_modules
- Development files
- Logs

### After Deployment

1. **Get Your URLs**
   - Frontend: https://your-project.vercel.app
   - Backend: https://your-project.vercel.app/api

2. **Update Frontend ENV**
   - Set `VITE_API_URL` to your Vercel backend URL

3. **Test**
   - Visit your frontend URL
   - Try login/signup
   - Upload sequences
   - Generate reports

### Automatic Deployments

Every push to `main` branch triggers:
- Automatic rebuild
- Zero-downtime deployment
- Live preview URL

### Custom Domain (Optional)

1. Go to Vercel Dashboard → Domains
2. Add your custom domain
3. Update DNS records
4. SSL certificate auto-configured

### Troubleshooting

**Build fails:**
- Check build logs in Vercel dashboard
- Verify all dependencies in package.json
- Ensure environment variables are set

**API not working:**
- Check VITE_API_URL is correct
- Verify backend routes in vercel.json
- Check CORS settings

**Database issues:**
- SQLite may not work on Vercel (serverless)
- Consider using PostgreSQL or MongoDB
- Update database config for production

### Alternative: Split Deployment

Deploy frontend and backend separately:

**Frontend Only:**
- Deploy to Vercel
- Point to external API

**Backend Only:**
- Deploy to Railway/Render/Heroku
- Update VITE_API_URL

## Commands

```bash
# Local development
cd frontend && npm run dev
cd backend && npm run dev

# Build for production
cd frontend && npm run build
cd backend && npm start

# Deploy with Vercel CLI (optional)
npm i -g vercel
vercel
```

## Support

For issues, check:
1. Vercel deployment logs
2. Browser console errors
3. Network tab for API calls
4. README.md for project details
