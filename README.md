# Symbio-NLM - DNA Sequence Analysis Platform

A modern, full-stack bioinformatics application for FASTA file analysis, sequence comparison, and comprehensive report generation.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js)

## 🧬 Features

### Core Functionality
- **FASTA File Upload & Analysis** - Parse and analyze DNA sequences with automatic metrics calculation
- **Sequence Comparison** - Compare multiple sequences with detailed mutation analysis
- **Report Generation** - Create comprehensive PDF and HTML reports
- **Metadata Dashboard** - View detailed sequence statistics and visualizations
- **Recent Uploads** - Track and manage all uploaded sequences

### Advanced Features
- **AI Chatbot Assistant** - Context-aware help and analysis suggestions
- **Dark Mode** - Seamless light/dark theme switching
- **User Profiles** - Complete user management with preferences and settings
- **Notifications** - Real-time analysis status updates
- **Responsive Design** - Works on desktop, tablet, and mobile

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/symbio-insight-app.git
cd symbio-insight-app
```

2. **Install dependencies**
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

3. **Configure environment variables**

Create `backend/.env`:
```env
PORT=3002
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:3002/api
```

4. **Start the application**

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

5. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3002

## 📁 Project Structure

```
symbio-insight-app/
├── backend/              # Express.js API
│   ├── models/          # Sequelize models
│   ├── routes/          # API endpoints
│   ├── server.js        # Main server file
│   └── database.sqlite  # SQLite database
│
├── frontend/            # React + Vite application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── utils/       # Utilities and helpers
│   │   ├── hooks/       # Custom React hooks
│   │   └── context/     # React context providers
│   │
│   └── public/          # Static assets
│
└── README.md           # This file
```

## 🔧 Tech Stack

### Frontend
- **Framework**: React 18.3 with Vite
- **Animation**: Framer Motion
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **State**: React Context API
- **Notifications**: Sonner

### Backend
- **Runtime**: Node.js + Express
- **Database**: SQLite with Sequelize ORM
- **Authentication**: JWT
- **File Upload**: Multer
- **Validation**: Express Validator

## 📖 Usage Guide

### Uploading Sequences

1. Navigate to **Dashboard**
2. Click **Upload FASTA** or drag & drop file
3. Wait for automatic analysis completion
4. View sequence in **Recent Uploads**

### Comparing Sequences

1. Upload at least 2 FASTA files
2. Go to **Recent** page
3. Click **Compare Sequences** button
4. Drag sequences into comparison slots
5. View similarity analysis and mutations

### Generating Reports

1. Select a sequence from **Recent Uploads**
2. Click **View** to see metadata
3. Click **Generate Report** (green button, top-right)
4. Download as PDF or HTML from Report page

### Managing Profile

1. Click profile button (top-right of TopBar)
2. Select **View Profile**
3. Edit account information
4. Adjust preferences and settings
5. Logout when done

## 🔐 Authentication

The app uses JWT-based authentication:

- **Signup**: Create account at `/signup`
- **Login**: Access at `/login`
- **Protected Routes**: Dashboard, Recent, Metadata, Report, Profile
- **Token Storage**: LocalStorage (remember to logout on shared devices)

## 📊 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user
- `POST /api/auth/login` - Login user

### Sequences
- `GET /api/sequences` - Get all sequences (paginated)
- `GET /api/sequences/:id` - Get specific sequence
- `POST /api/sequences` - Upload new FASTA file
- `DELETE /api/sequences/:id` - Delete sequence

## 🎨 Design System

### Color Palette
- **Primary**: Purple (#7c3aed) to Indigo (#4f46e5)
- **Success**: Emerald (#10b981)
- **Warning**: Amber (#f59e0b)
- **Error**: Red (#ef4444)
- **Dark Mode**: Gray scale with proper contrast

### Typography
- **Font**: System font stack for optimal performance
- **Headings**: Bold, with gradient accents
- **Body**: Regular weight, comfortable line height

## 🧪 Features in Detail

### Sequence Analysis Metrics
- Total Base Pairs
- GC Content Percentage  
- Nucleotide Distribution (A, T, G, C)
- ORF (Open Reading Frame) Detection
- Sequence Length Validation

### Comparison Features
- Sequence Similarity Percentage
- Mutation Detection (Transitions & Transversions)
- Ti/Tv Ratio Calculation
- Nucleotide Composition Differences
- Alignment Quality Assessment
-  Biological Interpretation

### Report Components
- Executive Summary
- Sequence Statistics
- Nucleotide Distribution Charts
- ORF Analysis Tables
- Mutation Analysis (for comparisons)
- Export Options (PDF/HTML)

## 🛠️ Development

### Available Scripts

**Backend:**
```bash
npm run dev      # Start development server with nodemon
npm start        # Start production server
```

**Frontend:**
```bash
npm run dev      # Start Vite dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Database Schema

**Users Table:**
- id, email (unique), password (hashed), createdAt, updatedAt

**Sequences Table:**
- id, filename, header, sequence, length, gcContent, orfCount, orfs (JSON), nucleotideCounts (JSON), userId, createdAt, updatedAt

## 🐛 Troubleshooting

### Common Issues

**Port Already in Use:**
```bash
# Kill process on port 3002 (backend)
npx kill-port 3002

# Kill process on port 3000 (frontend)
npx kill-port 3000
```

**Database Locked:**
```bash
# Delete and recreate database
rm backend/database.sqlite
# Restart backend (auto-creates new DB)
```

**Module Not Found:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👤 Author

**Symbio Research Team**
- Email: research@symbio.com

## 🙏 Acknowledgments

- React team for amazing framework
- Framer Motion for smooth animations
- Vite for lightning-fast dev experience
- All open-source contributors

---

**Built with ❤️ for bioinformatics research**