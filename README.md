# SealSign

> Cryptographic Guardian of Public Trust

Decentralized document verification platform built for **ETHGlobal Cannes 2026**.  
Institutions issue tamper-proof document fingerprints on Hedera HCS. Chainlink CRE verifies them autonomously. WalletConnect Pay gates access. ENS provides human-readable issuer identity. Raw PDFs never leave the browser.

---

## The Problem

AI can forge any PDF in seconds. Traditional document verification is slow, expensive, and corruptible. A single altered permit or diploma can go undetected for years.

## The Solution

SHA-256 fingerprints stored on Hedera Consensus Service. Chainlink CRE verifies documents trustlessly inside a Confidential Compute environment. ENS provides readable institution names (e.g. `belgrade-university.eth`). No smart contracts. No raw files on-chain. Just math.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript + Vite (port 5174) |
| Backend | Express 4 + Node.js (port 3001) |
| Document Registry | Hedera HCS — no smart contracts |
| Verification Engine | Chainlink CRE (Confidential Compute) |
| Wallet & Payments | Reown AppKit (WalletConnect) |
| Identity | ENS on Sepolia |
| UI | Material-UI v7 (dark theme) |

---

## Project Structure

```
SealSign/
├── frontend/               # React SPA (Vite, port 5174)
│   ├── src/
│   │   ├── components/     # 17 React components
│   │   ├── pages/          # HomePage, IssuePage, VerifyPage, ArchivePage
│   │   └── utils/          # hash, ENS, payment, API helpers
│   ├── .env.example
│   └── package.json
├── server/                 # Express API (port 3001) — holds all secrets
│   ├── lib/                # hedera.ts, cre.ts, payment.ts, errors.ts
│   ├── routes/             # issue.ts, verify.ts, hedera.ts
│   ├── scripts/            # createTopic.ts, issueTestDoc.ts, registerENS.ts
│   ├── cre/                # Chainlink CRE WASM workflow
│   ├── .env.example
│   └── package.json
└── docs/
    └── SPEC.md             # Full project specification
```

---

## Prerequisites

