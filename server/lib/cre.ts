/**
 * Chainlink CRE (Compute Runtime Environment) integration.
 *
 * Designed to run inside Chainlink CRE Confidential Compute for the Privacy bounty.
 * For the demo, the same verification logic runs server-side when the CRE SDK is
 * unavailable.
 *
 * The workflow (cre/workflow.ts) describes the canonical CRE execution graph;
 * this file is the server-side equivalent.
 */

import { fetchTopicMessages } from './hedera';

export interface VerificationResult {
  verified: boolean;
  issuer: string | null;
  documentType: string | null;
  recipient: string | null;
  issuedAt: string | null;
  hederaSequence: number | null;
  confidence: 'high' | 'low';
}

/**
 * Verifies an uploaded document hash against the Hedera HCS topic.
 *
 * Step 1 — Fetch all topic messages from Hedera Mirror Node.
 * Step 2 — Decode base64 messages and search for a hash match.
 * Step 3 — Return verification result with document metadata.
 */
export async function verifyDocumentWithCRE(uploadedHash: string): Promise<VerificationResult> {
  const messages = await fetchTopicMessages();

  const match = messages.find((msg) => msg.document.hash === uploadedHash);

  if (!match) {
    return {
      verified: false,
      issuer: null,
      documentType: null,
      recipient: null,
      issuedAt: null,
      hederaSequence: null,
      confidence: 'high',
    };
  }

  return {
    verified: true,
    issuer: match.document.issuer,
    documentType: match.document.type,
    recipient: match.document.recipient,
    issuedAt: match.document.issuedAt,
    hederaSequence: match.sequenceNumber,
    confidence: 'high',
  };
}
