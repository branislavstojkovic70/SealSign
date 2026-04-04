# SealSign

> Cryptographic Guardian of Public Trust

Decentralized document verification protocol built for ETHGlobal Cannes 2026. Issue tamper-proof documents on Hedera. Verify autonomously via Chainlink CRE. Connect with Reown AppKit + Ledger.

## Problem

AI can forge any PDF in seconds. Traditional document verification is slow, expensive, and corruptible.

## Solution

SHA-256 fingerprints stored on Hedera Consensus Service (two independent HCS topics: document registry + audit log). Chainlink CRE verifies documents inside a Confidential Compute TEE via `ConfidentialHTTPClient`, qualifying for the Privacy bounty. Raw documents never leave the browser — only their hash is transmitted.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend SPA | React 19 + TypeScript + Vite 8 |
| UI components | MUI (Material UI) v7 + react-hot-toast |
| Wallet | Reown AppKit v1.8 + Ethers5Adapter (Sepolia), Ledger Live featured |
| Routing | React Router DOM v7 |
| Backend API | Express 4 (port 3001) — holds all secrets |
| Blockchain registry | Hedera HCS (`@hashgraph/sdk` v2.46) — no smart contracts |
| Verification engine | Chainlink CRE SDK v1.5 — WASM workflow + server-side fallback |
| ENS identity | `ethers` v6 on Sepolia — institution names (e.g. `belgrade-university.eth`) |

## Repository Structure

```
SealSign/
├── frontend/               # React 19 + Vite SPA (port 5173)
│   └── src/
│       ├── main.tsx        # Entry — MUI ThemeProvider, Router, Reown AppKit init
│       ├── pages/          # HomePage, IssuePage, VerifyPage, PlaceholderPage (/archive)
│       ├── components/     # Navbar, HomeHero, HomeActionCards, IssueFormCard, VerifyFormCard, ...
│       └── utils/          # hashFile, verifyApi, issueHelpers, reown, ledger
└── server/                 # Express 4 backend (port 3001)
    ├── index.ts            # App entry — CORS, JSON, global error handler
    ├── routes/
    │   ├── issue.ts        # POST /api/issue → Hedera HCS submit
    │   ├── verify.ts       # POST /api/verify → CRE verification + HCS audit log
    │   └── hedera.ts       # GET /api/hedera/messages → Mirror Node (debug)
    ├── lib/
    │   ├── hedera.ts       # submitDocumentHash, fetchTopicMessages, logVerificationAttempt
    │   ├── cre.ts          # verifyDocumentWithCRE — server-side fallback, mirrors cre/main.ts
    │   └── hash.ts         # Server-side SHA-256 (node:crypto)
    ├── cre/
    │   ├── main.ts         # Chainlink CRE WASM workflow (ConfidentialHTTPClient)
    │   └── workflow.ts     # Workflow metadata (name, version, CLI commands)
    └── scripts/
        ├── createTopic.ts       # One-time: create Hedera HCS document registry topic
        ├── createAuditTopic.ts  # One-time: create Hedera HCS audit log topic
        ├── issueTestDoc.ts      # One-time: issue a test document hash
        └── registerENS.ts       # One-time: register ENS name on Sepolia
```

## Quick Start

```bash
# Backend
cd server
npm install
cp .env.example .env          # fill in Hedera keys + topic IDs

# One-time Hedera setup (run once, copy printed IDs to .env)
npx tsx scripts/createTopic.ts        # → HEDERA_TOPIC_ID
npx tsx scripts/createAuditTopic.ts   # → HEDERA_AUDIT_TOPIC_ID

npm run dev                   # starts Express (3001) + Vite frontend (5173) concurrently

# Frontend (standalone)
cd frontend
npm install
npm run dev                   # Vite only on port 5173
```

## Environment Variables

All secrets live in `server/.env`. Never use `VITE_` prefix for Hedera keys.

```env
# Hedera Testnet — server only
HEDERA_ACCOUNT_ID=0.0.XXXXX
HEDERA_PRIVATE_KEY=302e...
HEDERA_TOPIC_ID=0.0.XXXXX           # document registry
HEDERA_AUDIT_TOPIC_ID=0.0.XXXXX     # verification audit log (optional)
HEDERA_NETWORK=testnet
HEDERA_MIRROR_NODE_URL=https://testnet.mirrornode.hedera.com

# ENS (registerENS.ts script only)
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
```

