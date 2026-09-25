# 🖥️ @ayur/frontend — Modern React 18 Intelligence Dashboard

The `@ayur/frontend` package provides the responsive web interface for the **Ayur-IP Platform**. Built with **React 18**, **Vite**, and **Tailwind CSS**, it features real-time SSE markdown streaming, dual-regime legal switching, 9-language multilingual support, voice input with mobile ASR resilience, and pre-filled statutory form generation.

---

## 🏛️ Application Architecture

```
apps/frontend/src/
├── components/
│   ├── chat/                  # ChatWindow, ChatInput, MessageItem (with <br> & citation parser)
│   ├── citation/              # CitationPanel, CitationBadge, DocumentViewerModal
│   ├── forms/                 # StatutoryFormsModal (IPO Form 25, NBA Form I/III, WIPO SDS)
│   ├── history/               # HistorySidebar, SessionListItem
│   ├── layout/                # Header, ModeSwitch, UserMenu, Breadcrumbs
│   └── ui/                    # Button, Card, Toast, Modal primitives
├── config/
│   ├── api.js                 # API endpoint URLs and production fallbacks
│   └── i18n.js                # Multilingual translations (9 Indic languages)
├── hooks/
│   ├── useChatStream.js       # SSE stream consumer with non-destructive state handling
│   ├── useSession.js          # Chat session lifecycle manager
│   ├── useTTS.js              # Text-to-speech audio player
│   └── useVoiceInput.js       # Web Speech API hook with cumulative superset merging & deduplication
├── pages/
│   ├── AdminUploadPage.jsx    # Document ingestion console with progress trackers
│   ├── ChatPage.jsx           # Core conversational legal advisory workspace
│   ├── LandingPage.jsx        # Public overview, problem context, and feature showcase
│   ├── LoginPage.jsx          # Google OAuth & Passwordless Email OTP authentication
│   └── ProfilePage.jsx        # User profile and session audit settings
├── services/
│   ├── apiService.js          # REST & streaming API client
│   └── bhashiniService.js     # Backend neural translation client with format preservation
└── store/
    ├── authStore.js           # JWT authentication and user profile state
    ├── chatStore.js           # Active session, messages buffer, and jurisdiction mode
    ├── formStore.js           # Statutory compliance forms state
    ├── languageStore.js       # Selected language state & supported Indic locales
    └── uiStore.js             # Toasts, citation drawer, and sidebar modal states
```

---

## 🌟 Key User Interfaces & Capabilities

### 1. Conversational Advisory Workspace (`/chat`)
- **Real-Time Streaming**: Word-by-word streaming token visualization with auto-scroll and manual interrupt.
- **Dual Statutory Toggle**: Instant toggle between **🇮🇳 India (Patents & BDA)** and **🌐 International (WIPO & PCT)**.
- **Rich Legal Formatting**: Formats statutory bar matrices, classical Sanskrit slokas, and regulatory checklists with interactive citation badges `[Doc 1]`.
- **Session Lifecycle**: Full create, rename, switch, and delete controls with automatic backend session auto-healing.

### 2. Multilingual Voice & Text Engine
- Interactive speech-to-text input via the Web Speech API with cumulative superset merging (`mergeTranscriptResults`) and multi-pass deduplication to eliminate duplicate stutters on Android/iOS mobile devices.
- Language selector offering instant translation across **9 Indian languages** with 100% Markdown table structure and citation preservation.

### 3. Automated Statutory Compliance Docket Generator
- One-click generation of pre-filled, compliant legal forms:
  - **IPO Form 25**: Section 39 foreign filing clearance request.
  - **NBA Form I & Form III**: Commercial utilization and IPR approvals under Biological Diversity Act.
  - **WIPO GRATK Article 3 SDS**: Standardized Disclosure Statement for international patent filings.
- Complete with PDF print, download, and copy-to-clipboard functionality.

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
