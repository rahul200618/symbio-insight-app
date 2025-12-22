# Deployment Checklist for Symbio-NLM

Use this checklist to ensure a smooth deployment process.

## Pre-Deployment Checklist

### 1. Code Preparation
- [ ] All code changes committed
- [ ] Tests passing (if applicable)
- [ ] No sensitive data in code
- [ ] Dependencies updated in package.json
- [ ] README.md updated
- [ ] CHANGELOG updated (if applicable)

### 2. Environment Configuration
- [ ] Obtain Google Gemini API key
- [ ] Set up MongoDB Atlas cluster (for production)
- [ ] Generate secure JWT_SECRET
- [ ] Prepare all environment variables
- [ ] Document custom configuration

### 3. Deployment Method Selection
Choose your deployment method:
- [ ] **Vercel** (Recommended for quick production)
- [ ] **Docker** (For self-hosted or custom infrastructure)
- [ ] **Manual** (For traditional VPS/server)

---

## Vercel Deployment Checklist

### Step 1: Setup
- [ ] Fork/clone repository to your GitHub
- [ ] Create Vercel account
- [ ] Create MongoDB Atlas cluster
- [ ] Get MongoDB connection string
- [ ] Whitelist all IPs in MongoDB Atlas (0.0.0.0/0)

### Step 2: Deploy
- [ ] Import repository to Vercel
- [ ] Add environment variables:
  - [ ] `NODE_ENV=production`
  - [ ] `STORAGE_MODE=atlas`
  - [ ] `MONGODB_URI=<your-connection-string>`
  - [ ] `GEMINI_API_KEY=<your-api-key>`
  - [ ] `JWT_SECRET=<generate-with-openssl>`
  - [ ] `FRONTEND_URL=<will-be-vercel-url>`
- [ ] Deploy to production

### Step 3: Post-Deploy
- [ ] Copy Vercel deployment URL
- [ ] Update `FRONTEND_URL` in environment variables
- [ ] Redeploy to apply changes
- [ ] Test health endpoint: `/api/health`
- [ ] Test user signup/login
- [ ] Test file upload
- [ ] Test AI chatbot
- [ ] Test report generation

---

## Docker Deployment Checklist

### Step 1: Server Preparation
- [ ] Docker installed (20.x+)
- [ ] Docker Compose installed (2.x+)
- [ ] Server has adequate resources (2GB RAM min)
- [ ] Ports 80 and 3002 available
- [ ] Domain configured (optional)

### Step 2: Application Setup
- [ ] Clone repository to server
- [ ] Create `.env` file in root
- [ ] Add required environment variables:
  - [ ] `GEMINI_API_KEY`
  - [ ] `JWT_SECRET`
  - [ ] `MONGODB_URI` (if using Atlas)
- [ ] Review docker-compose.yml
- [ ] Build Docker images

### Step 3: Deploy
- [ ] Run `docker-compose up -d`
- [ ] Check container status: `docker-compose ps`
- [ ] View logs: `docker-compose logs -f`
- [ ] Test health endpoint
- [ ] Verify all services running

### Step 4: Optional - Nginx Reverse Proxy
- [ ] Install Nginx on host
- [ ] Configure reverse proxy
- [ ] Set up SSL with Let's Encrypt
- [ ] Configure domain
- [ ] Test HTTPS access

---

## Manual Deployment Checklist

### Step 1: Server Setup
- [ ] Node.js 18+ installed
- [ ] npm installed
- [ ] PM2 installed globally
- [ ] MongoDB installed/configured or Atlas ready
- [ ] Nginx installed (for frontend)

### Step 2: Application Setup
- [ ] Clone repository
- [ ] Install backend dependencies
- [ ] Install frontend dependencies
- [ ] Build frontend
- [ ] Configure backend .env
- [ ] Configure frontend .env

### Step 3: Start Services
- [ ] Start backend with PM2
- [ ] Configure PM2 startup
- [ ] Configure Nginx for frontend
- [ ] Configure Nginx for API proxy
- [ ] Enable Nginx site
- [ ] Restart Nginx