- **Node.js** v18 or later
- **Hedera testnet account** — [create one free at portal.hedera.com](https://portal.hedera.com)
- **Reown project ID** — [cloud.reown.com](https://cloud.reown.com)
- **Sepolia RPC URL** — [Infura](https://infura.io), [Alchemy](https://alchemy.com), or any public Sepolia endpoint

---

## Setup

### 1. Install dependencies

```bash
# Frontend
cd frontend
npm install

# Server
cd ../server
npm install
```

### 2. Configure the server

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:

```env
# Hedera Testnet — NEVER prefix these with VITE_
HEDERA_ACCOUNT_ID=0.0.XXXXX
HEDERA_PRIVATE_KEY=302e...          # DER-encoded or raw hex
HEDERA_TOPIC_ID=0.0.XXXXX          # See step 4 below
HEDERA_AUDIT_TOPIC_ID=0.0.XXXXX    # Optional — second topic for audit log
HEDERA_NETWORK=testnet
HEDERA_MIRROR_NODE_URL=https://testnet.mirrornode.hedera.com
HEDERA_EXPLORER_BASE_URL=https://hashscan.io/testnet

# Sepolia RPC (for payment verification)
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY

# Optional — enable issue fee gate
# ISSUE_PAYMENT_RECIPIENT=0xYourSepoliaAddress
# ISSUE_PAYMENT_AMOUNT_ETH=0.001
```

### 3. Configure the frontend

```bash
cp frontend/.env.example frontend/.env
```

Edit `frontend/.env`:

```env
VITE_REOWN_PROJECT_ID=your_reown_project_id

# Backend address (keep as-is for local dev)
VITE_API_URL=http://localhost:3001

# Sepolia RPC for ENS name resolution
VITE_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY

# Optional — enable issue fee payment
# VITE_ISSUE_PAYMENT_RECIPIENT=0xYourSepoliaAddress
# VITE_ISSUE_PAYMENT_AMOUNT_ETH=0.001
```

### 4. Create the Hedera HCS topic (one-time)

```bash
cd server
npx tsx scripts/createTopic.ts
```

Copy the printed `TopicId` into `server/.env` as `HEDERA_TOPIC_ID`.

To also create the audit log topic, run the script a second time and copy the ID to `HEDERA_AUDIT_TOPIC_ID`.

### 5. (Optional) Seed a test document

```bash
npx tsx scripts/issueTestDoc.ts
```

This writes a deterministic test hash to HCS so you can verify a known document immediately.

---

## Running the App

Run both frontend and server from their respective directories:

```bash
# Terminal 1 — backend
cd server
npm run dev         # Express on http://localhost:3001

# Terminal 2 — frontend
cd frontend
npm run dev         # Vite on http://localhost:5174
```

Then open [http://localhost:5174](http://localhost:5174).

---

## API Endpoints

All routes are served by the Express backend on port 3001.

### `POST /api/issue`
Submit a document hash to Hedera HCS.

```json
// Request
{
  "hash": "64-char SHA-256 hex",
  "documentName": "Diploma — University of Belgrade",
  "issuerAddress": "0xABC...",
  "recipientAddress": "0xDEF...",
  "issuerEns": "belgrade-university.eth",   // optional
  "recipientEns": "student.eth",             // optional
  "paymentTxHash": "0x..."                   // required if fee gate is enabled
}

// Response
{
  "success": true,
  "transactionId": "0.0.8503474@1720000000.000000000",
  "sequenceNumber": 42,
  "timestamp": "2026-04-05T10:00:00Z",
  "topicId": "0.0.8504306",
  "explorerUrl": "https://hashscan.io/testnet/transaction/..."
}
```

### `POST /api/verify`
Verify a document hash against the HCS registry.

```json
// Request
{ "hash": "64-char SHA-256 hex" }

// Response — found
{
  "verified": true,
  "issuer": "belgrade-university.eth",
  "issuerAddress": "0xABC...",
  "issuerEns": "belgrade-university.eth",
  "documentType": "Diploma — University of Belgrade",
  "recipient": "0xDEF...",
  "recipientAddress": "0xDEF...",
  "recipientEns": "student.eth",
  "issuedAt": "2026-04-05T10:00:00Z",
  "hederaSequence": 42
}

// Response — not found
{ "verified": false, "message": "No matching document found on Hedera ledger" }
```

### `GET /api/hedera/messages?wallet=0x...`
Returns all HCS messages where the wallet is issuer or recipient (public audit log).

---

## Architecture

```
Browser                     Express (port 3001)         External
──────────────────────      ──────────────────────      ──────────────────────
PDF → SHA-256 hash    →     POST /api/issue        →    Hedera HCS (submit)
(file never leaves          POST /api/verify        →    Chainlink CRE
 the browser)               GET  /api/hedera/       →    Hedera Mirror Node
                            messages
```

**Key invariant:** raw PDF files never leave the browser and never touch the server or blockchain. Only the SHA-256 hex hash is transmitted.

The Express server exists solely to keep `HEDERA_PRIVATE_KEY` and the Chainlink CRE SDK off the client bundle.

---

## Demo Scenarios

| Scenario | Steps | Expected Result |
|----------|-------|----------------|
| Happy path | Issue PDF → verify same PDF | Green shield — verified |
| Tampered doc | Issue PDF → edit one byte → verify | Red alert — hash mismatch |
| Unknown doc | Upload unregistered PDF → verify | Red alert — no record found |

---

## Security Notes

- **Private keys** belong only in `server/.env` — never in `frontend/.env` or committed to git
- All `VITE_*` variables are bundled into the client; treat them as public
- Payment deduplication uses an in-memory Set (acceptable for hackathon; server restart clears it)
- Rate limits: issue 5/min, verify 10/min, archive 20/min

---

## Bounty Targets

| Bounty | Prize | Integration |
|--------|-------|------------|
| Chainlink CRE | $4,000 | Autonomous verification engine |
| Chainlink Privacy | $2,000 | Hash-only + Confidential Compute |
| Hedera (No Solidity) | $3,000 | Pure HCS via SDK |
| WalletConnect Pay | $4,000 | Pay-per-issue model |
| ENS | $5,000 | Institution names on Sepolia |
| **Total** | **$18,000** | |

---

## Team

Built in 12 hours at ETHGlobal Cannes 2026.

Full specification: [docs/SPEC.md](docs/SPEC.md)
