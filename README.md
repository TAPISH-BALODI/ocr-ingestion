# OCR Ingestion - Senior Backend Engineer Assignment

A NestJS-based backend service demonstrating document management, OCR webhook ingestion, scoped actions, RBAC, auditing, and metrics.

## Timeline

- **Start Date:** October 27, 2025
- **Finish Date:** Nov 1, 2025
- **Duration:** 3 days

## Setup and Run Instructions

### Prerequisites

- Node.js 20+ and npm
- Docker & Docker Compose (for containerized setup)
- MongoDB (or use Docker Compose)

### Option 1: Using Docker Compose (Recommended)

```bash
# Start MongoDB and API
docker-compose up -d

# Check status
docker-compose ps

# Seed demo data
npm run seed

# View logs
docker-compose logs -f api

# API available at http://localhost:3031
# Swagger UI at http://localhost:3031/api

# Stop services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

### Option 2: Local Development (Without Docker)

#### Step 1: Install MongoDB

**Windows:**
- Download MongoDB Community Server: https://www.mongodb.com/try/download/community
- Or use Chocolatey: `choco install mongodb`

**Alternative: Use MongoDB Atlas (Free Cloud)**
1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get connection string (looks like: `mongodb+srv://user:pass@cluster.mongodb.net/ocr_ingestion`)

#### Step 2: Create `.env` File

Create a `.env` file in the project root:

```env
MONGO_URI=mongodb://localhost:27017/ocr_ingestion
# OR for MongoDB Atlas:
# MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/ocr_ingestion?retryWrites=true&w=majority

PORT=3031
JWT_SECRET=dev-secret-key
NODE_ENV=development
```

#### Step 3: Start MongoDB

**Local MongoDB:**
```bash
# Windows (if installed as service, it auto-starts)
# Or run manually:
mongod --dbpath C:\data\db

# macOS/Linux
mongod --dbpath ./data/db
```

**MongoDB Atlas:** No setup needed, just ensure the connection string is correct.

#### Step 4: Run Application

```bash
# Install dependencies
npm install

# Seed demo data
npm run seed

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
npm start
```

### Troubleshooting

#### MongoDB Connection Error

**Error:** `MongooseError: connect ECONNREFUSED`

**Solution:**
- Ensure MongoDB is running: `mongod --version`
- Check connection string in `.env`
- For local: Ensure MongoDB service is started
- For Atlas: Check IP whitelist (allow all IPs: `0.0.0.0/0` for testing)

#### Port Already in Use

**Error:** `Port 3031 already in use`

**Solution:**
```bash
# Windows PowerShell:
netstat -ano | findstr :3031
taskkill /PID <PID> /F

# Or change port in .env
PORT=3032
```

#### Docker Issues

**Error:** `Docker Desktop is not running`

**Solution:**
1. Open Docker Desktop application
2. Wait for it to fully start (whale icon in system tray should be steady)
3. Try `docker-compose up -d` again

### Generating JWT Tokens

You'll need JWT tokens for authenticated endpoints. Use the included script:

```bash
# Generate tokens for different users/roles
ts-node scripts/generate-token.ts
```

