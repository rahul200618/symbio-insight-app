# Symbio-NLM - DNA Sequence Analysis Platform

A modern, full-stack bioinformatics application for FASTA file analysis, sequence comparison, and comprehensive report generation.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js)

## ?? Features

### Core Functionality
- **FASTA File Upload & Analysis** - Parse and analyze DNA sequences with automatic metrics calculation
- **Sequence Comparison** - Compare multiple sequences with detailed mutation analysis
- **Report Generation** - Create comprehensive PDF and HTML reports
- **Metadata Dashboard** - View detailed sequence statistics and visualizations
- **Recent Uploads** - Track and manage all uploaded sequences with batch PDF export

### Advanced Features
- **AI Chatbot Assistant** - Context-aware help and analysis suggestions
- **Dark Mode** - Seamless light/dark theme switching
- **User Profiles** - Complete user management with preferences and settings
- **Real-time Notifications** - Status updates and error handling
- **Responsive Design** - Works on desktop, tablet, and mobile

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
3. Adjust preferences
4. Logout when done

## ?? License

MIT License

## ????? Author

Created as a comprehensive bioinformatics analysis platform.

## ?? Support

1. Check troubleshooting section above
2. Review console error messages
3. Check Network tab for API responses
4. See `api-test.html` for API examples

---

**Last Updated**: January 2025
**Version**: 1.0.0
**Status**: Production Ready
