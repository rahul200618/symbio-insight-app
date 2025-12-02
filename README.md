# 🧬 Symbio-NLM DNA Sequence Analysis Platform

A full-stack bioinformatics application for parsing, analyzing, and visualizing DNA sequences from FASTA files. Features automated metadata extraction, ORF detection, GC content analysis, and AI-powered insights.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 16+ and npm
- **MongoDB** running locally or connection URI
- Git

### Backend Setup
```bash
cd backend
npm install

# Create .env file
echo "MONGODB_URI=mongodb://localhost:27017/symbio" > .env
echo "PORT=3001" >> .env

# Start development server
npm run dev
```

Backend runs on `http://localhost:3001`

### Frontend Setup
```bash
cd frontend
npm install

# Create .env file (optional)
echo "VITE_API_URL=http://localhost:3001/api" > .env

# Start development server
npm run dev
```

Frontend runs on `http://localhost:3000` with proxy to backend.

---

## 📦 Tech Stack

### Frontend
- **React 18** + **TypeScript** - UI framework and type safety
- **Vite** - Fast build tool and dev server
- **Framer Motion** - Smooth animations
- **Tailwind CSS** (optional) - Styling framework
- **Custom UI Components** - shadcn/ui inspired component library

### Backend
- **Node.js** + **Express** - RESTful API server
- **MongoDB** + **Mongoose** - Database and ODM
- **CORS** enabled for cross-origin requests

---

## 🧬 Features

### Core Functionality
- **FASTA File Parsing** - Upload and parse `.fasta` / `.fa` files
- **Metadata Extraction** - Automatic extraction of:
  - Sequence names, lengths, and raw sequences
  - GC content percentage
  - Nucleotide counts (A, T, G, C)
  - Open Reading Frames (ORF) detection
  - Timestamps and unique IDs
- **Aggregate Statistics** - Calculate averages, totals, and distributions
- **Sequence Comparison** - Drag-and-drop interface to compare two sequences
- **Report Generation** - Print/download HTML reports with charts and insights
- **AI Chatbot Assistant** - Context-aware help and explanations

### UI Views
1. **Upload** - Drag-and-drop FASTA file upload with live parsing
2. **Recent Uploads** - File history table with view/download/delete actions
3. **Metadata** - Visual cards displaying nucleotide distribution and stats
4. **Analysis Report** - Comprehensive report with AI-generated insights

---

## 📂 Project Structure

```
symbio-insight-app/
├── .gitignore                    # Excludes node_modules, dist, .env
├── README.md                     # This file
│
├── backend/                      # Express API server
│   ├── config/
│   │   ├── database.js           # MongoDB connection
│   │   └── firebase.js           # Firebase config (optional)
│   ├── controllers/              # Route handlers (future)
│   ├── middleware/               # Auth, validation (future)
│   ├── models/
│   │   └── Sequence.js           # Mongoose schema for sequences
│   ├── routes/
│   │   └── sequences.js          # CRUD + FASTA parsing endpoints
│   ├── server.js                 # Express app entry point
│   ├── package.json
│   └── .env                      # MONGODB_URI, PORT
│
└── frontend/                     # React + Vite app
    ├── public/                   # Static assets
    ├── src/
    │   ├── components/           # UI components
    │   │   ├── AnimatedPage.tsx
    │   │   ├── Charts.tsx
    │   │   ├── ChatbotAssistant.tsx
    │   │   ├── Icons.tsx         # Inline SVG icon set
    │   │   ├── MetadataCards.tsx
    │   │   ├── RecentUploads.tsx
    │   │   ├── ReportViewer.tsx
    │   │   ├── SequenceComparison.tsx
    │   │   ├── Sidebar.tsx
    │   │   ├── TopBar.tsx
    │   │   ├── UploadSection.tsx
    │   │   └── ui/               # Reusable UI primitives
    │   ├── hooks/
    │   │   └── useScrollAnimation.ts
    │   ├── utils/
    │   │   ├── aiService.ts      # AI integration (mock + real)
    │   │   ├── animations.ts     # Framer Motion variants
    │   │   ├── api.ts            # Backend API client
    │   │   ├── fastaParser.ts    # FASTA parsing + ORF detection
    │   │   ├── pdfGenerator.ts   # HTML report generation
    │   │   └── firebase.ts       # Firebase config (optional)
    │   ├── types.ts              # Unified SequenceMetadata interface
    │   ├── App.tsx               # Main app with view routing
    │   ├── main.tsx              # Vite entry point
    │   └── index.css             # Global styles
    ├── vite.config.ts            # Vite config with alias & proxy
    ├── tsconfig.json             # TypeScript config
    ├── package.json
    └── .env                      # VITE_API_URL (optional)
```

