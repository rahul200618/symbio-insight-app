# Symbio-NLM - DNA Sequence Analysis Platform

A modern, full-stack bioinformatics application for FASTA file analysis, sequence comparison, AI-powered insights, and comprehensive report generation.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-18%2B-brightgreen)

## 🚀 Quick Deploy

**Ready to deploy?** See [QUICKSTART.md](./QUICKSTART.md) for fast deployment options:
- **Vercel** (5 min) - Recommended for production
- **Docker** (2 min) - One command deployment
- **Local** (3 min) - Development setup

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 🧬 Features

### Core Functionality
- **FASTA File Upload & Analysis** - Parse and analyze DNA sequences with automatic metrics calculation
- **Multi-Sequence Support** - Handle files with multiple sequences, aggregate stats
- **Sequence Comparison** - Compare multiple sequences with detailed mutation analysis
- **Report Generation** - Create comprehensive PDF reports with charts and analysis
- **Metadata Dashboard** - View detailed sequence statistics and visualizations
- **Recent Uploads** - Track and manage all uploaded sequences with batch operations

### AI & Intelligence
- **AI Chatbot Assistant** - Gemini-powered context-aware DNA analysis help
- **Sequence Analysis AI** - Get AI-generated insights about your sequences
- **Smart Suggestions** - Automatic recommendations based on sequence patterns

### User Management
- **User Authentication** - Secure signup/login with JWT tokens
- **Profile Management** - Edit name, role, institution
- **Change Password** - Update password with current password verification
- **Forgot Password** - Email-based password reset flow
- **Delete Account** - Account deletion with password confirmation
- **Preferences** - Email notifications, auto-save reports, advanced features toggle

### Advanced Features
- **Codon Usage Analysis** - Analyze codon frequency and bias
- **ORF Prediction** - Find open reading frames in sequences
- **Protein Translation** - Translate DNA to amino acids
- **GC Skew Analysis** - Analyze GC distribution patterns
- **RCSB PDB Integration** - Fetch protein structures (coming soon)
- **Sequence Alignment** - Align multiple sequences (coming soon)
- **BLAST Integration** - Search NCBI databases (coming soon)

### UI/UX
- **Dark Mode** - Seamless light/dark theme switching
- **Real-time Notifications** - Push notifications and in-app alerts
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Animated Transitions** - Smooth motion/react animations
- **Draggable Chatbot** - Resizable and moveable chat interface

## ?? Quick Start

### Prerequisites
- Node.js 18+ and npm
- Git

### Installation

1. **Clone the repository**
``ash
git clone https://github.com/yourusername/symbio-insight-app.git
cd symbio-insight-app
``

2. **Install dependencies**
``ash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
``

3. **Start the application**

**Terminal 1 - Backend (Port 3002):**
``ash
cd backend
npm start
# or for development with auto-reload:
npm run dev
``

**Terminal 2 - Frontend (Port 3000):**
``ash
cd frontend
npm run dev
``

4. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3002
- API Documentation: http://localhost:3002/api

## ?? API Reference (18 Endpoints)

All endpoints return JSON with `{ success: true/false, message, data }` format.

### Authentication Endpoints

#### POST /api/auth/signup
Create a new user account
``javascript
// Request
{
  name: "John Doe",
  email: "john@example.com",
  password: "securePassword123"
}

// Response (200)
{
  success: true,
  message: "User registered successfully",
  token: "jwt_token_here",
  user: { id, name, email }
}
``

#### POST /api/auth/login
Login with email and password
``javascript
// Request
{
  email: "john@example.com",
  password: "securePassword123"
}

// Response (200)
{
  success: true,
  message: "Login successful",
  token: "jwt_token_here",
  user: { id, name, email }
}
``

#### GET /api/auth/me
Get current user profile (requires JWT in Authorization header)

### Sequence Endpoints

#### POST /api/sequences/upload
Upload and analyze a FASTA file

#### GET /api/sequences
List sequences with pagination
- Query: `page`, `limit`, `sort`, `search`

#### GET /api/sequences/:id
Get sequence details by ID

#### PUT /api/sequences/:id
Update sequence metadata

#### DELETE /api/sequences/:id
Delete a sequence

### Analysis Endpoints

#### GET /api/sequences/:id/metadata
Get detailed sequence metadata (GC%, codons, ORFs, etc.)

#### GET /api/sequences/:id/report
Generate comprehensive analysis report

#### POST /api/sequences/compare
Compare multiple sequences with mutation analysis
``javascript
{
  ids: ["id1", "id2", "id3"],
  metrics: ["alignment", "mutation", "similarity"]
}
``

#### POST /api/sequences/generate-pdf
Generate PDF report for sequences
``javascript
{
  ids: ["id1", "id2"],
  title: "Report Title",
  options: { includeCharts: true, includeMetadata: true }
}
``

#### GET /api/sequences/search
Search sequences by query
- Query: `q`, `limit`

#### GET /api/sequences/stats/aggregate
Get overall platform statistics

