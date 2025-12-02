# API Contracts - Symbio Backend

Base URL: `http://localhost:3001`

---

## Health Check

### GET `/api/health`
Check server and database status.

**Response:** `200 OK`
```json
{
  "status": "ok",
  "time": "2025-12-02T10:30:00.000Z",
  "database": "connected",
  "version": "1.0.0",
  "uptime": "24h 15m"
}
```

---

## Sequences

### GET `/api/sequences`
Get all sequences with pagination.

**Query Parameters:**
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 20) - Items per page
- `sort` (optional, default: "-createdAt") - Sort field

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "filename": "sequence.fasta",
      "header": "Sample Sequence Description",
      "length": 1234,
      "gcPercent": 45.2,
      "orfDetected": true,
      "nucleotideCounts": {
        "A": 310,
        "T": 365,
        "G": 280,
        "C": 279
      },
      "createdAt": "2025-12-02T10:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 5
  }
}
```

---

### POST `/api/sequences`
Create new sequence from FASTA string.

**Request Body:**
```json
{
  "fasta": ">Sample_Sequence\nATGCGATCGATCGATCGATCGATC..."
}
```

**Response:** `201 Created`
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "filename": "Sample_Sequence.fasta",
    "header": "Sample_Sequence",
    "length": 1234,
    "gcPercent": 45.2,
    "orfDetected": true,
    "nucleotideCounts": {
      "A": 310,
      "T": 365,
      "G": 280,
      "C": 279
    },
    "createdAt": "2025-12-02T10:00:00.000Z"
  }
]
```

**Error Response:** `400 Bad Request`
```json
{
  "error": "fasta string required"
}
```

---

### POST `/api/sequences/upload`
Upload FASTA file (multipart/form-data).

**Form Data:**
- `file` (required) - FASTA file (.fasta, .fa)

**Response:** `201 Created`
```json
{
  "id": "507f1f77bcf86cd799439011",
  "filename": "uploaded_sequence.fasta",
  "header": "Sample Header",
  "length": 1234,
  "gcPercent": 45.2,
  "orfDetected": true,
  "nucleotideCounts": {
    "A": 310,
    "T": 365,
    "G": 280,
    "C": 279
  },
  "createdAt": "2025-12-02T10:00:00.000Z"
}
```

**Error Response:** `400 Bad Request`
```json
{
  "error": "No file uploaded"
}
```

---

### GET `/api/sequences/:id`
Get single sequence by ID with full details.

**URL Parameters:**
- `id` (required) - Sequence MongoDB ObjectId

**Response:** `200 OK`
```json
{
  "id": "507f1f77bcf86cd799439011",
  "title": "Sample_Sequence",
  "metrics": {
    "length": 1234,
    "gcContent": 45.2,
    "orfDetected": true
  },
  "sequence": "ATGCGATCGATCGATCGATCGATC...",
  "interpretation": "Short textual interpretation",
  "aiSummary": "Generated human-readable summary",
  "nucleotideCounts": {
    "A": 310,
    "T": 365,
    "G": 280,
    "C": 279
  },
  "createdAt": "2025-12-02T10:00:00.000Z"
}
```

**Error Response:** `404 Not Found`
```json
{
  "error": "Sequence not found"
}
```

---

### GET `/api/sequences/:id/report`
Get AI-generated report for sequence.

**URL Parameters:**
- `id` (required) - Sequence MongoDB ObjectId

**Response:** `200 OK`
```json
{
  "id": "507f1f77bcf86cd799439011",
  "aiSummary": "Generated human-readable summary",
  "interpretation": "Short textual interpretation"
}
```

**Error Response:** `404 Not Found`
```json
{
  "error": "Sequence not found"
}
```

---

### POST `/api/sequences/:id/generate-report`
Trigger AI report generation for sequence.

**URL Parameters:**
- `id` (required) - Sequence MongoDB ObjectId

**Request Body:**
```json
{
  "options": {
    "length_threshold": 1000
  }
}
```

**Response:** `202 Accepted`
```json
{
  "message": "Report generation initiated",
  "id": "507f1f77bcf86cd799439011",
  "aiSummary": "Generated human-readable summary for sequence Sample_Sequence"
}
```

**Error Response:** `404 Not Found`
```json
{
  "error": "Sequence not found"
}
```

---

### PUT `/api/sequences/:id`
Update sequence metadata.

**URL Parameters:**
- `id` (required) - Sequence MongoDB ObjectId

**Request Body:**
```json
{
  "filename": "updated_filename.fasta",
  "header": "Updated Header",
  "metadata": {
    "user_note": "Custom note"
  }
}
```

**Response:** `200 OK`
```json
{
  "id": "507f1f77bcf86cd799439011",
  "filename": "updated_filename.fasta",
  "header": "Updated Header",
  "updatedAt": "2025-12-02T10:30:00.000Z"
}
```

**Error Response:** `404 Not Found`
```json
{
  "error": "Sequence not found"
}
```

---

### DELETE `/api/sequences/:id`
Delete sequence by ID.

**URL Parameters:**
- `id` (required) - Sequence MongoDB ObjectId

**Response:** `200 OK`
```json
{
  "message": "Deleted",
  "id": "507f1f77bcf86cd799439011"
}
```

**Error Response:** `404 Not Found`
```json
{
  "error": "Sequence not found"
}
```

---

### GET `/api/sequences/:id/metadata`
Get minimal metadata for sequence (health check).

**URL Parameters:**
- `id` (required) - Sequence MongoDB ObjectId

**Response:** `200 OK`
```json
{
  "status": "ok",
  "time": "2025-12-02T10:30:00.000Z",
  "id": "507f1f77bcf86cd799439011"
}
```

**Error Response:** `404 Not Found`
```json
{
  "error": "Sequence not found"
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 202 | Accepted (async processing) |
| 400 | Bad Request - Invalid input |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error |

---

## CORS Configuration

Backend accepts requests from: `http://localhost:5173` (Vite default port)

---

## Request/Response Headers

### Standard Headers
```
Content-Type: application/json
```

### File Upload Headers
```
Content-Type: multipart/form-data
```

---

## Notes

1. All timestamps are in ISO 8601 format
2. MongoDB ObjectIds are 24-character hex strings
3. File size limit: 10MB for uploads
4. JSON payload limit: 50MB
5. Pagination defaults: page=1, limit=20
