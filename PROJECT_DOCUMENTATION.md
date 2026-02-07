# Symbio-NLM (Symbio Insight App)
## Comprehensive Project Documentation

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [System Architecture](#2-system-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Project Structure](#4-project-structure)
5. [Frontend Components](#5-frontend-components)
6. [Backend API](#6-backend-api)
7. [Database Schema](#7-database-schema)
8. [Core Features](#8-core-features)
9. [FASTA File Format](#9-fasta-file-format)
10. [Bioinformatics Calculations](#10-bioinformatics-calculations)
11. [Data Flow](#11-data-flow)
12. [Authentication System](#12-authentication-system)
13. [AI Integration](#13-ai-integration)
14. [Configuration](#14-configuration)
15. [Deployment](#15-deployment)
16. [Troubleshooting](#16-troubleshooting)

---

## 1. Introduction

### What is Symbio-NLM?

**Symbio-NLM** (Natural Language Molecular Analysis) is a full-stack web application designed for DNA and RNA sequence analysis. It provides researchers, students, and bioinformaticians with an intuitive interface to:

- Upload and parse FASTA sequence files
- Extract comprehensive metadata from sequences
- Visualize nucleotide composition and patterns
- Detect Open Reading Frames (ORFs)
- Generate professional PDF/HTML reports
- Get AI-powered insights using Google Gemini

### Target Users

| User Type | Use Case |
|-----------|----------|
| **Researchers** | Analyze experimental DNA sequences, generate publication-ready reports |
| **Students** | Learn genomics concepts through interactive visualization |
| **Bioinformaticians** | Quick sequence analysis without command-line tools |
| **Lab Teams** | Collaborative sequence analysis and sharing |

### Key Benefits

- **No Installation Required** - Web-based, runs in any browser
- **Instant Analysis** - Real-time parsing and calculations
- **Visual Reports** - Charts, graphs, and downloadable PDFs
- **AI Assistance** - Natural language queries about your data
- **Cloud Storage** - Sequences stored securely in MongoDB Atlas

---

## 2. System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENT TIER                                 │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                     React Frontend (Vite)                          │  │
│  │  Port: 3000 | http://localhost:3000                               │  │
│  │                                                                    │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐            │  │
│  │  │Dashboard │ │ Metadata │ │  Report  │ │  Recent  │            │  │
│  │  │  Page    │ │   Page   │ │   Page   │ │   Page   │            │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘            │  │
│  │                                                                    │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐            │  │
│  │  │ Profile  │ │ Settings │ │  Login   │ │  Signup  │            │  │
│  │  │   Page   │ │   Page   │ │   Page   │ │   Page   │            │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘            │  │
│  │                                                                    │  │
│  │  Shared Components: Sidebar, TopBar, ChatbotAssistant, Charts     │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ REST API (HTTP/JSON)
                                    │ Authentication: JWT Bearer Tokens
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                            APPLICATION TIER                              │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                  Node.js + Express Backend                         │  │
│  │  Port: 3002 | http://localhost:3002                               │  │
│  │                                                                    │  │
│  │  Routes:                                                           │  │
│  │  ├── /api/sequences     - CRUD operations for sequences          │  │
│  │  ├── /api/auth          - Authentication (login/signup)          │  │
│  │  ├── /api/ai            - Gemini AI integration                  │  │
│  │  ├── /api/storage       - Storage management                     │  │
│  │  ├── /api/fasta         - FASTA-specific operations              │  │
│  │  └── /api/admin         - Administrative functions               │  │
│  │                                                                    │  │
│  │  Middleware: CORS, Authentication, Validation, Compression        │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Database Queries
                                    │ Mongoose ODM / Sequelize ORM
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              DATA TIER                                   │
│  ┌─────────────────────────────┐  ┌─────────────────────────────────┐  │
│  │      MongoDB Atlas          │  │         SQLite                   │  │
│  │      (Primary)              │  │         (Fallback)               │  │
│  │                             │  │                                  │  │
│  │  Collections:               │  │  Tables:                         │  │
│  │  ├── sequences              │  │  ├── Sequences                   │  │
│  │  └── users                  │  │  └── Users                       │  │
│  │                             │  │                                  │  │
│  │  Cloud-hosted, scalable     │  │  Local file-based database      │  │
│  └─────────────────────────────┘  └─────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ External APIs
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          EXTERNAL SERVICES                               │
│  ┌─────────────────────────────┐  ┌─────────────────────────────────┐  │
│  │     Google Gemini AI        │  │       RCSB PDB API               │  │
│  │                             │  │                                  │  │
│  │  - Sequence analysis        │  │  - Protein structure lookup      │  │
│  │  - Natural language chat    │  │  - 3D visualization data        │  │
│  │  - Report summaries         │  │                                  │  │
│  └─────────────────────────────┘  └─────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

### Communication Flow

1. **User → Frontend**: User interacts with React UI
2. **Frontend → Backend**: Axios/Fetch API calls to Express server
3. **Backend → Database**: Mongoose queries to MongoDB Atlas
4. **Backend → AI**: Gemini API calls for intelligent analysis
5. **Response flows back** through the same path

---

## 3. Technology Stack

### Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.x | UI component library |
| **Vite** | 6.3.5 | Build tool and dev server |
| **Tailwind CSS** | 3.x | Utility-first CSS framework |
| **Motion (Framer)** | - | Animation library |
| **React Router** | 6.x | Client-side routing |
| **Sonner** | - | Toast notifications |
| **Recharts** | - | Chart visualizations |

### Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18+ | JavaScript runtime |
| **Express.js** | 4.x | Web framework |
| **Mongoose** | 8.x | MongoDB ODM |
| **Sequelize** | 6.x | SQL ORM (SQLite) |
| **PDFKit** | - | PDF generation |
| **Multer** | - | File upload handling |
| **JWT** | - | Authentication tokens |
| **Compression** | - | Response compression |

### Database

| Database | Type | Use Case |
|----------|------|----------|
| **MongoDB Atlas** | NoSQL (Cloud) | Primary production database |
| **SQLite** | SQL (Local) | Development fallback |

### External APIs

| Service | Purpose |
|---------|---------|
| **Google Gemini** | AI-powered sequence analysis and chat |
| **RCSB PDB** | Protein Data Bank structure lookup |

---

## 4. Project Structure

### Root Directory

```
symbio-insight-app/
├── frontend/                 # React frontend application
├── backend/                  # Node.js backend API
├── dataconnect/             # Firebase Data Connect config
├── package.json             # Root package (optional scripts)
├── vercel.json              # Vercel deployment config
├── README.md                # Project readme
└── PROJECT_DOCUMENTATION.md # This file
```

### Frontend Structure (`/frontend`)

```
frontend/
├── public/                  # Static assets
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── AnimatedPage.jsx      # Page transition animations
│   │   ├── Charts.jsx            # Bar and Pie chart components
│   │   ├── ChatbotAssistant.jsx  # AI chatbot interface
│   │   ├── CodonFrequency.jsx    # Codon analysis display
│   │   ├── ConfirmDialog.jsx     # Confirmation modals
│   │   ├── DarkModeToggle.jsx    # Theme switcher
│   │   ├── ErrorBoundary.jsx     # Error handling wrapper
│   │   ├── Icons.jsx             # SVG icon components
│   │   ├── Login.jsx             # Login form
│   │   ├── Logo.jsx              # App logo
│   │   ├── MetadataCards.jsx     # Sequence metadata display
│   │   ├── ProtectedRoute.jsx    # Auth route guard
│   │   ├── QuickAccess.jsx       # Quick action buttons
│   │   ├── RecentUploads.jsx     # File list table
│   │   ├── ReportViewer.jsx      # Report generation UI
│   │   ├── RightPanel.jsx        # Side panel
│   │   ├── SequenceComparison.jsx # Compare sequences
│   │   ├── Sidebar.jsx           # Navigation sidebar
│   │   ├── Signup.jsx            # Registration form
│   │   ├── StorageOptions.jsx    # Storage config
│   │   ├── TopBar.jsx            # Header with search
│   │   └── UploadSection.jsx     # File upload area
│   │
│   ├── pages/               # Route-level page components
│   │   ├── DashboardPage.jsx     # Home/upload page
│   │   ├── LoginPage.jsx         # Authentication page
│   │   ├── MetadataPage.jsx      # Sequence analysis view
│   │   ├── ProfilePage.jsx       # User profile
│   │   ├── RecentPage.jsx        # Upload history
│   │   ├── ReportPage.jsx        # Report generation
│   │   ├── SettingsPage.jsx      # App settings
│   │   └── SignupPage.jsx        # Registration page
│   │
│   ├── context/             # React Context providers
│   │   ├── AuthContext.jsx       # Authentication state
│   │   └── NotificationContext.jsx # Toast notifications
│   │
│   ├── hooks/               # Custom React hooks
│   │   └── useScrollAnimation.js # Scroll-based animations
│   │
│   ├── utils/               # Utility functions
│   │   ├── fastaParser.js        # FASTA file parsing
│   │   ├── sequenceApi.js        # API client functions
│   │   ├── aiService.js          # AI integration
│   │   ├── reportGenerator.js    # Client-side reports
│   │   └── animations.js         # Animation utilities
│   │
│   ├── styles/              # Global styles
│   ├── App.jsx              # Root component
│   ├── main.jsx             # Entry point
│   └── index.css            # Global CSS
│
├── index.html               # HTML template
├── vite.config.js           # Vite configuration
├── tailwind.config.js       # Tailwind configuration
└── package.json             # Dependencies
```

### Backend Structure (`/backend`)

```
backend/
├── config/
│   ├── database.js          # SQLite configuration
│   ├── mongodb.js           # MongoDB Atlas connection
│   └── firebase.js          # Firebase configuration
│
├── middleware/
│   ├── authMiddleware.js    # JWT authentication
│   └── validation.js        # Request validation
│
├── models/
│   ├── Sequence.js          # SQLite Sequence model
│   ├── SequenceMongo.js     # MongoDB Sequence schema
│   ├── User.js              # SQLite User model
│   └── UserMongo.js         # MongoDB User schema
│
├── routes/
│   ├── sequences.js         # /api/sequences endpoints
│   ├── auth.js              # /api/auth endpoints
│   ├── ai.js                # /api/ai endpoints
│   ├── storage.js           # /api/storage endpoints
│   ├── fasta.js             # /api/fasta endpoints
│   └── admin.js             # /api/admin endpoints
│
├── services/
│   └── geminiService.js     # Google Gemini AI service
│
├── utils/
│   ├── pdfGenerator.js      # PDF report generation
│   ├── biopythonFasta.js    # Python FASTA parser bridge
│   └── fasta_parser.py      # Python FASTA parser
│
├── scripts/
│   ├── forceStorageAtlas.js # Migration script
│   ├── insertSequence.js    # Test data insertion
│   └── inspectSequences.js  # Database inspection
│
├── temp/                    # Temporary file storage
├── server.js                # Main Express application
├── .env                     # Environment variables
└── package.json             # Dependencies
```

---

## 5. Frontend Components

### Page Components

#### DashboardPage (`/dashboard`)
The main entry point for users. Contains the file upload interface.

```jsx
// Key functionality:
- Drag-and-drop FASTA file upload
- File validation
- Parse preview before saving
- Navigate to Metadata after upload
```

#### MetadataPage (`/metadata`)
Displays comprehensive analysis of uploaded sequences.

```jsx
// Key functionality:
- File selector dropdown
- Aggregate statistics cards
- Nucleotide distribution charts
- GC content pie chart
- Individual sequence details
- Codon frequency analysis
- Generate report button
```

#### ReportPage (`/report`)
Generate and download analysis reports.

```jsx
// Key functionality:
- AI-generated summary
- Key metrics display
- Download PDF button
- Download HTML button
- Individual sequence analysis
```

#### RecentPage (`/recent`)
View and manage previously uploaded files.

```jsx
// Key functionality:
- Paginated file list
- Search and filter
- View/Delete actions
- Sequence comparison tool
```

### Core Components

#### UploadSection
Handles file upload with drag-and-drop support.

```jsx
// Features:
- Drag-and-drop zone
- File type validation (.fasta, .fa)
- Real-time parsing
- Preview modal with Accept/Reject
- Backend upload on accept
```

#### MetadataCards
Displays sequence analysis results.

```jsx
// Features:
- Summary statistics cards
- Nucleotide distribution bar chart
- GC/AT ratio pie chart
- Individual sequence expandable cards
- Codon frequency tables
```

#### ChatbotAssistant
AI-powered assistant for sequence queries.

```jsx
// Features:
- Natural language input
- Context-aware responses
- Quick action buttons
- Conversation history
- Sequence-specific insights
```

#### Charts (BarChart & PieChart)
Visualization components with animations.

```jsx
// BarChart: Nucleotide distribution (A, T, G, C)
// PieChart: GC vs AT content ratio
// Features:
- Animated transitions
- Hover tooltips
- Dark mode support
```

---

## 6. Backend API

### API Base URL
- **Development**: `http://localhost:3002/api`
- **Production**: `https://your-domain.com/api`

### Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### Endpoints Reference

#### Sequences API (`/api/sequences`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/` | List all sequences (paginated) | No |
| `GET` | `/:id` | Get sequence by ID | No |
| `POST` | `/` | Create sequence from JSON | No |
| `POST` | `/upload` | Upload FASTA file | No |
| `DELETE` | `/:id` | Delete sequence | No |
| `DELETE` | `/bulk` | Delete multiple sequences | No |
| `POST` | `/report` | Generate PDF report | No |

**GET `/api/sequences`** - List Sequences
```javascript
// Query Parameters:
{
  page: 1,           // Page number (default: 1)
  limit: 20,         // Items per page (default: 20)
  sort: '-createdAt', // Sort field (prefix '-' for DESC)
  search: 'gene'     // Search in name/header/filename
}

// Response:
{
  data: [
    {
      id: "507f1f77bcf86cd799439011",
      filename: "sequence.fasta",
      name: "Gene_XYZ",
      header: "Gene_XYZ Homo sapiens",
      length: 1500,
      gcPercent: 45.2,
      orfDetected: true,
      orfCount: 3,
      nucleotideCounts: { A: 400, T: 420, G: 340, C: 340 },
      sequences: [...],
      sequenceCount: 5,
      createdAt: "2026-02-08T10:30:00Z"
    }
  ],
  meta: {
    page: 1,
    limit: 20,
    total: 45,
    totalPages: 3
  }
}
```

**POST `/api/sequences/upload`** - Upload File
```javascript
// Request: multipart/form-data
// Body: file (FASTA file)

// Response:
{
  id: "507f1f77bcf86cd799439011",
  filename: "uploaded_sequence.fasta",
  message: "File uploaded successfully",
  sequenceCount: 5
}
```

#### Authentication API (`/api/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/login` | User login |
| `POST` | `/signup` | User registration |
| `GET` | `/me` | Get current user |

**POST `/api/auth/login`**
```javascript
// Request:
{
  email: "user@example.com",
  password: "securepassword"
}

// Response:
{
  token: "eyJhbGciOiJIUzI1NiIs...",
  user: {
    id: "507f1f77bcf86cd799439011",
    email: "user@example.com",
    name: "John Doe"
  }
}
```

#### AI API (`/api/ai`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/chat` | Chat with AI assistant |
| `POST` | `/analyze` | Get AI sequence analysis |
| `GET` | `/health` | Check AI service status |

**POST `/api/ai/chat`**
```javascript
// Request:
{
  message: "What is the GC content of my sequences?",
  context: {
    sequences: [...],
    stats: {...}
  }
}

// Response:
{
  response: "Based on your sequences, the average GC content is 48.5%...",
  suggestions: ["Compare with reference genome", "Check for mutations"]
}
```

#### Health Check (`/api/health`)

```javascript
// Response:
{
  status: "ok",
  time: "2026-02-08T10:30:00Z",
  database: "connected",
  storageMode: "atlas",
  version: "1.0.0",
  uptime: 3600
}
```

---

## 7. Database Schema

### MongoDB Schema (SequenceMongo)

```javascript
const SequenceMongoSchema = {
  // User Reference
  userId: String,              // Optional user ID
  
  // Basic Sequence Info
  name: String,                // Sequence name (required)
  header: String,              // FASTA header line
  sequence: String,            // Raw nucleotide sequence (required)
  
  // Calculated Metrics
  length: Number,              // Sequence length in bp (required)
  gcContent: Number,           // GC percentage (required)
  atContent: Number,           // AT percentage
  
  // ORF Analysis
  orfDetected: Boolean,        // Whether ORFs were found
  orfCount: Number,            // Number of ORFs
  orfs: Mixed,                 // Array of ORF objects
  
  // Nucleotide Counts
  nucleotideCounts: {
    A: Number,                 // Adenine count
    T: Number,                 // Thymine count
    G: Number,                 // Guanine count
    C: Number                  // Cytosine count
  },
  
  // Codon Analysis
  codonFrequency: Mixed,       // Codon frequency object
  codonStats: Mixed,           // Codon statistics
  
  // File Information
  filename: String,            // Original filename (required)
  fileSize: Number,            // File size in bytes
  
  // Multi-sequence Support
  sequences: Mixed,            // Array of individual sequences
  sequenceCount: Number,       // Number of sequences in file
  
  // AI Analysis
  aiSummary: String,           // AI-generated summary
  speciesPrediction: String,   // Predicted species
  genomeType: String,          // Genome classification
  
  // Metadata
  title: String,
  description: String,
  tags: [String],
  
  // Storage Type
  storageType: {
    type: String,
    enum: ['local', 'atlas'],
    default: 'atlas'
  },
  
  // Timestamps (auto-generated)
  createdAt: Date,
  updatedAt: Date
};

// Indexes for Performance
- { name: 'text', header: 'text' }  // Full-text search
- { createdAt: -1 }                  // Recent first
- { gcContent: 1 }                   // GC filtering
- { length: 1 }                      // Length filtering
```

### ORF Object Structure

```javascript
{
  start: Number,       // Start position (0-indexed)
  end: Number,         // End position
  length: Number,      // ORF length in bp
  sequence: String,    // First 100 chars of ORF sequence
  frame: Number        // Reading frame (0, 1, or 2)
}
```

---

## 8. Core Features

### 8.1 FASTA File Upload

**Process Flow:**
1. User drags/selects a FASTA file
2. Frontend validates file extension (.fasta, .fa)
3. File content is read using FileReader API
4. JavaScript parser extracts sequences
5. Metadata is calculated for each sequence
6. Preview is shown with Accept/Reject options
7. On Accept: POST to `/api/sequences/upload`
8. Backend stores in MongoDB Atlas
9. User redirected to Metadata page

### 8.2 Sequence Analysis

For each sequence, the following is calculated:

| Metric | Description | Formula |
|--------|-------------|---------|
| **Length** | Total nucleotides | `sequence.length` |
| **GC Content** | GC percentage | `(G + C) / total × 100` |
| **Nucleotides** | Individual counts | Count of A, T, G, C |
| **ORFs** | Protein-coding regions | ATG...STOP pattern |
| **Codons** | Triplet frequency | Group by 3, count each |

### 8.3 Report Generation

**PDF Report Contents:**
- Header with app branding
- Summary statistics
- Nucleotide distribution chart
- GC content analysis
- ORF detection results
- Individual sequence details
- AI-generated insights
- Timestamp and metadata

**Generation Methods:**
1. **Backend PDF** (Primary): Uses PDFKit on server
2. **Client PDF** (Fallback): Uses browser-based generation

### 8.4 AI Chatbot

**Capabilities:**
- Answer questions about uploaded sequences
- Explain bioinformatics concepts
- Suggest analysis approaches
- Provide species predictions
- Compare sequence characteristics
- **Search RCSB PDB for protein structures**
- **Look up specific PDB entries by ID**

**Example Queries:**
- "What is the GC content of my sequences?"
- "Are there any potential genes in this sequence?"
- "Compare my sequence to E. coli"
- "What proteins might this sequence encode?"
- **"Find hemoglobin structures"** (searches PDB)
- **"Tell me about 1HHO"** (looks up PDB ID)

### 8.5 RCSB PDB Integration

The app integrates with the **RCSB Protein Data Bank** API to provide protein structure information.

**File:** `frontend/src/utils/pdbService.js`

**Available Functions:**

| Function | Purpose |
|----------|---------|
| `getPDBEntry(pdbId)` | Fetch detailed info about a PDB structure |
| `searchPDB(query)` | Search PDB by protein/molecule name |
| `searchPDBBySequence(seq)` | Find similar structures by sequence |
| `getPDBPolymers(pdbId)` | Get polymer entities in a structure |
| `getPDBLigands(pdbId)` | Get bound ligands/small molecules |

**API Endpoints Used:**
- `https://data.rcsb.org/rest/v1/core/entry/{pdbId}` - Entry details
- `https://search.rcsb.org/rcsbsearch/v2/query` - Text/sequence search

**Chatbot Integration:**
Users can query PDB directly through the AI chatbot:
- "Find insulin structures" → Searches PDB
- "What is 6LU7?" → Looks up COVID-19 main protease structure
- "Show hemoglobin" → Returns top hemoglobin structures

---

## 9. FASTA File Format

### What is FASTA?

FASTA is a text-based format for representing nucleotide or protein sequences. It's the most widely used format in bioinformatics.

### Format Structure

```
>Header_Line Description and metadata
SEQUENCE_DATA_LINE_1
SEQUENCE_DATA_LINE_2
...
>Next_Sequence_Header
SEQUENCE_DATA
...
```

### Example FASTA File

```fasta
>Gene_ABC Homo sapiens chromosome 1
ATGCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATC
GCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTA
ATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCG

>Gene_XYZ Mus musculus mitochondrial
GCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTA
ATGCATGCATGCATGCATGCATGCATGCATGCATGCATGCATGCATGCATGCATGCATGC
```

### Components

| Component | Description | Example |
|-----------|-------------|---------|
| `>` | Header indicator | Always starts with `>` |
| Header | Sequence identifier | `Gene_ABC` |
| Description | Optional metadata | `Homo sapiens chromosome 1` |
| Sequence | Nucleotides (A, T, G, C) | `ATGCGATC...` |

### Nucleotide Codes

| Code | Nucleotide | Base Pairing |
|------|------------|--------------|
| A | Adenine | Pairs with T |
| T | Thymine | Pairs with A |
| G | Guanine | Pairs with C |
| C | Cytosine | Pairs with G |
| N | Any nucleotide | Unknown |

---

## 10. Bioinformatics Calculations

### 10.1 GC Content

**What is GC Content?**
GC content is the percentage of guanine (G) and cytosine (C) bases in a DNA sequence. It's an important metric because:

- G-C base pairs have 3 hydrogen bonds (vs 2 for A-T)
- Higher GC = more stable DNA (higher melting temperature)
- Different organisms have characteristic GC content
- Gene-rich regions often have higher GC content

**Formula:**
```
GC% = (Count of G + Count of C) / Total Nucleotides × 100
```

**Example:**
```
Sequence: ATGCGATCGATCGATC (16 bp)
A = 3, T = 4, G = 4, C = 5
GC% = (4 + 5) / 16 × 100 = 56.25%
```

**Interpretation:**
| GC% Range | Interpretation |
|-----------|----------------|
| < 30% | AT-rich (some bacteria) |
| 30-50% | Typical for mammals |
| 50-70% | GC-rich (some bacteria) |
| > 70% | Very GC-rich (rare) |

### 10.2 Open Reading Frames (ORFs)

**What is an ORF?**
An Open Reading Frame is a section of DNA that potentially codes for a protein. It:
- Starts with a **start codon** (ATG)
- Ends with a **stop codon** (TAA, TAG, or TGA)
- Has a length that's a multiple of 3 (codons)

**Detection Algorithm:**
```javascript
function detectORFs(sequence) {
  const startCodon = 'ATG';
  const stopCodons = ['TAA', 'TAG', 'TGA'];
  const orfs = [];
  
  // Check all three reading frames
  for (let frame = 0; frame < 3; frame++) {
    for (let i = frame; i < sequence.length - 5; i += 3) {
      if (sequence.substring(i, i + 3) === startCodon) {
        // Found start codon, look for stop codon
        for (let j = i + 3; j < sequence.length - 2; j += 3) {
          const codon = sequence.substring(j, j + 3);
          if (stopCodons.includes(codon)) {
            orfs.push({
              start: i,
              end: j + 3,
              length: j + 3 - i,
              frame: frame
            });
            break;
          }
        }
      }
    }
  }
  return orfs;
}
```

### 10.3 Codon Frequency

**What are Codons?**
Codons are triplets of nucleotides that encode amino acids during protein synthesis. There are 64 possible codons (4³ = 64).

**Codon Table (Partial):**
| Codon | Amino Acid | Type |
|-------|------------|------|
| ATG | Methionine (Start) | Start codon |
| TAA | Stop | Stop codon |
| TAG | Stop | Stop codon |
| TGA | Stop | Stop codon |
| TTT | Phenylalanine | Nonpolar |
| GGG | Glycine | Nonpolar |
| AAA | Lysine | Positive |

**Codon Usage Bias:**
Different organisms prefer different codons for the same amino acid. This is called "codon usage bias" and can indicate:
- Organism origin
- Gene expression levels
- Evolutionary relationships

---

## 11. Data Flow

### Upload Flow (Detailed)

```
┌────────────────────────────────────────────────────────────────────────┐
│                         UPLOAD PROCESS                                  │
└────────────────────────────────────────────────────────────────────────┘

Step 1: File Selection
┌─────────────────────────────────────────────────────────────────────────┐
│  User drags file to UploadSection.jsx                                   │
│  ↓                                                                      │
│  Validate: .fasta or .fa extension                                      │
│  ↓                                                                      │
│  Read file content: FileReader.readAsText()                             │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
Step 2: Client-Side Parsing (fastaParser.js)
┌─────────────────────────────────────────────────────────────────────────┐
│  parseFastaFile(content)                                                │
│  ↓                                                                      │
│  Split by lines                                                         │
│  ↓                                                                      │
│  For each sequence:                                                     │
│    - Extract header (lines starting with >)                             │
│    - Concatenate sequence lines                                         │
│    - Call extractMetadata(header, sequence)                             │
│                                                                         │
│  extractMetadata():                                                     │
│    - countNucleotides() → {A, T, G, C}                                 │
│    - calculateGCPercentage() → 45.2%                                   │
│    - detectORFs() → [{start, end, length}, ...]                        │
│    - calculateCodonFrequency() → {ATG: 5, ...}                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
Step 3: Preview
┌─────────────────────────────────────────────────────────────────────────┐
│  Show parsed data in modal                                              │
│    - Number of sequences                                                │
│    - Total length                                                       │
│    - Preview of first sequence                                          │
│  ↓                                                                      │
│  User clicks "Accept" or "Reject"                                       │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
Step 4: Backend Upload (on Accept)
┌─────────────────────────────────────────────────────────────────────────┐
│  POST /api/sequences/upload                                             │
│    - Body: FormData with file                                           │
│    - Header: X-Fasta-Parser: 'js'                                       │
│  ↓                                                                      │
│  Backend receives file (multer)                                         │
│  ↓                                                                      │
│  parseFastaToMetadata(fileContent)                                      │
│  ↓                                                                      │
│  SequenceMongo.create(metadata)                                         │
│  ↓                                                                      │
│  Return: { id, filename, sequenceCount }                                │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
Step 5: Navigation
┌─────────────────────────────────────────────────────────────────────────┐
│  Frontend calls onUploadComplete(parsedData)                            │
│  ↓                                                                      │
│  setParsedSequences(parsedData)                                         │
│  ↓                                                                      │
│  navigate('/metadata')                                                  │
│  ↓                                                                      │
│  MetadataPage receives parsedSequences as prop                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Analysis Flow

```
MetadataPage.jsx
      │
      ├── Receives parsedSequences prop
      │
      ├── transformToFrontendFormat(data)
      │     └── Normalizes backend/frontend data differences
      │
      ├── Renders MetadataCards component
      │
      └── MetadataCards.jsx
            │
            ├── calculateAggregateStats(sequences)
            │     ├── Total sequences
            │     ├── Total length
            │     ├── Average GC%
            │     ├── Total ORFs
            │     └── Nucleotide totals
            │
            ├── Render summary cards
            │
            ├── Render charts
            │     ├── BarChart (nucleotide distribution)
            │     └── PieChart (GC/AT ratio)
            │
            └── Render individual sequence cards
                  └── CodonFrequency component
```

---

## 12. Authentication System

### JWT Token Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│                      AUTHENTICATION FLOW                                │
└────────────────────────────────────────────────────────────────────────┘

1. Login Request
┌─────────────────────────────────────────────────────────────────────────┐
│  POST /api/auth/login                                                   │
│  Body: { email, password }                                              │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
2. Server Validation
┌─────────────────────────────────────────────────────────────────────────┐
│  Find user by email                                                     │
│  Compare password hash (bcrypt)                                         │
│  Generate JWT token (24h expiry)                                        │
│  Return: { token, user }                                                │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
3. Client Storage
┌─────────────────────────────────────────────────────────────────────────┐
│  localStorage.setItem('symbio_nlm_auth_token', token)                   │
│  AuthContext updates user state                                         │
│  Redirect to dashboard                                                  │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
4. Subsequent Requests
┌─────────────────────────────────────────────────────────────────────────┐
│  Authorization: Bearer <token>                                          │
│  authMiddleware verifies token                                          │
│  req.user = decoded payload                                             │
└─────────────────────────────────────────────────────────────────────────┘
```

### Protected Routes

```jsx
// ProtectedRoute.jsx
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" />;
  
  return children;
}

// Usage in App.jsx
<Route path="/dashboard" element={
  <ProtectedRoute>
    <DashboardPage />
  </ProtectedRoute>
} />
```

---

## 13. AI Integration

### Google Gemini Service

**File:** `backend/services/geminiService.js`

**Capabilities:**
1. **Sequence Analysis** - Interpret biological significance
2. **Chat Responses** - Answer user questions
3. **Report Summaries** - Generate natural language summaries
4. **Species Prediction** - Identify likely organism source

### API Integration

```javascript
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

async function analyzeSequence(sequenceData) {
  const prompt = `
    Analyze this DNA sequence data:
    - Length: ${sequenceData.length} bp
    - GC Content: ${sequenceData.gcContent}%
    - ORFs Found: ${sequenceData.orfCount}
    
    Provide insights about potential genes and biological significance.
  `;
  
  const result = await model.generateContent(prompt);
  return result.response.text();
}
```

### Chatbot Context

The chatbot receives context about:
- Currently loaded sequences
- Aggregate statistics
- User's current page/view
- Conversation history

---

## 14. Configuration

### Environment Variables

**Backend (`.env`):**
```env
# Server
PORT=3002
NODE_ENV=development

# Database
STORAGE_MODE=atlas
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/symbio-nlm

# Authentication
JWT_SECRET=your-super-secret-key-change-in-production

# AI
GEMINI_API_KEY=your-gemini-api-key

# Frontend
FRONTEND_URL=http://localhost:3000

# Optional: Firebase
FIREBASE_PROJECT_ID=your-project
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@project.iam.gserviceaccount.com
```

### Storage Modes

| Mode | Database | Use Case |
|------|----------|----------|
| `atlas` | MongoDB Atlas | Production, cloud-hosted |
| `sqlite` | Local SQLite | Development, offline |

**Switching Modes:**
```env
STORAGE_MODE=atlas  # or 'sqlite'
```

### Vite Configuration

**`vite.config.js`:**
```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true
      }
    }
  }
});
```

---

## 15. Deployment

### Vercel Deployment

**`vercel.json`:**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/server.js",
      "use": "@vercel/node"
    },
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "backend/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "frontend/$1"
    }
  ]
}
```

### Deployment Checklist

- [ ] Set production environment variables in Vercel
- [ ] Configure MongoDB Atlas IP whitelist (allow all: 0.0.0.0/0)
- [ ] Update `FRONTEND_URL` for CORS
- [ ] Enable Gemini API for production
- [ ] Test all endpoints post-deployment

---

## 16. Troubleshooting

### Common Issues

#### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3002
```
**Solution:**
```powershell
# Windows
Stop-Process -Name "node" -Force

# Then restart
npm run dev
```

#### MongoDB Connection Failed
```
Error: MongoServerError: bad auth
```
**Solution:**
- Check `MONGODB_URI` in `.env`
- Verify username/password
- Check IP whitelist in MongoDB Atlas

#### CORS Error
```
Access to fetch blocked by CORS policy
```
**Solution:**
- Verify `FRONTEND_URL` in backend `.env`
- Check `allowedOrigins` array in `server.js`

#### File Upload Fails
```
Error: Multer: File size too large
```
**Solution:**
- Check file size (max 10MB by default)
- Increase limit in `sequences.js`:
  ```javascript
  const upload = multer({
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB
  });
  ```

#### GC% Shows N/A
**Cause:** Falsy value check treats 0 as false
**Solution:** Use `typeof value === 'number'` instead of truthy check

---

## Appendix A: Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + K` | Open search |
| `Ctrl + U` | Upload file |
| `Esc` | Close modal/panel |

## Appendix B: API Error Codes

| Code | Meaning |
|------|---------|
| 400 | Bad Request (invalid input) |
| 401 | Unauthorized (invalid/missing token) |
| 404 | Not Found (resource doesn't exist) |
| 500 | Server Error (check logs) |

## Appendix C: Glossary

| Term | Definition |
|------|------------|
| **FASTA** | Text format for nucleotide/protein sequences |
| **GC Content** | Percentage of G+C bases in DNA |
| **ORF** | Open Reading Frame, potential gene region |
| **Codon** | Three-nucleotide unit encoding amino acid |
| **bp** | Base pairs, unit of DNA length |
| **Nucleotide** | Building block of DNA (A, T, G, C) |

---

*Documentation generated for Symbio-NLM v1.0.0*
*Last updated: February 2026*
