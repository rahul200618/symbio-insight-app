# Vercel Deployment Guide

## Quick Deploy to Vercel

### Prerequisites
- GitHub account (optional, but recommended)
- Vercel account (free tier works)
- Vercel CLI installed: `npm install -g vercel`

### Environment Variables Required

Before deploying, you'll need the following environment variables:

**Backend:**
- `NODE_ENV` = `production` (auto-set by Vercel)
- `JWT_SECRET` = Generate using: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- `GEMINI_API_KEY` = Your Google Gemini AI API key from https://makersuite.google.com/app/apikey
- `FRONTEND_URL` = Your Vercel app URL (e.g., `https://your-app.vercel.app`)

**Frontend:**
- `VITE_API_URL` = `/api` (already set in .env.production)

### Option 1: Deploy with Vercel CLI (Recommended)

1. **Install Vercel CLI** (if not already installed)
   ```bash
   npm install -g vercel
   ```

2. **Deploy from Project Root**
   ```bash
   cd c:\Users\megha\OneDrive\Documents\Au_sproject\symbio-insight-app
   vercel
   ```

3. **Follow the Prompts**
   - Set up and deploy: Yes
   - Which scope?: Select your account
   - Link to existing project?: No (for first deployment)
   - Project name: symbio-insight-app (or your preferred name)
   - In which directory is your code located?: ./
   - Override settings?: No

4. **Set Environment Variables**
   After deployment, add environment variables via Vercel dashboard or CLI:
   ```bash
   # Via Vercel Dashboard (easier):
   # Go to: https://vercel.com/[your-username]/[project-name]/settings/environment-variables
   # Add each variable listed above

   # Or via CLI:
   vercel env add JWT_SECRET
   vercel env add GEMINI_API_KEY
   vercel env add FRONTEND_URL
   ```

5. **Redeploy with Environment Variables**
   ```bash
   vercel --prod
   ```
   Copy the production URL and add it as the `FRONTEND_URL` environment variable in Vercel dashboard, then deploy once more.

### Option 2: Deploy via GitHub

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to https://vercel.com/new
   - Click "Import Project"
   - Import your GitHub repository
   - Vercel will auto-detect the configuration from `vercel.json`

3. **Configure Environment Variables**
   - In Vercel Dashboard → Settings → Environment Variables
   - Add all required environment variables listed above
   - Apply to: Production, Preview, Development

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Get your live URL

### Project Structure
```
symbio-insight-app/
├── frontend/          # Vite React app (builds to dist/)
├── backend/           # Express API (serverless functions)
├── vercel.json        # Vercel configuration
└── .vercelignore      # Files to ignore
```

### Configuration Files

**vercel.json** - Main deployment config
- Routes API calls to backend serverless functions
- Serves frontend as static site from dist/
- Sets NODE_ENV to production

**.env.production** (Frontend)
- Sets VITE_API_URL to relative path `/api`
- Allows frontend and backend on same domain

### After Deployment

1. **Get Your URLs**
   - Frontend: https://your-project.vercel.app
   - Backend API: https://your-project.vercel.app/api

2. **Test the Application**
   - Visit your deployment URL
   - Test signup/login functionality
   - Upload a FASTA file
   - Generate a report
   - Try the AI chat/summary features
   - Check browser console for errors

3. **Monitor Deployment**
   - View logs: `vercel logs`
   - Check dashboard: https://vercel.com/dashboard

### Automatic Deployments

Every push to `main` branch triggers:
- Automatic rebuild
- Zero-downtime deployment
- Live preview URL

Preview deployments for other branches:
- Each branch gets its own preview URL
- Perfect for testing before merging

### Custom Domain (Optional)

1. Go to Vercel Dashboard → Domains
2. Add your custom domain
3. Update DNS records as shown
4. SSL certificate auto-configured
5. Update `FRONTEND_URL` environment variable to your custom domain

### Important Notes

> **⚠️ SQLite Database Limitation**: Vercel uses serverless functions with ephemeral storage. Your SQLite database will NOT persist data between deployments or function invocations. 

**For production use, migrate to a cloud database:**
- PostgreSQL (Vercel Postgres, Neon, Supabase)
- MongoDB Atlas
- PlanetScale (MySQL)

To use the existing MongoDB configuration in `.env.example`, simply set `MONGODB_URI` in Vercel environment variables instead of using SQLite.

### Troubleshooting

**Build fails:**
- Check build logs in Vercel dashboard or run `vercel logs`
- Verify all dependencies in package.json
- Ensure environment variables are set correctly
- Try local build: `cd frontend && npm run build`

**API not working:**
- Check VITE_API_URL is set to `/api` in production
- Verify backend routes in vercel.json
- Check CORS settings in backend/server.js
- Test API endpoint: `curl https://your-app.vercel.app/api/health`

**Frontend not loading:**
- Check if build directory is correct (should be dist/)
- Verify vercel.json routes configuration
- Check browser console for errors

**CORS errors:**
- Verify FRONTEND_URL environment variable is set
- Check backend/server.js CORS configuration includes Vercel domains
- Ensure credentials: true is set in CORS config

**Database issues:**
- SQLite will not persist on Vercel (serverless limitation)
- Migrate to PostgreSQL or MongoDB for production
- Update database config in backend/config/database.js

### Commands Reference

```bash
# Local development
cd frontend && npm run dev
cd backend && npm run dev

# Build for production (test locally)
cd frontend && npm run build

# Deploy to Vercel
vercel                    # Deploy to preview
vercel --prod            # Deploy to production

# View logs
vercel logs              # Recent logs
vercel logs [url]        # Logs for specific deployment

# Environment variables
vercel env ls            # List all env vars
vercel env add           # Add new env var
vercel env rm            # Remove env var

# Project management
vercel list              # List all deployments
vercel remove [url]      # Remove a deployment
vercel domains           # Manage domains
```

## Support

For issues, check:
1. Vercel deployment logs (`vercel logs`)
2. Browser console errors (F12)
3. Network tab for API call failures
4. Vercel dashboard: https://vercel.com/dashboard
5. README.md for project details
6. Check `.env.production` file exists in frontend/
