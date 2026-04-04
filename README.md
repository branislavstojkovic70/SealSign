# SealSign

> Cryptographic Guardian of Public Trust

Decentralized document verification protocol built for ETHGlobal Cannes 2026. Issue tamper-proof documents on Hedera. Verify autonomously via Chainlink CRE. Pay with WalletConnect.

## Problem

AI can forge any PDF in seconds. Traditional document verification is slow, expensive, and corruptible.

## Solution

SHA-256 fingerprints stored on Hedera Consensus Service. Chainlink CRE verifies documents trustlessly inside a Confidential Compute environment. ENS provides human-readable issuer names. Raw documents never leave the browser.

## Tech Stack

- **Hedera HCS** — immutable document registry (no smart contracts)
- **Chainlink CRE** — autonomous verification judge
- **Reown AppKit** — wallet connection
- **WalletConnect Pay** — pay-per-verification
- **ENS (Sepolia)** — institution identity (e.g. `belgrade-university.eth`)
- **React 18 + TypeScript + Vite** — frontend SPA
- **Express 4** — backend API (keeps private keys off the client)
- **Tailwind CSS** — styling

## Quick Start

```bash
npm install
cp .env.example .env               # fill in your keys
npx tsx scripts/createTopic.ts     # create Hedera HCS topic
npm run dev                        # starts Vite (5174) + Express (3001)
```

## Architecture

See [docs/SPEC.md](docs/SPEC.md) for the full specification.

```
PDF → SHA-256 hash → Hedera HCS
                          ↓
              Chainlink CRE reads Mirror Node
                          ↓
              VERIFIED ✅  or  TAMPERED ❌
```

## Team

Built in 12 hours at ETHGlobal Cannes 2026.
