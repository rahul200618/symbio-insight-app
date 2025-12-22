# 🚀 Quick Deployment Guide

Get Symbio-NLM up and running in minutes!

## ⚡ Quick Start Options

### Option 1: Deploy to Vercel (Recommended - 5 minutes)

**Best for:** Quick production deployment with zero configuration

1. **Fork this repository** to your GitHub account

2. **Set up MongoDB Atlas** (Free tier)
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free cluster
   - Get your connection string
   - Whitelist IP: `0.0.0.0/0`

3. **Deploy to Vercel**
   - Visit [vercel.com/new](https://vercel.com/new)
   - Import your forked repository
   - Add environment variables:
     ```
     NODE_ENV=production
     STORAGE_MODE=atlas
     MONGODB_URI=your_mongodb_connection_string
     GEMINI_API_KEY=your_gemini_api_key
     JWT_SECRET=generate_with_openssl_rand_-base64_32
     FRONTEND_URL=will_be_your_vercel_url
     ```
   - Click "Deploy"

4. **Update FRONTEND_URL**
   - After deployment, copy your Vercel URL
   - Go to Project Settings → Environment Variables
   - Update `FRONTEND_URL` with your Vercel URL
   - Redeploy

**Done!** Your app is live at `https://your-app.vercel.app` 🎉

---

### Option 2: Docker (One Command - 2 minutes)

**Best for:** Local testing or server deployment

1. **Clone the repository**
   ```bash
   git clone https://github.com/rahul200618/symbio-insight-app.git
   cd symbio-insight-app
   ```

2. **Create .env file**
   ```bash
   echo "GEMINI_API_KEY=your_api_key_here" > .env
   ```

3. **Run with Docker**
   ```bash
   docker-compose up -d
   ```

**Done!** Access at:
- Frontend: http://localhost
- Backend: http://localhost:3002

---

### Option 3: Local Development (3 minutes)

**Best for:** Development and testing

1. **Clone and install**
   ```bash
   git clone https://github.com/rahul200618/symbio-insight-app.git
   cd symbio-insight-app
   
   # Use the deployment helper
   ./deploy.sh setup
   ```

2. **Configure environment**
   ```bash
   # Backend
   cd backend
   cp .env.example .env
   nano .env  # Add your GEMINI_API_KEY
   
   # Frontend  
   cd ../frontend
   # .env.example already has correct defaults
   ```

3. **Start the app**
   ```bash
   ./deploy.sh dev
   ```

**Done!** Access at:
- Frontend: http://localhost:3000
- Backend: http://localhost:3002

---

## 🔑 Required API Keys

### Google Gemini API Key (Required for AI features)

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key

### MongoDB Atlas (Recommended for production)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster (M0)
3. Create a database user
4. Get connection string
5. Replace `<password>` with your password

Example connection string:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/symbio?retryWrites=true&w=majority
```

---

## ⚙️ Environment Variables Quick Reference

### Backend (.env)

| Variable | Required | Where to get it |
|----------|----------|-----------------|
| `GEMINI_API_KEY` | ✅ Yes | [Google AI Studio](https://makersuite.google.com/app/apikey) |
| `JWT_SECRET` | ✅ Yes | Generate: `openssl rand -base64 32` |
| `MONGODB_URI` | For production | [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) |
| `FRONTEND_URL` | For production | Your Vercel URL or domain |

### Frontend (.env.production)

Already configured! Uses relative path `/api` to connect to backend.

---

## 🧪 Test Your Deployment

### 1. Check Health Endpoint
```bash
curl https://your-app.vercel.app/api/health
```

Should return:
```json
{
  "status": "ok",
  "database": "connected",
  "storageMode": "atlas",
  "version": "1.0.0"
}
```

### 2. Test File Upload
1. Visit your deployed URL
2. Sign up / Login
3. Upload a FASTA file
4. Check Recent Uploads

### 3. Test AI Chatbot
1. Click the chat icon (bottom right)
2. Ask a DNA sequence question
3. Verify response

---

## 🐛 Troubleshooting

### Vercel Deployment Issues

**Build fails:**
- Check environment variables are set
- Review build logs in Vercel dashboard
- Ensure all required variables are present

**API not working:**
- Verify `MONGODB_URI` is correct
- Check `GEMINI_API_KEY` is valid
- Ensure `JWT_SECRET` is set

### Docker Issues

**Containers won't start:**
```bash
docker-compose logs
docker-compose down -v
docker-compose up --build
```

**Port conflicts:**
```bash
# Change ports in docker-compose.yml
# Frontend: Change "80:80" to "8080:80"
# Backend: Change "3002:3002" to "3003:3002"
```

### Local Development Issues

**Backend won't start:**
- Check if port 3002 is available: `lsof -i :3002`
- Verify `.env` file exists in backend folder
- Check MongoDB connection if using Atlas

**Frontend won't start:**
- Check if port 3000 is available: `lsof -i :3000`
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`

---

## 📚 Full Documentation

For detailed deployment instructions, see:
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Comprehensive deployment guide
- [README.md](./README.md) - Full project documentation

---

## 🆘 Need Help?

1. Check [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed guides
2. Review [Issues](https://github.com/rahul200618/symbio-insight-app/issues)
3. Check application logs:
   - Vercel: Dashboard → Project → Functions → Logs
   - Docker: `docker-compose logs -f`
   - Local: Check terminal output

---

## ✅ Post-Deployment Checklist

After deploying, verify:
- [ ] Health endpoint returns "ok"
- [ ] User can sign up/login
- [ ] File upload works
- [ ] FASTA parsing works
- [ ] AI chatbot responds
- [ ] Reports generate correctly
- [ ] All pages load without errors

---

**Ready to deploy?** Choose an option above and get started! 🚀

**Estimated time:** 2-5 minutes depending on your chosen method.
