# Symbio-NLM Backend Setup Instructions

## Current Implementation

✅ **FASTA Parsing & Metadata Extraction (Client-Side - WORKING NOW!)**
The application currently includes a **fully functional client-side FASTA parser** that:
- Parses FASTA files in the browser (no backend needed)
- Extracts sequence names from headers
- Calculates sequence lengths (bp)
- Computes GC percentages
- Counts nucleotides (A, T, G, C)
- Detects ORFs (starts with ATG, ends with TAA/TGA/TAG)
- Generates unique IDs
- Records timestamps
- Displays real-time results in the dashboard

**Try it now:** Upload a .fasta or .fa file and see the metadata extraction in action!

---

## Optional: Firebase Integration (For Data Persistence)

If you want to store the parsed data in a database, follow these steps:

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add Project"
3. Enter project name: `symbio-nlm`
4. Disable Google Analytics (optional)
5. Click "Create Project"

### 2. Enable Firestore Database

1. In Firebase Console, click "Firestore Database"
2. Click "Create Database"
3. Choose "Start in production mode"
4. Select a location (e.g., us-central)
5. Click "Enable"

### 3. Get Firebase Configuration

1. Go to Project Settings (gear icon)
2. Scroll to "Your apps" section
3. Click the web icon `</>`
4. Register app name: `symbio-nlm-web`
5. Copy the Firebase configuration object

### 4. Update Firebase Config

Open `/utils/firebase.ts` and replace the config:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};
```

### 5. Install Firebase

```bash
npm install firebase
```

### 6. Enable Firebase Storage in Code

Open `/components/UploadSection.tsx` and uncomment lines 75-79:

```typescript
// Uncomment these lines:
import { storeMultipleSequences, isFirebaseConfigured } from '../utils/firebase';
if (isFirebaseConfigured()) {
  await storeMultipleSequences(sequences);
  console.log('Sequences stored in Firebase');
}
```

### 7. Set Firestore Security Rules

In Firebase Console > Firestore > Rules, add:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /sequences/{document=**} {
      allow read, write: if true; // Change this for production!
    }
  }
}
```

**⚠️ Warning:** These rules allow anyone to read/write. For production, implement proper authentication!

---

## Alternative: Node.js + Express Backend (Optional)

If you prefer a Node.js backend instead of Firebase:

### Backend Setup (Node.js + Express)

1. Create a new folder: `backend/`

```bash
mkdir backend
cd backend
npm init -y
npm install express cors firebase-admin body-parser
```

2. Create `backend/server.js`:

```javascript
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// Store sequence metadata
app.post('/api/sequences', async (req, res) => {
  try {
    const sequences = req.body.sequences;
    const batch = db.batch();
    
    sequences.forEach(seq => {
      const docRef = db.collection('sequences').doc();
      batch.set(docRef, {
        ...seq,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });
    
    await batch.commit();
    res.json({ success: true, count: sequences.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all sequences
app.get('/api/sequences', async (req, res) => {
  try {
    const snapshot = await db.collection('sequences')
      .orderBy('createdAt', 'desc')
      .get();
    
    const sequences = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.json(sequences);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete sequence
app.delete('/api/sequences/:id', async (req, res) => {
  try {
    await db.collection('sequences').doc(req.params.id).delete();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

3. Download Firebase Service Account Key:
   - Firebase Console > Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Save as `backend/serviceAccountKey.json`

4. Start the server:
```bash
node server.js
```

---

## What's Working Now (No Setup Required!)

✅ FASTA file upload (drag & drop)
✅ Real-time parsing in browser
✅ Metadata extraction:
  - Sequence names
  - Sequence lengths
  - GC percentages
  - Nucleotide counts (A, T, G, C)
  - ORF detection
  - Unique IDs
  - Timestamps
✅ Display results in dashboard
✅ Charts and visualizations

## What Needs Firebase/Backend (Optional)

❌ Data persistence across sessions
❌ Multi-user data sharing
❌ Historical data analysis
❌ Cloud storage

---

## Testing Without Backend

The app works perfectly without any backend! Just:
1. Upload a FASTA file
2. See instant parsing and analysis
3. View results in Metadata Dashboard
4. Generate reports

All data is processed in the browser and displayed immediately.

---

## Sample FASTA File for Testing

Create a file called `test.fasta`:

```
>Sequence_001 Sample DNA sequence
ATGCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATC
GATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATC
TAATGA
>Sequence_002 Another test sequence
ATGGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAG
CTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAG
TGA
>Sequence_003 Third sequence
ATGAAAAAATTTTTTGGGGGGCCCCCCAAAAAATTTTTTGGGGGGCCCCCCAAAAAATTTTAA
```

Upload this file to see the parser in action!
