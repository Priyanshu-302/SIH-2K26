# 🖥️ @ayur/frontend — Modern React 18 Intelligence Dashboard

The `@ayur/frontend` package provides the responsive web interface for the **Ayur-IP Platform**. Built with **React 18**, **Vite**, and **Tailwind CSS**, it features real-time SSE markdown streaming, an audit-grade evaluation dashboard, and interactive document ingestion workflows.

---

## 🏛️ Application Architecture

```
apps/frontend/src/
├── components/                # Reusable UI components
│   ├── MarkdownRenderer.jsx   # GitHub-flavored markdown with table & code highlight support
│   ├── Navbar.jsx             # Top navigation bar & breadcrumbs
│   ├── Sidebar.jsx            # Assessment history drawer with inline rename/delete
│   └── ToastContainer.jsx     # Animated notification system
├── layouts/
│   └── DashboardLayout.jsx    # Core responsive layout with header, navigation & footer
├── pages/
│   ├── ChatPage.jsx           # Real-time streaming conversational legal workspace
│   ├── EvalsPage.jsx          # Audit-grade Judge Evaluation & Benchmark Dossier
│   ├── IngestPage.jsx         # Document upload console with progress indicators
│   ├── LoginPage.jsx          # Google OAuth & Passwordless Email OTP authentication
│   └── ProfilePage.jsx        # User settings & workspace management
├── services/
│   └── apiService.js          # SSE streaming client, Axios instances, and API helpers
└── store/
    ├── authStore.js           # JWT authentication and user session state
    ├── chatStore.js           # Active session messages and streaming token buffers
    └── uiStore.js             # Toast notifications, modal states, and drawer toggles
```

---

## 🌟 Key User Interfaces

### 1. Conversational Advisory Workspace (`/app/chat`)
- **Real-Time Streaming**: Word-by-word streaming token visualization with auto-scroll and manual interrupt.
- **Rich Legal Formatting**: Formats statutory bar matrices, classical text citations, and regulatory checklists into styled cards and tables.
- **Session Management**: Full create, rename, switch, and delete controls for patent assessment threads.

### 2. Judge Evaluation & Benchmark Dossier (`/app/evals`)
- **Top KPI Cards**: Displays live-computed Statutory Recall (98.3%), TKDL Grounding (97.8%), Speedup Multiplier (44x), and Token Efficiency (72.0% fewer tokens).
- **Direct Model Comparison Matrix**: Evaluates Ayur-IP against ChatGPT-4o + Bing Web Search and Claude 3.5 Sonnet across 9 dimensions.
- **Filterable Benchmark Case Accordions**: Filter by Section 3(p), Biodiversity/NBA, Geographical Indications, or Opposition Trap Cases.
- **Live Benchmark Execution**: Real-time progress bar recalculating metrics on the fly.
- **Export Audit Dossier**: Instant download of audit reports in GitHub-flavored Markdown.

### 3. Document Ingestion Console (`/app/ingest`)
- Drag-and-drop document upload for PDFs, patent applications, and Ayurvedic texts.
- Real-time status cards tracking extraction, chunking, and Qdrant vector indexing.

---

## 🚀 Running Locally

```bash
# Start Vite development server
pnpm dev

# Build production bundle
pnpm build

# Preview production build
pnpm preview
```
Default URL: `http://localhost:3000`
