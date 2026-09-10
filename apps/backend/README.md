# 🚀 @ayur/backend — Enterprise API Server & Ingestion Engine

The `@ayur/backend` package is the central orchestration and API service for the **Ayur-IP Platform**. Built with Node.js and Express.js, it manages user sessions, streaming SSE chat delivery, background document ingestion, and the evaluation audit APIs.

---

## 🏛️ Architecture & Core Modules

```
apps/backend/src/
├── app.js                     # Express application configuration & middleware stack
├── server.js                  # Server bootstrap & graceful teardown handlers
├── config/
│   ├── index.js               # Zod-validated environment schema
│   ├── logger.js              # Pino structured JSON logger
│   └── redis.js               # Redis client connection factory
├── controllers/
│   ├── auth.controller.js     # Passwordless Email OTP & Google OAuth handler
│   ├── chat.controller.js     # SSE streaming controller with natural thinking delay
│   ├── document.controller.js # File upload & ingestion dispatch
│   ├── eval.controller.js     # Dynamic benchmark metrics & live audit runner
│   └── session.controller.js  # Chat session lifecycle & history retrieval
├── middleware/
│   ├── auth.middleware.js     # JWT & optional-auth evaluation middleware
│   └── rateLimiter.js         # Redis-backed sliding window rate limiter
├── routes/                    # API router definitions (/auth, /chat, /documents, /evals, /sessions)
└── workers/
    └── ingestion.worker.js    # BullMQ async document parsing worker
```

---

## 📡 API Endpoints Reference

### 1. Chat & Advisory Streaming
- **`POST /api/chat/ask`**:
  - Accepts `{ sessionId, message, documentIds }`.
  - Streams responses using Server-Sent Events (SSE) with `event: token` and `event: done`.
  - Features natural, authentic cadence: ~1,400ms thinking delay + ~28ms word interval.
  - Automatically caches complete 5-section legal dossiers in Redis with TTL.

### 2. Evaluation & Benchmark Audit
- **`GET /api/evals/benchmark`**:
  - Returns read-only, tamper-proof benchmark metrics, comparison matrix, and 15 audited cases.
  - Calculates dynamic statutory recall, case law precision, and token reduction (~1,244 tokens average).
- **`POST /api/evals/run`**:
  - Executes live dynamic audit pass over specified cases.
  - Recomputes all KPI cards and model comparison rows in real time.

### 3. Asynchronous Document Ingestion
- **`POST /api/documents/ingest`**:
  - Multipart form-data upload for statutory PDFs, patent specs, and prior art files.
  - Queues document parsing job onto BullMQ worker.
- **`GET /api/documents/jobs/:jobId`**:
  - Returns real-time ingestion status (`queued`, `parsing`, `chunking`, `indexing`, `completed`).

### 4. Sessions & History
- **`GET /api/sessions`**: Lists active user chat sessions.
- **`POST /api/sessions`**: Creates a new assessment session.
- **`GET /api/sessions/:id`**: Retrieves full message history.
- **`PATCH /api/sessions/:id`**: Renames session title.
- **`DELETE /api/sessions/:id`**: Deletes session.

---

## 🐳 Infrastructure & Docker Compose

Services defined in `docker-compose.yml`:
- **MongoDB** (`ayur-mongodb`): Port `27017` (Session storage, message threads, user records).
- **Redis** (`ayur-redis`): Port `6379` (BullMQ queues, rate limiting, semantic response caching).
- **Qdrant** (`ayur-qdrant`): Port `6333` (Vector similarity search over 3,311 legal chunks).

To launch:
```bash
docker compose up -d
```

---

## 🧪 Testing

Execute the Jest integration test suite:
```bash
# Run all backend tests
pnpm test

# Run evaluation controller integration test
pnpm test tests/integration/evals.test.js
```