#### POST /api/sequences/bulk-delete
Delete multiple sequences
``javascript
{
  ids: ["id1", "id2", "id3"]
}
``

#### GET /api/health
System health check

## ?? Frontend API Service (23 Functions)

Located in `frontend/src/utils/sequenceApi.js`

### Authentication
- `await signup({ name, email, password })`
- `await login({ email, password })`
- `await getCurrentUser()`
- `logout()`

### Sequence Management
- `await getSequences({ page, limit, sort, search })`
- `await getSequenceById(id)`
- `await uploadSequenceFile(file)`
- `await createSequence({ fasta, name, description })`
- `await updateSequence(id, data)`
- `await deleteSequence(id)`
- `await bulkDeleteSequences(ids)`

### Analysis & Reporting
- `await getSequenceMetadata(id)`
- `await getSequenceReport(id)`
- `await generatePDFReport(sequenceIds, title)`
- `await generateReport(id, options)`
- `await searchSequences(query, limit)`
- `await getAggregateStats()`

### Utilities
- `await checkHealth()`
- `await getApiInfo()`
- `parseError(error)`

## ??? Project Structure

``
symbio-insight-app/
+-- backend/
�   +-- server.js              # Express server
�   +-- package.json
�   +-- config/                # Configuration
�   +-- middleware/            # Express middleware
�   +-- models/                # Database models
�   +-- routes/                # API endpoints
�   +-- utils/                 # Utilities
�
+-- frontend/
�   +-- src/
�   �   +-- main.jsx
�   �   +-- App.jsx
�   �   +-- components/        # React components
�   �   +-- pages/             # Page components
�   �   +-- context/           # React context
�   �   +-- utils/             # Utilities & APIs
�   �   +-- styles/            # CSS styles
�   �   +-- ui/                # UI components
�   +-- index.html
�   +-- vite.config.js
�   +-- package.json
�   +-- tailwind.config.js
�
+-- README.md                  # This file
``

## ?? Authentication

- **JWT Tokens**: 24-hour expiry
- **Storage**: localStorage
- **Protected Routes**: Dashboard, Recent, Metadata, Report, Profile
- **Headers**: Authorization: Bearer <token>

## ?? PDF Generation

### Backend Method (Primary)
- Engine: PDFKit
- Endpoint: POST /api/sequences/generate-pdf
- Advantages: Server-side, consistent, reliable

### Client-Side Method (Fallback)
- Engine: html2canvas + jsPDF
- Location: frontend/src/utils/reportGenerator.js
- Fallback: When backend unavailable

Usage example:
``javascript
import { generatePDFReport } from '../utils/sequenceApi';
await generatePDFReport(['id1', 'id2'], 'Report Title');
// PDF downloads automatically
``

## ?? Testing

- **API Test**: Open `api-test.html` to test all endpoints
- **Backend**: `npm test` (in backend folder)
- **Frontend**: `npm test` (in frontend folder)

## ?? Tech Stack

### Frontend
- **React** 18.3.1 + Vite 6.3.5
- **Styling**: Tailwind CSS, Motion
- **Notifications**: Sonner
- **PDF**: jsPDF 2.5, html2canvas 1.4
- **Components**: Radix UI

### Backend
- **Framework**: Express.js
- **Database**: SQLite (Sequelize ORM)
- **PDF**: PDFKit 0.13
- **Auth**: JWT (jsonwebtoken)
- **Files**: Multer, bcryptjs

## ?? Troubleshooting

### jsPDF is not defined
**Solution**: Use `generatePDFReport` from sequenceApi instead of direct jsPDF usage.

### Failed to connect to backend
1. Verify backend is running on port 3002
2. Check `VITE_API_URL` in frontend .env
3. Check for CORS issues in backend

### Database locked
1. Stop backend
2. Delete `backend/db/database.sqlite3`
3. Restart backend (creates new database)

### Module reload failures
1. Check browser console for syntax errors
2. Verify all imports are correct
3. Run `npm install` to restore dependencies

### Port already in use
``ash
# Kill process on port 3002
npx kill-port 3002

# Kill process on port 3000
npx kill-port 3000
``

## ?? Usage Guide

### Upload FASTA Sequences
1. Navigate to Dashboard
2. Upload file or drag & drop
3. View results in Recent Uploads

### Compare Sequences
1. Go to Recent page
2. Select 2+ sequences
3. Click Compare Sequences
4. View alignment and mutations

### Generate PDF Reports
1. Select sequence from Recent
2. Click View or Generate Report
3. Download PDF from Report page

### Manage Profile
1. Click profile icon (top-right)
2. View/edit account information
3. Change password in Security section
4. Adjust preferences (notifications, advanced features)
5. Delete account in Danger Zone (requires password)

---

## 🚀 Production Readiness Checklist