Or use an online JWT tool (https://jwt.io) with:
- Secret: `dev-secret-key`
- Payload:
  ```json
  {
    "sub": "user123",
    "email": "user@example.com",
    "role": "user"
  }
  ```

---

## API Reference

All endpoints are prefixed with `/v1`. Authentication is required via `Authorization: Bearer <jwt>` header.

**Interactive API Documentation:** Visit `http://localhost:3031/api` for Swagger UI documentation.

### Authentication

JWT tokens must include:
- `sub` - User ID
- `email` - User email
- `role` - One of: `admin`, `support`, `moderator`, `user`

### Document & Tagging APIs

#### POST /v1/docs

Upload a document with primary and optional secondary tags.

**Request:**
```bash
curl -X POST http://localhost:3031/v1/docs \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "filename": "invoice-001.pdf",
    "mime": "application/pdf",
    "textContent": "Invoice total $1200. Payment due.",
    "primaryTag": "invoices-2025",
    "secondaryTags": ["financial", "urgent"]
  }'
```

**Response:**
```json
{
  "_id": "672abc123def456",
  "ownerId": "user123",
  "filename": "invoice-001.pdf",
  "mime": "application/pdf",
  "textContent": "Invoice total $1200. Payment due.",
  "createdAt": "2025-10-30T12:00:00.000Z"
}
```

#### GET /v1/folders

List all primary-tag folders with document counts.

**Request:**
```bash
curl http://localhost:3031/v1/folders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
[
  { "name": "invoices-2025", "count": 5 },
  { "name": "receipts", "count": 3 }
]
```

#### GET /v1/folders/:tag/docs

List documents where the specified tag is primary.

**Request:**
```bash
curl http://localhost:3031/v1/folders/invoices-2025/docs \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### GET /v1/search

Full-text search across documents. Supports `scope` parameter:
- `scope=folder&name=invoices-2025` - search within a folder
- `scope=files&ids=id1,id2` - search specific files
- Neither - search all documents

**Request:**
```bash
# Search all documents
curl "http://localhost:3031/v1/search?q=payment" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Search within folder
curl "http://localhost:3031/v1/search?q=invoice&scope=folder&name=invoices-2025" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Search specific files
curl "http://localhost:3031/v1/search?q=total&scope=files&ids=672abc123,672abc456" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Note:** `scope` must be either `folder` OR `files`, not both.

### Scoped Actions API

#### POST /v1/actions/run

Run actions (make_document, make_csv) on a scope of documents.

**Request:**
```bash
curl -X POST http://localhost:3031/v1/actions/run \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "scope": {
      "type": "folder",
      "name": "invoices-2025"
    },
    "messages": [
      { "role": "user", "content": "make a CSV of vendor totals" }
    ],
    "actions": ["make_document", "make_csv"]
  }'
```

**Response:**
```json
{
  "created": [
    { "id": "672abc789", "filename": "generated.txt" },
    { "id": "672abc790", "filename": "generated.csv" }
  ],
  "credits": 5
}
```

**Note:** Each request consumes 5 credits.

#### GET /v1/actions/usage/month

Get total credits consumed this month.

**Request:**
```bash
curl http://localhost:3031/v1/actions/usage/month \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "credits": 25
}
```

### OCR Webhook API

#### POST /v1/webhooks/ocr

Ingest OCR text, classify content, and create tasks for ads.

**Request:**
```bash
curl -X POST http://localhost:3031/v1/webhooks/ocr \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "source": "scanner-01",
    "imageId": "img_123",
    "text": "LIMITED TIME SALE… unsubscribe: mailto:stop@brand.com",
    "meta": { "address": "123 Main St" }
  }'
```

**Response:**
```json
{
  "ok": true,
  "category": "ad"
}
```

**Behavior:**
- Classifies as `official` (financial/legal terms), `ad` (promotional terms), or `other`
- For ads: Extracts unsubscribe email/URL and creates a Task
- Rate limit: Maximum 3 tasks per sender per day per user

### Metrics API

#### GET /v1/metrics

Get system metrics.

**Request:**
```bash
curl http://localhost:3031/v1/metrics \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "docs_total": 123,
  "folders_total": 7,
  "actions_month": 42,
  "tasks_today": 5
}
```

### Health Check

#### GET /v1/health

Public endpoint (no authentication required) for health checks.

**Request:**
```bash
curl http://localhost:3031/v1/health
```

**Response:**
```json
{
  "ok": true
}
```

---

## Design Decisions & Tradeoffs

### 1. Primary Tag Constraint

**Decision:** Enforced via MongoDB partial unique index on `(documentId, ownerId, isPrimary)` where `isPrimary: true`.

**Rationale:** Database-level constraint ensures data integrity even if application logic has bugs. The partial index only indexes primary tags, keeping index size small.

**Tradeoff:** Requires careful error handling if attempting to set multiple primary tags.

### 2. Scope Validation

**Decision:** Scope validation (folder vs files, not both) is enforced in the controller/service layer.

**Rationale:** Business rule validation belongs in application code where error messages can be user-friendly.

**Tradeoff:** Could also be enforced via OpenAPI schema validation, but current approach is more explicit.

### 3. Mock Processor

**Decision:** Deterministic mock function that produces predictable output based on document titles and sample content.

**Rationale:** Assignment requires a mock processor. In production, this would be replaced with an LLM API call (OpenAI, Anthropic, etc.).

**Tradeoff:** Current implementation doesn't actually call an LLM, but provides deterministic results for testing.

### 4. Rate Limiting Strategy

**Decision:** MongoDB query-based rate limiting (count documents per sender/day).

**Rationale:** Simple and sufficient for this assignment. In production, consider Redis with sliding window or token bucket algorithm for better performance.

**Tradeoff:** MongoDB queries have more latency than Redis counters, but works well for low-to-medium traffic.

### 5. Audit Logging

**Decision:** Synchronous audit logging in application code.

**Rationale:** Ensures audit logs are written even if request fails later. Simpler than async queue for this scope.

**Tradeoff:** Adds latency to requests. In production, consider async audit queue (e.g., RabbitMQ/Kafka) for high-throughput scenarios.

### 6. Document Storage

**Decision:** Store text content directly in MongoDB. No file storage for binary content.

**Rationale:** Simplifies implementation. For production, consider:
- S3/Blob storage for binary files
- Only store metadata and file references in MongoDB
- Stream large files to storage

**Tradeoff:** Current approach doesn't scale for large files, but sufficient for assignment scope.

### 7. Tenant Isolation

**Decision:** All queries filtered by `ownerId` matching authenticated user's ID.

**Rationale:** Security requirement - prevents data leaks in multi-tenant system. Enforced via guard that sets `tenantUserId` on all requests.

**Tradeoff:** Requires careful attention to ensure all queries include ownerId filter. Could use MongoDB row-level security in production.

### 8. JWT Authentication

**Decision:** Stateless JWT tokens with standard claims (`sub`, `email`, `role`).

**Rationale:** Simple, scalable, no session storage needed. In production, tokens would be issued by identity provider (Auth0, AWS Cognito, etc.).

**Tradeoff:** Tokens can't be revoked without maintaining a blacklist. For production, consider short-lived tokens with refresh mechanism.

---

## What I'd Do Next (With More Time)

1. **Enhanced Rate Limiting**
   - Redis-based sliding window or token bucket
   - Configurable limits per user role/plan
   - Distributed rate limiting for multi-instance deployments

2. **File Upload Support**
   - Multipart form data handling
   - S3/blob storage integration (AWS S3, Azure Blob, GCS)
   - Image/PDF processing pipeline
   - Virus scanning integration


3. **Performance Optimizations**
   - Query result caching (Redis)
   - Pagination for large result sets (cursor-based or offset/limit)
   - Database connection pooling tuning
   - MongoDB read replicas for read-heavy workloads


4. **Background Job Processing**
   - Task processing queue (Bull, BullMQ)
   - Async document processing
   - Scheduled jobs for cleanup/maintenance

5. **CI/CD Pipeline**
   - GitHub Actions for tests and linting
   - Docker image builds and pushes to registry
   - Automated deployment to staging/production
   - Automated security scanning

---

## Testing

Run tests with:
```bash
npm test
```

Test coverage includes:
- ✅ Scope rule validation (folder vs files)
- ✅ Primary tag uniqueness constraint
- ✅ RBAC role enforcement
- ✅ Tenant isolation
- ✅ Webhook classification and rate limiting
- ✅ Credits tracking on actions

---

## Database Schema

### Collections

- **users**: `{ _id, email, createdAt }`
- **tags**: `{ _id, name, ownerId, createdAt }`
- **documents**: `{ _id, ownerId, filename, mime, textContent, createdAt }`
- **documenttags**: `{ _id, documentId, tagId, ownerId, isPrimary, createdAt }`
- **usages**: `{ _id, userId, credits, at }`
- **tasks**: `{ _id, ownerId, status, channel, target, source }`
- **auditlogs**: `{ _id, userId, action, entityType, entityId, metadata, at }`

### Indexes

- Unique: `users.email`, `tags(ownerId, name)`, `documenttags(documentId, ownerId, isPrimary=true)`
- Performance: `documents(ownerId, createdAt)`, `tasks(ownerId, createdAt)`, `auditlogs(at)`

---

## RBAC & Security

### Roles

- **user**: CRUD on own docs/tags, run actions, view usage
- **support** / **moderator**: Read-only access
- **admin**: Full access

### Tenant Isolation

All endpoints enforce tenant isolation - users can only access their own data. This is enforced via:
- JWT `sub` claim mapped to `ownerId` in all queries
- `TenantScopeGuard` that sets `tenantUserId` on requests
- Services filter by `ownerId` matching the authenticated user

---

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run production build
- `npm test` - Run Jest tests
- `npm run lint` - Run ESLint
- `npm run seed` - Populate database with demo data
- `npm run export-openapi` - Export OpenAPI spec to `openapi.json`

---

## License

ISC
