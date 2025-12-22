# Deployment Commands Quick Reference

Quick reference for common deployment commands. Keep this handy!

## 🚀 Quick Deploy Commands

### Vercel
```bash
# One-line deploy
npm i -g vercel && vercel --prod

# With environment variables
vercel env add GEMINI_API_KEY
vercel env add JWT_SECRET
vercel env add MONGODB_URI
vercel --prod
```

### Docker
```bash
# One-line deploy
docker-compose up -d

# With logs
docker-compose up -d && docker-compose logs -f

# Rebuild and deploy
docker-compose up -d --build
```

### Helper Script
```bash
# Interactive menu
./deploy.sh

# Direct commands
./deploy.sh setup    # Full setup
./deploy.sh docker   # Deploy with Docker
./deploy.sh vercel   # Deploy to Vercel
./deploy.sh dev      # Start local dev
```

---

## 📦 Installation Commands

### Frontend
```bash
cd frontend
npm install        # Install dependencies
npm run dev        # Development server
npm run build      # Production build
npm run preview    # Preview production build
```

### Backend
```bash
cd backend
npm install        # Install dependencies
npm start          # Start server
npm run dev        # Development with nodemon
```

### Both
```bash
# From root directory
cd backend && npm install && cd ../frontend && npm install && cd ..
```

---

## 🐳 Docker Commands

### Basic Operations
```bash
docker-compose up -d              # Start containers
docker-compose down               # Stop containers
docker-compose down -v            # Stop and remove volumes
docker-compose restart            # Restart containers
docker-compose ps                 # List containers
docker-compose logs -f            # View logs (follow)
docker-compose logs backend       # View backend logs
docker-compose logs frontend      # View frontend logs
```

### Build & Rebuild
```bash
docker-compose build              # Build images
docker-compose build --no-cache   # Build without cache
docker-compose up -d --build      # Rebuild and start
docker-compose pull               # Pull latest images
```

### Debugging
```bash
docker-compose exec backend sh    # Shell into backend
docker-compose exec frontend sh   # Shell into frontend
docker stats                      # Resource usage
docker system prune -a            # Clean up everything
```

---

## 🔧 Vercel Commands

### Deployment
```bash
vercel                            # Deploy to preview
vercel --prod                     # Deploy to production
vercel --yes                      # Deploy without prompts
vercel pull                       # Pull environment
vercel env pull                   # Pull environment variables
```

### Configuration
```bash
vercel login                      # Login to Vercel
vercel link                       # Link to project
vercel env add                    # Add environment variable
vercel env ls                     # List environment variables
vercel env rm <name>              # Remove environment variable
```

### Management
```bash
vercel ls                         # List deployments
vercel rm <deployment>            # Remove deployment
vercel domains ls                 # List domains
vercel certs ls                   # List certificates
vercel logs <deployment>          # View logs
```

---

## 🗄️ Database Commands

### MongoDB Atlas
```bash
# Connect via CLI
mongosh "mongodb+srv://cluster.mongodb.net/" --username <user>

# Test connection
mongosh <connection-string> --eval "db.adminCommand('ping')"

# Create database backup
mongodump --uri="<connection-string>" --out=./backup
```

### SQLite (Local)
```bash
# Open database
sqlite3 backend/db/database.sqlite3

# Backup
cp backend/db/database.sqlite3 backup.sqlite3

# Restore
cp backup.sqlite3 backend/db/database.sqlite3
```

---

## 🌐 Nginx Commands

### Basic Operations
```bash
sudo nginx -t                     # Test configuration
sudo systemctl start nginx        # Start Nginx
sudo systemctl stop nginx         # Stop Nginx
sudo systemctl restart nginx      # Restart Nginx
sudo systemctl reload nginx       # Reload configuration
sudo systemctl status nginx       # Check status
```

### Configuration
```bash
sudo nano /etc/nginx/sites-available/symbio    # Edit config
sudo ln -s /etc/nginx/sites-available/symbio /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx   # Test and reload
```

