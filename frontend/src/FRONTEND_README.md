# Symbio-NLM Frontend

Modern React + TypeScript + Tailwind CSS frontend for DNA sequence analysis.

## 🚀 Features

### ✅ Core Functionality
- **FASTA File Upload** - Drag & drop or click to upload
- **Real-time Parsing** - Client-side FASTA parser
- **Metadata Extraction:**
  - Sequence names (from headers)
  - Sequence lengths (bp)
  - GC percentages
  - Nucleotide counts (A, T, G, C)
  - ORF detection (ATG start, TAA/TGA/TAG stop)
  - Unique IDs
  - Timestamps
- **Interactive Dashboard** - 4 main views
- **Custom Charts** - Bar and pie charts
- **Backend Integration** - API calls to Node.js backend
- **File Management** - View, download, delete
- **Search & Filter** - Find sequences quickly

### 🎨 UI/UX
- **Medical Theme** - Soft sky blue, aqua gradients
- **Responsive Design** - Works on all screen sizes
- **Smooth Animations** - Professional transitions
- **Loading States** - Clear feedback
- **Error Handling** - User-friendly messages

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API running (optional)

## 🔧 Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create `.env.local`:

```env
REACT_APP_API_URL=http://localhost:3001/api
```

### 3. Start Development Server

```bash
npm start
```

Application will run on http://localhost:3000

## 📁 Project Structure

```
src/
├── components/
│   ├── Sidebar.tsx              # Left navigation
│   ├── TopBar.tsx               # Top navigation bar
│   ├── RightPanel.tsx           # Slide-in info panel
│   ├── UploadSection.tsx        # File upload component
│   ├── RecentUploads.tsx        # File list table
│   ├── MetadataCards.tsx        # Dashboard with charts
│   ├── ReportViewer.tsx         # Report generation
│   ├── QuickAccess.tsx          # Quick action cards
│   ├── Icons.tsx                # Custom SVG icons
│   └── Charts.tsx               # Custom chart components
├── utils/
│   ├── fastaParser.ts           # FASTA parsing logic
│   ├── api.ts                   # Backend API client
│   └── firebase.ts              # Firebase config (optional)
├── styles/
│   └── globals.css              # Tailwind + custom styles
├── App.tsx                      # Main app component
└── index.tsx                    # Entry point
```

## 🎯 How It Works

### 1. Upload FASTA File

```tsx
// User uploads file
<UploadSection onUploadComplete={handleUpload} />

// File is parsed client-side
const sequences = parseFastaFile(fileContent);

// Metadata is extracted
{
  id: "seq_123...",
  sequenceName: "Sequence_001",
  sequenceLength: 1250,
  gcPercentage: 45.2,
  nucleotideCounts: { A: 280, T: 305, G: 320, C: 345 },
  orfs: [...],
  rawSequence: "ATCG...",
  timestamp: "2024-11-28T10:00:00Z"
}

// Data sent to backend
await uploadSequences(sequences, fileName, fileSize);
```

### 2. View Dashboard

```tsx
// Real-time charts with actual data
<MetadataCards parsedSequences={sequences} />

// Stats calculated from parsed data
const stats = calculateAggregateStats(sequences);
```

### 3. Generate Reports

```tsx
// AI-generated insights
<ReportViewer parsedSequences={sequences} />
```

## 🔌 API Integration

### Configure Backend URL

```typescript
// utils/api.ts
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
```

### API Methods

```typescript
// Upload sequences
await uploadSequences(sequences, fileName, fileSize);

// Get all sequences
const { sequences } = await getAllSequences(limit, offset);

// Get single sequence
const sequence = await getSequenceById(id);

// Delete sequence
await deleteSequence(id);

// Search sequences
const results = await searchSequences(query);

// Get statistics
const stats = await getStatistics();
```

### Offline Mode

App works without backend:
- Parsing happens client-side
- Data stored in React state
- Shows warning: "Backend not connected - data stored locally only"

## 🎨 Customization

### Colors

Edit `/styles/globals.css`:

```css
:root {
  --sky-400: #38bdf8;
  --cyan-400: #22d3ee;
  /* Add your colors */
}
```

### Charts

Edit `/components/Charts.tsx`:

```typescript
export function BarChart({ data }: ChartProps) {
  // Customize chart appearance
}
```

### Icons

Edit `/components/Icons.tsx`:

```typescript
export const Icons = {
  Upload: (props) => <svg>...</svg>,
  // Add your icons
};
```

## 📊 FASTA Parser

### Algorithm

```typescript
// 1. Split file by lines
const lines = fileContent.split('\n');

// 2. Find headers (lines starting with >)
if (line.startsWith('>')) {
  currentHeader = line.substring(1);
}

// 3. Accumulate sequence
currentSequence += line.toUpperCase();

// 4. Extract metadata
- Count nucleotides: A, T, G, C
- Calculate GC%: (G + C) / total
- Detect ORFs: Find ATG...TAA/TGA/TAG patterns

// 5. Generate unique ID
const id = `seq_${Date.now()}_${random()}`;
```

### ORF Detection

```typescript
// Find start codon (ATG)
// Look for stop codons (TAA, TGA, TAG)
// Check all 3 reading frames
for (let frame = 0; frame < 3; frame++) {
  // Scan sequence...
}
```

## 🧪 Testing

### Sample FASTA File

Create `test.fasta`:

```
>Sequence_001 Test DNA sequence
ATGCGATCGATCGATCGATCGATCGATCGTAA
>Sequence_002 Another sequence
ATGGGGCCCCAAAATTTGA
```

### Test Upload

1. Open http://localhost:3000
2. Drag and drop `test.fasta`
3. View parsed results
4. Check Metadata Dashboard
5. Generate report

## 🚀 Build for Production

```bash
# Create optimized build
npm run build

# Serve production build
npm install -g serve
serve -s build
```

## 🐛 Troubleshooting

### Backend Connection Error

```typescript
// Check backend URL
console.log(process.env.REACT_APP_API_URL);

// Verify backend is running
curl http://localhost:3001/api/health
```

### File Upload Not Working

```typescript
// Check file extension
file.name.endsWith('.fasta') || file.name.endsWith('.fa')

// Check file content
const text = await file.text();
console.log(text.substring(0, 100));
```

### Charts Not Displaying

```typescript
// Ensure data format is correct
const data = [
  { name: 'A', value: 28.5, color: '#38bdf8' },
  // ...
];
```

## 📱 Responsive Design

- Desktop: Full sidebar + main content
- Tablet: Collapsible sidebar
- Mobile: Bottom navigation (future)

## 🎯 Performance

- Lazy loading components
- Memoized calculations
- Optimized re-renders
- Efficient parsing algorithm
- Pagination for large datasets

## 🔒 Security

- Input validation
- File type checking
- XSS prevention
- CORS configuration
- Environment variables

## 📦 Dependencies

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "typescript": "^5.0.0"
}
```

No external UI libraries - 100% custom components!

## 🎨 Design System

- **Primary Colors:** Sky blue (#38bdf8), Cyan (#22d3ee)
- **Typography:** System fonts, clean hierarchy
- **Spacing:** 4px grid system
- **Borders:** 1px, rounded corners (8px, 12px)
- **Shadows:** Subtle, layered

## 🆘 Support

Issues or questions?
- Check browser console
- Verify backend connection
- Review FASTA file format
- Check network tab for API calls

---

**Built with ❤️ for DNA sequence analysis**