Frontend env in `frontend/.env`:
```env
VITE_REOWN_PROJECT_ID=your_project_id
VITE_API_URL=http://localhost:3001
```

## Architecture

```
Browser (React/Vite :5173)           Express Backend (:3001)          External
─────────────────────────────        ───────────────────────────      ──────────────────────
PDF drop → SHA-256 hash              POST /api/issue             →   Hedera HCS (submit msg)
  (hash only, PDF stays in browser)
                                     POST /api/verify            →   verifyDocumentWithCRE()
                                       ↳ server-side fallback    →   Hedera Mirror Node
                                       ↳ CRE WASM workflow       →   Confidential Compute TEE
                                       ↳ logVerificationAttempt  →   Hedera HCS (audit topic)

                                     GET /api/hedera/messages    →   Hedera Mirror Node (debug)
```

Key invariant: **raw PDF files never leave the browser and never touch the server or blockchain.** Only the SHA-256 hex hash is transmitted.

### Hedera HCS — Two Topics

| Topic | Env Var | Purpose |
|-------|---------|---------|
| Document Registry | `HEDERA_TOPIC_ID` | Stores `{ hash, issuer, type, recipient, issuedAt }` |
| Verification Audit Log | `HEDERA_AUDIT_TOPIC_ID` | Stores `{ hash, verified, issuer, documentType, timestamp }` |

Mirror Node messages are base64-encoded — decoded before JSON parsing in both the server fallback and the CRE WASM workflow.

### Chainlink CRE Workflow (`server/cre/main.ts`)

The canonical verification logic compiles to WebAssembly and runs inside Chainlink CRE Confidential Compute. Uses `ConfidentialHTTPClient` so the Mirror Node request and document metadata are encrypted in a TEE — qualifying for the Privacy bounty.

A functionally identical server-side fallback in `server/lib/cre.ts` keeps the demo working without a deployed CRE workflow.

```bash
# Simulate locally
cre workflow simulate server/cre --target staging \
  --http-payload '{"hash":"<64-char-sha256-hex>"}'

# Build WASM
cre workflow build server/cre

# Deploy (requires CRE Early Access)
cre workflow deploy server/cre --target production
```

### Private Key Parsing

`server/lib/hedera.ts` auto-detects key format:
- DER hex starting with `302e`/`302a` → ED25519
- DER hex starting with `3030` → ECDSA
- Raw 32-byte hex → ECDSA first, ED25519 fallback

## API Contract

### `POST /api/issue`
```json
// Request
{ "hash": "64-char-sha256-hex", "issuerName": "...", "documentType": "...", "recipientName": "..." }

// Response
{ "success": true, "transactionId": "0.0.12345@...", "sequenceNumber": 1, "timestamp": "...", "topicId": "0.0.XXXXX", "explorerUrl": "https://hashscan.io/testnet/transaction/..." }
```

### `POST /api/verify`
```json
// Request
{ "hash": "64-char-sha256-hex" }

// Response (verified)
{ "verified": true, "issuer": "...", "documentType": "...", "recipient": "...", "issuedAt": "...", "hederaSequence": 1 }

// Response (not found)
{ "verified": false, "message": "No matching document found on Hedera ledger" }
```

### `GET /api/hedera/messages`
Debug — returns all notarized records: `{ "count": N, "messages": [...] }`

## Bounty Targeting

| Bounty | Strategy |
|--------|----------|
| Chainlink CRE | `server/cre/main.ts` — WASM workflow is the verification engine |
| Chainlink Privacy | `ConfidentialHTTPClient` in TEE; hash-only design |
| Hedera (No Solidity) | Pure HCS via SDK — two topics, zero smart contracts |
| ENS | Institution names on Sepolia (`registerENS.ts`) |

## Demo Scenarios

- **Happy path:** Issue a PDF → verify same PDF → verified result
- **Tampered (the money shot):** Change one byte → verify → not found / tampered
- **Unknown document:** Upload unregistered PDF → not found

## Full Specification

See [docs/SPEC.md](docs/SPEC.md) for the complete project spec and pitch narrative.
