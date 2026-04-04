/**
 * Chainlink CRE (Compute Runtime Environment) integration — server-side fallback.
 *
 * The canonical workflow lives in server/cre/main.ts (TypeScript → WebAssembly).
 * This file implements the identical verification logic in plain Node.js so the
 * demo works without a deployed CRE workflow.
 */
import { WORKFLOW_NAME, WORKFLOW_VERSION } from '../cre/workflow';

import { fetchTopicMessages } from './hedera';
import { issuerVerifyLine, recipientVerifyLine } from './ledgerDocument';

export interface VerificationResult {
  verified: boolean;
  issuer: string | null;
  issuerAddress: string | null;
  recipient: string | null;
  recipientAddress: string | null;
  documentType: string | null;
  issuedAt: string | null;
  hederaSequence: number | null;
  confidence: 'high' | 'low';
}

export async function verifyDocumentWithCRE(uploadedHash: string): Promise<VerificationResult> {
  console.log(`[CRE:${WORKFLOW_NAME}@${WORKFLOW_VERSION}] Verifying hash: ${uploadedHash.slice(0, 16)}...`);
  const messages = await fetchTopicMessages();

  const match = messages.find((msg) => msg.document.hash.toLowerCase() === uploadedHash.toLowerCase());

  if (!match) {
    return {
      verified: false,
      issuer: null,
      issuerAddress: null,
      recipient: null,
      recipientAddress: null,
      documentType: null,
      issuedAt: null,
      hederaSequence: null,
      confidence: 'high' as const,
    };
  }

  const d = match.document;

  return {
    verified: true,
    issuer: issuerVerifyLine(d),
    issuerAddress: d.issuerAddress,
    recipient: recipientVerifyLine(d),
    recipientAddress: d.recipientAddress,
    documentType: d.documentName || null,
    issuedAt: d.issuedAt || null,
    hederaSequence: match.sequenceNumber,
    confidence: 'high' as const,
  };
}
