# 🚀 @ayur/backend — Enterprise API Server & Ingestion Engine

The `@ayur/backend` package is the central orchestration and API service for the **Ayur-IP Platform**. Built with Node.js and Express.js, it manages user sessions, streaming SSE chat delivery, Indic neural translation, automated statutory compliance form generation, background document ingestion, and benchmark APIs.

---

## 🏛️ Architecture & Core Modules

```
apps/backend/src/
├── app.js                     # Express application configuration & middleware stack (trust proxy enabled)
├── server.js                  # Server bootstrap & graceful teardown handlers
├── config/
│   ├── index.js               # Zod-validated environment schema
│   ├── logger.js              # Pino structured JSON logger
│   └── redis.js               # Redis client connection factory
├── controllers/
│   ├── auth.controller.js     # Passwordless Email OTP & Google OAuth handler
│   ├── chat.controller.js     # SSE streaming controller with auto-healing sessions
│   ├── document.controller.js # File upload & ingestion dispatch
│   ├── forms.controller.js    # Statutory compliance forms generator (IPO 25, NBA I/III, WIPO SDS)
│   ├── history.controller.js  # Message history pagination & isolation
│   └── session.controller.js  # Chat session lifecycle & title generation
├── middleware/
│   ├── auth.middleware.js     # JWT & optional-auth evaluation middleware
│   └── rateLimiter.js         # Redis-backed sliding window rate limiter
├── routes/                    # API router definitions (/auth, /chat, /documents, /forms, /translate, /sessions)
└── workers/
    └── ingestion.worker.js    # BullMQ async document parsing worker
```

---

## 📡 API Endpoints Reference

### 1. Chat & Advisory Streaming
- **`POST /api/chat/ask`**:
  - Accepts `{ query, sessionId, jurisdiction, historyOverride }`.
  - Streams responses using Server-Sent Events (SSE) with `type: session`, `type: token`, `type: citations`, and `type: done`.
  - Supports query validation up to **10,000 characters** with automatic session auto-healing for deleted/missing IDs.
  - Automatically caches complete 5-section legal dossiers in Redis with a 24-hour TTL.

### 2. Multilingual Neural Translation
- **`POST /api/translate`**:
  - Accepts `{ text, targetLang, fromLang }`.
  - Neural machine translation powered by Groq `openai/gpt-oss-20b` supporting 9 Indian languages.
  - Preserves 100% of Markdown tables, pipe delimiters, headers, bullet points, and citation tags `[Doc 1]`.

### 3. Automated Statutory Compliance Forms
- **`POST /api/forms/generate`**:
  - Synthesizes pre-filled statutory filing dockets:
    - **IPO Form 25**: Section 39 foreign filing permission request.
    - **NBA Form I & Form III**: Access to biological resources and IPR approvals under BDA 2002.
    - **WIPO GRATK Article 3 SDS**: Standardized Disclosure Statement for international PCT and foreign entry.

### 4. Evaluation & Benchmark Audit
- **`GET /api/evals/benchmark`**:
  - Returns read-only, tamper-proof benchmark metrics, comparison matrix, and 15 audited cases.
- **`POST /api/evals/run`**:
  - Executes live dynamic audit pass over specified cases.

### 5. Asynchronous Document Ingestion
- **`POST /api/documents/ingest`**:
  - Multipart form-data upload for statutory PDFs, patent specs, and prior art files.
- **`GET /api/documents/jobs/:jobId`**:
  - Returns real-time ingestion status (`queued`, `parsing`, `chunking`, `indexing`, `completed`).

### 6. Sessions & History
- **`GET /api/sessions`**: Lists active user chat sessions.
- **`POST /api/sessions`**: Creates a new assessment session.
- **`GET /api/sessions/:id/history`**: Retrieves message history.
- **`PATCH /api/sessions/:id`**: Renames session title.
- **`DELETE /api/sessions/:id`**: Deletes session and associated logs.

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
# Run all backend integration tests
pnpm test
```
