# Deployment Guide for Symbio-NLM

This guide covers multiple deployment options for the Symbio-NLM DNA Sequence Analysis Platform.

## Table of Contents
- [Quick Deploy (Vercel)](#quick-deploy-vercel)
- [Docker Deployment](#docker-deployment)
- [Manual Deployment](#manual-deployment)
- [Environment Variables](#environment-variables)
- [CI/CD with GitHub Actions](#cicd-with-github-actions)
- [Post-Deployment Checklist](#post-deployment-checklist)

---

## Quick Deploy (Vercel)

Vercel is the recommended platform for quick deployment with automatic SSL, CDN, and scaling.

### Prerequisites
- GitHub account
- Vercel account (free tier available at [vercel.com](https://vercel.com))
- MongoDB Atlas account (recommended for production database)

### Steps

1. **Fork or Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/symbio-insight-app.git
   cd symbio-insight-app
   ```

2. **Set up MongoDB Atlas** (Recommended for Production)
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free cluster
   - Get your connection string
   - Whitelist IP: `0.0.0.0/0` (for Vercel's dynamic IPs)

3. **Deploy to Vercel**
   
   **Option A: Using Vercel CLI**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login to Vercel
   vercel login
   
   # Deploy
   vercel
   
   # For production
   vercel --prod
   ```

   **Option B: Using Vercel Dashboard**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your Git repository
   - Vercel will auto-detect the configuration from `vercel.json`
   - Click "Deploy"

4. **Configure Environment Variables in Vercel**
   
   Go to Project Settings → Environment Variables and add:
   
   **Required:**
   - `NODE_ENV`: `production`
   - `FRONTEND_URL`: Your Vercel app URL (e.g., `https://your-app.vercel.app`)
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `STORAGE_MODE`: `atlas`
   - `GEMINI_API_KEY`: Your Google Gemini API key
   - `JWT_SECRET`: Generate with `openssl rand -base64 32`

   **Optional:**
   - `SENDGRID_API_KEY`: For email functionality
   - `EMAIL_FROM`: Email sender address

5. **Deploy**
   - Push to `main` branch or click "Deploy" in Vercel
   - Vercel will automatically build and deploy

6. **Verify Deployment**
   - Visit `https://your-app.vercel.app`
   - Check `/api/health` endpoint: `https://your-app.vercel.app/api/health`

---

## Docker Deployment

Docker provides a consistent environment across all platforms.

### Prerequisites
- Docker Engine 20.x or higher
- Docker Compose 2.x or higher

### Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/symbio-insight-app.git
   cd symbio-insight-app
   ```

2. **Configure Environment Variables**
   
   Create a `.env` file in the root directory:
   ```bash
   # Copy the template
   cp .env.example .env
   
   # Edit with your values
   nano .env
   ```
   
   Add:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   JWT_SECRET=your_jwt_secret_here
   MONGODB_URI=your_mongodb_uri_if_using_atlas
   STORAGE_MODE=sqlite
   ```

3. **Build and Start Containers**
   ```bash
   # Build images
   docker-compose build
   
   # Start containers
   docker-compose up -d
   
   # View logs
   docker-compose logs -f
   ```

4. **Access the Application**
   - Frontend: http://localhost
   - Backend API: http://localhost:3002
   - Health Check: http://localhost:3002/api/health

5. **Manage Containers**
   ```bash
   # Stop containers
   docker-compose down
   
   # Stop and remove volumes (⚠️ deletes database)
   docker-compose down -v
   
   # Restart containers
   docker-compose restart
   
   # View container status
   docker-compose ps
   ```

### Production Docker Deployment

For production servers (AWS, DigitalOcean, etc.):

1. **Set up Docker on your server**
   ```bash
   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   
   # Install Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

2. **Clone and Configure**
   ```bash
   git clone https://github.com/yourusername/symbio-insight-app.git
   cd symbio-insight-app
   
   # Create .env file
   nano .env
   ```

3. **Add Reverse Proxy (Nginx)**
   ```bash
   # Install Nginx
   sudo apt update
   sudo apt install nginx
   
   # Configure Nginx
   sudo nano /etc/nginx/sites-available/symbio
   ```
   
   Add configuration:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:80;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

4. **Enable SSL with Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

5. **Start Application**
   ```bash
   docker-compose up -d
   ```

---

## Manual Deployment

For VPS, dedicated servers, or custom hosting.

### Prerequisites
- Node.js 18.x or higher
- npm or yarn
- PM2 (process manager)
- MongoDB (local or Atlas)

### Steps

1. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **Install PM2**
   ```bash
   sudo npm install -g pm2
   ```

3. **Clone Repository**
   ```bash
   git clone https://github.com/yourusername/symbio-insight-app.git
   cd symbio-insight-app
   ```

4. **Install Dependencies**
   ```bash
   # Backend
   cd backend
   npm install --production
   
   # Frontend
   cd ../frontend
   npm install
   ```

5. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   ```

6. **Configure Environment**
   ```bash
   # Backend
   cd ../backend
   cp .env.example .env
   nano .env
   ```

7. **Start Backend with PM2**
   ```bash
   cd backend
   pm2 start server.js --name symbio-backend
   pm2 save
   pm2 startup
   ```

8. **Serve Frontend with Nginx**
   ```bash
   sudo apt install nginx
   sudo nano /etc/nginx/sites-available/symbio
   ```
   
   Configuration:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       root /path/to/symbio-insight-app/frontend/dist;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
       
       location /api {
           proxy_pass http://localhost:3002;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

9. **Enable Site**
   ```bash
   sudo ln -s /etc/nginx/sites-available/symbio /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

10. **Monitor Application**
    ```bash
    pm2 status
    pm2 logs symbio-backend
    pm2 monit
    ```

---

## Environment Variables

### Backend Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | No | `development` | Node environment (`development`, `production`) |
| `PORT` | No | `3002` | Backend server port |
| `FRONTEND_URL` | Yes | - | Frontend URL for CORS |
| `STORAGE_MODE` | No | `sqlite` | Storage mode (`sqlite` or `atlas`) |
| `MONGODB_URI` | Conditional | - | MongoDB connection string (required if `STORAGE_MODE=atlas`) |
| `GEMINI_API_KEY` | Yes | - | Google Gemini AI API key |
| `JWT_SECRET` | Yes | - | Secret key for JWT tokens (min 32 characters) |
| `JWT_EXPIRE` | No | `7d` | JWT token expiration time |
| `SENDGRID_API_KEY` | No | - | SendGrid API key for emails |
| `EMAIL_FROM` | No | - | Email sender address |

### Frontend Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | Yes | - | Backend API URL |
| `VITE_APP_NAME` | No | `Symbio-NLM` | Application name |

### Generating Secure Secrets

```bash
# Generate JWT_SECRET
openssl rand -base64 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## CI/CD with GitHub Actions

Automated deployment is configured via GitHub Actions.

### Setup GitHub Actions

1. **Get Vercel Credentials**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login and link project
   vercel login
   vercel link
   
   # Get tokens
   vercel whoami
   ```

2. **Add GitHub Secrets**
   
   Go to Repository Settings → Secrets and variables → Actions
   
   Add these secrets:
   - `VERCEL_TOKEN`: Your Vercel token
   - `VERCEL_ORG_ID`: From `.vercel/project.json`
   - `VERCEL_PROJECT_ID`: From `.vercel/project.json`

3. **Configure Workflow**
   
   The workflow is already configured in `.github/workflows/deploy.yml`
   
   It will:
   - Run tests on push to main
   - Build Docker images
   - Deploy to Vercel automatically

4. **Trigger Deployment**
   ```bash
   git add .
   git commit -m "Deploy to production"
   git push origin main
   ```

5. **Monitor Deployment**
   - Check Actions tab in GitHub
   - View deployment in Vercel dashboard

---

## Post-Deployment Checklist

### Security
- [ ] HTTPS enabled (SSL certificate)
- [ ] Strong JWT_SECRET set (32+ characters)
- [ ] CORS configured to allow only your domain
- [ ] Environment variables secured (not in code)
- [ ] Database access restricted (IP whitelist)
- [ ] Rate limiting enabled
- [ ] Security headers configured

### Database
- [ ] MongoDB Atlas cluster created (for production)
- [ ] Database backups configured
- [ ] Connection string secured
- [ ] Database indexes optimized

### Monitoring
- [ ] Health check endpoint working (`/api/health`)
- [ ] Application logs accessible
- [ ] Error tracking set up (optional: Sentry)
- [ ] Uptime monitoring configured
- [ ] Performance monitoring enabled

### Testing
- [ ] All API endpoints tested
- [ ] User authentication working
- [ ] File upload working
- [ ] PDF generation working
- [ ] AI chatbot functional
- [ ] Email notifications working (if enabled)

### Performance
- [ ] Frontend build optimized
- [ ] Static assets cached properly
- [ ] Compression enabled
- [ ] CDN configured (Vercel provides this)
- [ ] Database queries optimized

### Documentation
- [ ] API documentation accessible
- [ ] README updated with production URL
- [ ] Team notified of deployment
- [ ] Deployment runbook created

---

## Troubleshooting

### Vercel Deployment Issues

**Issue: Build fails**
```bash
# Check build logs in Vercel dashboard
# Ensure all dependencies are in package.json
# Check for environment variable issues
```

**Issue: API not working**
```bash
# Verify environment variables are set in Vercel
# Check function logs in Vercel dashboard
# Ensure CORS is configured correctly
```

### Docker Issues

**Issue: Containers won't start**
```bash
# Check logs
docker-compose logs

# Rebuild images
docker-compose build --no-cache
docker-compose up
```

**Issue: Database connection fails**
```bash
# Check MongoDB connection string
# Ensure MongoDB is accessible
# Check network connectivity
```

### General Issues

**Issue: 502 Bad Gateway**
- Backend is not running
- Check backend logs
- Verify PORT configuration

**Issue: CORS errors**
- Update FRONTEND_URL in backend
- Check CORS configuration in server.js

**Issue: JWT authentication fails**
- Verify JWT_SECRET is set
- Check token expiration
- Clear browser localStorage

---

## Support and Resources

- **Repository**: [GitHub Repository](https://github.com/yourusername/symbio-insight-app)
- **Issues**: Report bugs on GitHub Issues
- **Documentation**: Check README.md
- **API Docs**: Visit `/api` endpoint

---

## Production Checklist Summary

✅ **Before Going Live:**
1. Set all environment variables
2. Use MongoDB Atlas (not SQLite)
3. Enable HTTPS/SSL
4. Configure domain
5. Test all features
6. Set up monitoring
7. Configure backups
8. Enable error tracking
9. Review security settings
10. Update documentation

✅ **After Deployment:**
1. Test production site
2. Monitor logs
3. Check health endpoint
4. Verify database
5. Test user flows
6. Monitor performance
7. Set up alerts
8. Document any issues
9. Create rollback plan
10. Notify team

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Deployment Status**: Production Ready