### ✅ Completed Features
- [x] User authentication (signup, login, JWT)
- [x] Password management (change, forgot password flow)
- [x] FASTA file parsing with multi-sequence support
- [x] Sequence analysis (GC content, ORF detection, nucleotide counts)
- [x] PDF report generation
- [x] AI chatbot assistant (Gemini integration)
- [x] Dark/light mode
- [x] Notifications system
- [x] Profile management with preferences
- [x] Account deletion with password confirmation
- [x] Responsive design
- [x] Error handling and validation

### 🔧 Required for Production

#### Security
- [ ] **HTTPS/SSL** - Enable HTTPS in production (use nginx or cloud provider)
- [ ] **Environment Variables** - Move all secrets to `.env` file
  - `JWT_SECRET` - Strong random secret (32+ chars)
  - `GEMINI_API_KEY` - Your Google AI API key
  - `DATABASE_URL` - Production database connection
- [ ] **Rate Limiting** - Add express-rate-limit to prevent abuse
- [ ] **Helmet.js** - Add security headers
- [ ] **Input Sanitization** - Sanitize all user inputs
- [ ] **CORS Configuration** - Restrict to your domain only

#### Database
- [ ] **PostgreSQL/MySQL** - Migrate from SQLite to production database
- [ ] **Connection Pooling** - Configure proper pool settings
- [ ] **Backups** - Set up automated database backups
- [ ] **Migrations** - Use Sequelize migrations instead of sync

#### Email Service
- [ ] **Email Provider** - Integrate SendGrid, Mailgun, or AWS SES
- [ ] **Password Reset Emails** - Actually send reset emails
- [ ] **Email Notifications** - Implement when preference is enabled
- [ ] **Email Templates** - Create HTML email templates

#### Performance
- [ ] **CDN** - Use CDN for static assets (Cloudflare, AWS CloudFront)
- [ ] **Caching** - Add Redis for session/API caching
- [ ] **Compression** - Enable gzip/brotli compression
- [ ] **Image Optimization** - Optimize any images
- [ ] **Code Splitting** - Already done with Vite, verify chunks

#### Monitoring & Logging
- [ ] **Error Tracking** - Add Sentry or similar
- [ ] **Logging** - Add Winston or Pino for structured logging
- [ ] **Health Checks** - Add `/health` endpoint
- [ ] **Metrics** - Add Prometheus/Grafana for monitoring
- [ ] **Uptime Monitoring** - Set up uptime checks

#### Deployment
- [ ] **CI/CD Pipeline** - GitHub Actions, GitLab CI, or Vercel
- [ ] **Docker** - Containerize the application
- [ ] **Environment Configs** - Separate dev/staging/prod configs
- [ ] **Domain Setup** - Configure custom domain
- [ ] **Load Balancer** - For high availability

### 💡 Suggested Improvements

#### Features to Add
1. **Two-Factor Authentication (2FA)** - TOTP/SMS verification
2. **Team/Organization Support** - Share sequences with team members
3. **API Keys** - Allow programmatic access
4. **Export Formats** - CSV, JSON, GenBank format export
5. **Sequence Annotations** - Add notes and tags to sequences
6. **Search & Filter** - Advanced search with filters
7. **Batch Upload** - Upload multiple files at once
8. **Webhook Integrations** - Notify external services

#### AI Enhancements
1. **Sequence Similarity Search** - Find similar sequences
2. **Mutation Impact Prediction** - Predict effect of mutations
3. **Primer Design** - AI-assisted PCR primer design
4. **Phylogenetic Analysis** - Tree generation

#### Integrations
1. **NCBI BLAST** - Direct BLAST searches
2. **UniProt** - Protein database integration
3. **Ensembl** - Genome browser integration
4. **OAuth** - Google/GitHub login

### 📦 Deployment Options

#### Vercel (Frontend)
```bash
cd frontend
npm run build
vercel --prod
```

#### Railway/Render (Backend)
```bash
# Push to GitHub, connect to Railway/Render
# Set environment variables in dashboard
```

#### Docker Compose
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "3002:3002"
    environment:
      - NODE_ENV=production
      - JWT_SECRET=${JWT_SECRET}
  frontend:
    build: ./frontend
    ports:
      - "80:80"
```

### 🔐 Environment Variables Template

Create `.env` files:

**Backend (.env)**
```
NODE_ENV=production
PORT=3002
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_EXPIRE=7d
DATABASE_URL=postgresql://user:pass@host:5432/symbio
GEMINI_API_KEY=your-gemini-api-key
SENDGRID_API_KEY=your-sendgrid-key
FRONTEND_URL=https://your-domain.com
```

**Frontend (.env)**
```
VITE_API_URL=https://api.your-domain.com/api
VITE_APP_NAME=Symbio-NLM
```

---

## 📄 License

MIT License

## 👨‍💻 Author

Created as a comprehensive bioinformatics analysis platform.

## 🆘 Support

1. Check troubleshooting section above
2. Review console error messages
3. Check Network tab for API responses
4. See `api-test.html` for API examples

---

**Last Updated**: December 2024
**Version**: 1.0.0
**Status**: Development Complete - Ready for Production Hardening
