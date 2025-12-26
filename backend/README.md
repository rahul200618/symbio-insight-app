# Symbio-NLM Backend API

Node.js + Express + MongoDB + Firebase backend for the Symbio-NLM DNA Analysis Platform.

## 🚀 Features

- ✅ FASTA sequence storage and retrieval
- ✅ BioPython integration for advanced FASTA parsing
- ✅ Metadata extraction and storage
- ✅ MongoDB database integration
- ✅ Optional Firebase integration
- ✅ RESTful API endpoints
- ✅ Search and filtering
- ✅ Aggregate statistics
- ✅ File management
- ✅ CORS enabled
- ✅ Error handling
- ✅ Request logging

## 📋 Prerequisites

- Node.js (v16 or higher)
- Python 3.8+ (for BioPython features)
- MongoDB (local or Atlas)
- npm or yarn

## 🔧 Installation

### 1. Install Node.js Dependencies

```bash
cd backend
npm install
```

### 2. Install Python Dependencies (BioPython)

```bash
pip install -r requirements.txt
```

Or if using Python 3:

```bash
pip3 install -r requirements.txt
```

**Note**: BioPython is required for advanced FASTA parsing. If you skip this step, the BioPython endpoints won't work, but the standard JavaScript parser will still function.

### 3. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/symbio-nlm
```

### 3. Start MongoDB

**Local MongoDB:**
```bash
mongod
```

**Or use MongoDB Atlas** (cloud):
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

### 4. Start Server

**Development mode (with auto-restart):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server will run on http://localhost:3001

## 📡 API Endpoints

### Health Check
```
GET /api/health
```

### Standard FASTA Parsing (JavaScript)

#### Upload Sequences
```
POST /api/sequences/upload
Content-Type: application/json

{
  "sequences": [...],
  "fileName": "genome.fasta",
  "fileSize": 1024
}
```

### BioPython FASTA Parsing (Advanced)

#### Check BioPython Installation
```
GET /api/biopython/check
```

#### Parse FASTA File with BioPython
```
POST /api/biopython/parse
Content-Type: multipart/form-data

file: <FASTA file>
```

#### Upload and Save with BioPython
```
POST /api/biopython/upload
Content-Type: multipart/form-data

file: <FASTA file>
```

#### Parse FASTA Text with BioPython
```
POST /api/biopython/parse-text
Content-Type: application/json

{
  "content": ">seq1\nATGCGCTA..."
}
```

### Sequence Management

### Get All Sequences
```
GET /api/sequences?limit=50&offset=0
```

### Get Single Sequence
```
GET /api/sequences/:id
```

### Delete Sequence
```
DELETE /api/sequences/:id
```

### Search Sequences
```
GET /api/sequences/search?q=genome
```

### Get Statistics
```
GET /api/sequences/statistics
```

### Get File List
```
GET /api/sequences/files/list
```

## 🗄️ Database Schema

### Sequence Model

```javascript
{
  sequenceId: String,        // Unique ID from frontend
  sequenceName: String,      // Header name
  sequenceLength: Number,    // Base pairs
  gcPercentage: Number,      // GC%
  nucleotideCounts: {
    A: Number,
    T: Number,
    G: Number,
    C: Number
  },
  orfs: [{
    start: Number,
    end: Number,
    length: Number,
    sequence: String
  }],
  rawSequence: String,       // Full sequence
  fileName: String,          // Original file
  fileSize: Number,
  userId: String,            // Optional
  timestamp: String,
  uploadedAt: Date
}
```

## 🔥 Firebase Integration (Optional)

### Setup

1. **Create Firebase Project:**
   - Go to https://console.firebase.google.com
   - Create new project

2. **Generate Service Account:**
   - Project Settings → Service Accounts
   - Generate new private key
   - Save as `config/serviceAccountKey.json`

3. **Configure Environment:**

**Method 1 - File Path:**
```env
FIREBASE_SERVICE_ACCOUNT_PATH=./config/serviceAccountKey.json
```

**Method 2 - JSON String:**
```env
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'
```

4. **Restart Server**

Firebase will be used for:
- File storage
- Additional backups
- Real-time sync (future)

## 🧪 Testing

### Test with cURL

**Upload:**
```bash
curl -X POST http://localhost:3001/api/sequences/upload \
  -H "Content-Type: application/json" \
  -d '{
    "sequences": [{
      "id": "seq_123",
      "sequenceName": "Test Sequence",
      "sequenceLength": 100,
      "gcPercentage": 50,
      "nucleotideCounts": {"A":25,"T":25,"G":25,"C":25},
      "orfs": [],
      "rawSequence": "ATCG...",
      "timestamp": "2024-11-28T10:00:00Z"
    }],
    "fileName": "test.fasta",
    "fileSize": 1024
  }'
```

**Get All:**
```bash
curl http://localhost:3001/api/sequences
```

**Health Check:**
```bash
curl http://localhost:3001/api/health
```

## 📁 Project Structure

```
backend/
├── config/
│   ├── database.js          # MongoDB connection
│   └── firebase.js          # Firebase config
├── models/
│   └── Sequence.js          # Mongoose schema
├── routes/
│   └── sequences.js         # API routes
├── .env.example             # Environment template
├── package.json
├── server.js                # Main server file
└── README.md
```

## 🔒 Security

- Helmet.js for HTTP headers
- CORS configured
- Input validation
- Error handling
- Environment variables for secrets

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| NODE_ENV | Environment (development/production) | No |
| PORT | Server port | No (default: 3001) |
| FRONTEND_URL | Frontend URL for CORS | No |
| MONGODB_URI | MongoDB connection string | Yes |
| FIREBASE_SERVICE_ACCOUNT | Firebase service account JSON | No |
| FIREBASE_STORAGE_BUCKET | Firebase storage bucket | No |

## 🚀 Deployment

### Deploy to Heroku

```bash
heroku create symbio-nlm-api
heroku config:set MONGODB_URI="your-mongodb-uri"
git push heroku main
```

### Deploy to Render

1. Create new Web Service
2. Connect your repository
3. Set environment variables
4. Deploy

### Deploy to Railway

```bash
railway login
railway init
railway up
```

## 🐛 Troubleshooting

### MongoDB Connection Error

```bash
# Check if MongoDB is running
mongo --version

# Start MongoDB
mongod

# Or use MongoDB Atlas
```

### Port Already in Use

```bash
# Change port in .env
PORT=3002
```

### CORS Error

```bash
# Update FRONTEND_URL in .env
FRONTEND_URL=http://localhost:3000
```

## 📊 Performance

- Compression enabled
- Database indexing
- Pagination support
- Efficient queries
- Connection pooling

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License

## 🆘 Support

For issues or questions:
- Check documentation
- Review error logs
- Check MongoDB connection
- Verify environment variables

---

**Built with ❤️ for Symbio-NLM DNA Analysis Platform**