### Step 4: SSL Setup
- [ ] Install Certbot
- [ ] Generate SSL certificate
- [ ] Configure SSL in Nginx
- [ ] Test HTTPS access

---

## Post-Deployment Verification

### Security Checks
- [ ] HTTPS enabled and working
- [ ] SSL certificate valid
- [ ] Environment variables secured
- [ ] Database access restricted
- [ ] CORS configured correctly
- [ ] API rate limiting active
- [ ] No secrets in repository

### Functionality Tests
- [ ] Health endpoint returns 200 OK
- [ ] Database connection successful
- [ ] User signup works
- [ ] User login works
- [ ] JWT authentication works
- [ ] File upload works
- [ ] FASTA parsing works
- [ ] Sequence analysis works
- [ ] AI chatbot responds
- [ ] Report generation works
- [ ] PDF download works
- [ ] All pages load correctly

### Performance Checks
- [ ] Page load time < 3 seconds
- [ ] API response time < 1 second
- [ ] Static assets cached
- [ ] Images optimized
- [ ] Compression enabled

### Monitoring Setup
- [ ] Health check monitoring configured
- [ ] Error tracking enabled
- [ ] Log aggregation set up
- [ ] Uptime monitoring active
- [ ] Performance monitoring enabled
- [ ] Alerts configured

---

## Rollback Plan

If issues occur after deployment:

### Vercel
1. [ ] Go to Vercel Dashboard
2. [ ] Find previous deployment
3. [ ] Click "Promote to Production"
4. [ ] Verify rollback successful

### Docker
1. [ ] Stop current containers: `docker-compose down`
2. [ ] Checkout previous version: `git checkout <previous-commit>`
3. [ ] Rebuild: `docker-compose build`
4. [ ] Start: `docker-compose up -d`

### Manual
1. [ ] Stop PM2 process
2. [ ] Checkout previous version
3. [ ] Rebuild frontend
4. [ ] Restart PM2
5. [ ] Verify services

---

## Common Issues and Solutions

### Issue: Build fails
- [ ] Check Node.js version (18+)
- [ ] Clear npm cache
- [ ] Delete node_modules and reinstall
- [ ] Check for syntax errors
- [ ] Verify all dependencies in package.json

### Issue: Database connection fails
- [ ] Verify connection string format
- [ ] Check MongoDB Atlas IP whitelist
- [ ] Verify database user credentials
- [ ] Test connection with mongo shell
- [ ] Check network connectivity

### Issue: API returns 502
- [ ] Backend service not running
- [ ] Check backend logs
- [ ] Verify PORT configuration
- [ ] Check CORS settings
- [ ] Verify environment variables

### Issue: JWT authentication fails
- [ ] JWT_SECRET not set
- [ ] Token expired
- [ ] Token format incorrect
- [ ] Clear browser localStorage
- [ ] Generate new token

---

## Deployment Timeline Estimate

### Vercel Deployment
- Setup: 5 minutes
- Configuration: 5 minutes
- Deployment: 3 minutes
- Testing: 5 minutes
**Total: ~20 minutes**

### Docker Deployment
- Server setup: 10 minutes
- Application setup: 5 minutes
- Build and deploy: 5 minutes
- Testing: 5 minutes
**Total: ~25 minutes**

### Manual Deployment
- Server setup: 15 minutes
- Application setup: 10 minutes
- Service configuration: 15 minutes
- SSL setup: 10 minutes
- Testing: 10 minutes
**Total: ~60 minutes**

---

## Emergency Contacts

Document your emergency contacts and resources:

- **Team Lead**: _____________________
- **DevOps**: _____________________
- **Database Admin**: _____________________
- **Vercel Support**: https://vercel.com/support
- **MongoDB Support**: https://www.mongodb.com/support
- **Repository Issues**: https://github.com/rahul200618/symbio-insight-app/issues

---

## Final Sign-Off

Deployment completed by: _____________________
Date: _____________________
Deployment method: _____________________
Production URL: _____________________
Status: _____________________ (Success/Issues/Rolled Back)

Notes:
_____________________
_____________________
_____________________

---

**Remember**: Always test in a staging environment before production deployment!

**Need help?** Refer to [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed guides.