---

## 🔧 API Endpoints

### Sequences API (`/api/sequences`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sequences` | Get all sequences (with pagination) |
| GET | `/api/sequences/:id` | Get single sequence by ID |
| POST | `/api/sequences` | Create new sequence (from parsed FASTA) |
| DELETE | `/api/sequences/:id` | Delete sequence by ID |
| GET | `/api/health` | Health check endpoint |

---

## 🧪 Data Types

### Unified `SequenceMetadata` Interface

All components and utilities now use a single, consistent type:

```typescript
interface SequenceMetadata {
  id: string;              // Unique identifier
  name: string;            // FASTA header (without '>')
  sequence: string;        // Full nucleotide sequence (A,T,G,C)
  length: number;          // Total base pairs
  gcContent: number;       // GC percentage (0-100)
  nucleotideCounts: {      // Counts for each base
    A: number;
    T: number;
    G: number;
    C: number;
  };
  orfs: Array<{            // Detected open reading frames
    start: number;
    end: number;
    length: number;
    sequence: string;
  }>;
  createdAt: string;       // ISO timestamp
  description?: string;    // Optional metadata
}
```

**Note:** Previously used field names (`sequenceName`, `sequenceLength`, `gcPercentage`, `rawSequence`) have been unified to `name`, `length`, `gcContent`, and `sequence` respectively.

---

## 🎨 Key Components

- **UploadSection** - Drag-and-drop FASTA upload with parsing preview
- **RecentUploads** - Table view with download/delete actions
- **MetadataCards** - Visual display of nucleotide distribution
- **ReportViewer** - Comprehensive analysis report with AI insights
- **SequenceComparison** - Side-by-side comparison with similarity metrics
- **ChatbotAssistant** - Contextual help with bioinformatics explanations

---

## 🚢 Deployment

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy the 'dist' folder
```

Set environment variable: `VITE_API_URL=https://your-backend-url.com/api`

### Backend (Heroku/Railway/Render)
```bash
cd backend
# Ensure package.json has "start" script
npm start
```

Set environment variables:
- `MONGODB_URI=<your-mongodb-connection-string>`
- `PORT=3001`

---

## 🧹 Git Workflow

This repository uses `.gitignore` to exclude:
- `**/node_modules/` - Dependencies
- `**/dist/`, `**/build/` - Build artifacts
- `**/.vite/`, `**/.cache/` - Build caches
- `**/.env` - Environment secrets

**Current repo size:** ~113 tracked files (clean)

---

## 📝 Development Notes

### Type Safety
All frontend code uses TypeScript with strict mode. The unified `SequenceMetadata` interface ensures consistency across parsing, storage, and display.

### Animation System
Uses Framer Motion for page transitions and micro-interactions. Custom variants in `utils/animations.ts`.

### Offline-First
Frontend works without backend connection using mock data and localStorage fallback.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License - see LICENSE file for details

---

## 🐛 Troubleshooting

### Backend won't start
- Verify MongoDB is running: `mongod` or check connection URI
- Ensure `.env` file exists in `backend/` with `MONGODB_URI`

### Frontend build errors
- Clear cache: `rm -rf node_modules dist .vite && npm install`
- Check TypeScript errors: `npm run type-check`

### CORS issues
- Backend already has CORS enabled for all origins (dev mode)
- In production, restrict to specific origins in `server.js`

---

## 🔗 Resources

- [FASTA Format Specification](https://www.ncbi.nlm.nih.gov/BLAST/fasta.shtml)
- [Open Reading Frames (ORF)](https://en.wikipedia.org/wiki/Open_reading_frame)
- [GC Content Analysis](https://en.wikipedia.org/wiki/GC-content)

---

**Built with ❤️ for bioinformatics research**