### Logs
```bash
sudo tail -f /var/log/nginx/access.log    # Access logs
sudo tail -f /var/log/nginx/error.log     # Error logs
```

---

## 🔑 SSL/Certificate Commands

### Let's Encrypt
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com

# Renew certificate
sudo certbot renew

# Test renewal
sudo certbot renew --dry-run
```

---

## 📊 Monitoring Commands

### System Resources
```bash
htop                              # Interactive process viewer
free -h                           # Memory usage
df -h                             # Disk usage
netstat -tuln                     # Network connections
lsof -i :3002                     # Check port usage
```

### Application Logs
```bash
# PM2 (if using)
pm2 logs                          # All logs
pm2 logs symbio-backend           # Backend logs
pm2 status                        # Process status
pm2 monit                         # Real-time monitor

# Docker
docker-compose logs -f --tail=100 # Last 100 lines

# Systemd
journalctl -u nginx -f            # Nginx logs
journalctl -u symbio -f           # Service logs
```

---

## 🧪 Testing Commands

### Health Checks
```bash
# Local
curl http://localhost:3002/api/health

# Production
curl https://your-domain.com/api/health

# With pretty print
curl https://your-domain.com/api/health | jq
```

### API Testing
```bash
# Signup
curl -X POST https://your-domain.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"test123"}'

# Login
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Health check with timing
curl -w "@curl-format.txt" -o /dev/null -s https://your-domain.com/api/health
```

---

## 🔄 Update & Maintenance Commands

### Update Application
```bash
# Docker
git pull
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Vercel
git pull
vercel --prod

# Manual
git pull
cd backend && npm install && cd ../frontend && npm install && npm run build
pm2 restart all
```

### Database Maintenance
```bash
# MongoDB
mongosh <connection-string> --eval "db.repairDatabase()"

# SQLite
sqlite3 backend/db/database.sqlite3 "VACUUM;"
```

---

## 🚨 Emergency Commands

### Stop Everything
```bash
# Docker
docker-compose down

# PM2
pm2 stop all

# Nginx
sudo systemctl stop nginx

# Kill port
kill -9 $(lsof -t -i:3002)
npx kill-port 3002
```

### Quick Rollback
```bash
# Docker
git checkout HEAD~1
docker-compose up -d --build

# Vercel (via dashboard)
# Go to deployments → previous version → Promote to Production
```

### System Recovery
```bash
# Clear Docker cache
docker system prune -a --volumes

# Reinstall dependencies
rm -rf node_modules package-lock.json && npm install

# Reset database (⚠️ DESTRUCTIVE)
rm backend/db/*.sqlite3 && npm start
```

---

## 📝 Generate Secrets

### JWT Secret
```bash
openssl rand -base64 32
# or
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Random Password
```bash
openssl rand -base64 16
```

---

## 🔍 Debug Commands

### Check Configuration
```bash
# Environment variables
cat backend/.env
echo $GEMINI_API_KEY

# Node version
node -v
npm -v

# Package versions
npm list --depth=0
```

### Network Debugging
```bash
# Test connectivity
ping your-domain.com
nslookup your-domain.com
curl -I https://your-domain.com

# Check DNS
dig your-domain.com

# Trace route
traceroute your-domain.com
```

---

## 📚 Help Commands

```bash
docker-compose --help            # Docker Compose help
vercel --help                    # Vercel CLI help
npm --help                       # NPM help
./deploy.sh                      # Deployment script menu
```

---

## ⚡ Pro Tips

### Aliases (add to ~/.bashrc or ~/.zshrc)
```bash
alias dc='docker-compose'
alias dcu='docker-compose up -d'
alias dcd='docker-compose down'
alias dcl='docker-compose logs -f'
alias pm2l='pm2 logs'
alias pm2s='pm2 status'
```

### Watch Logs
```bash
# Multi-tail (install with: npm install -g multitail)
multitail docker-compose.log nginx-access.log

# Using watch
watch -n 1 'curl -s http://localhost:3002/api/health | jq'
```

---

**Quick Tip**: Save this file to your desktop or print it for easy access during deployment! 🎯
