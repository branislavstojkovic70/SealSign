import {
  Client,
  PrivateKey,
  TopicMessageSubmitTransaction,
} from '@hashgraph/sdk';

import {
  type NormalizedLedgerDocument,
  type WrittenLedgerPayload,
  normalizeLedgerDocument,
} from './ledgerDocument';

export type { NormalizedLedgerDocument } from './ledgerDocument';

export interface TopicMessage {
  sequenceNumber: number;
  consensusTimestamp: string;
  document: NormalizedLedgerDocument;
}

/**
 * Parses a Hedera private key, auto-detecting format:
 * - DER-encoded hex starting with 302e/302a → ED25519
 * - DER-encoded hex starting with 3030     → ECDSA
 * - Raw 64-char hex                        → tries ECDSA first, falls back to ED25519
 */
function parsePrivateKey(raw: string): PrivateKey {
  // Strip 0x prefix and whitespace
  const trimmed = raw.trim().replace(/^0x/, '');
  if (trimmed.startsWith('302e') || trimmed.startsWith('302a')) {
    return PrivateKey.fromStringED25519(trimmed);
  }
  if (trimmed.startsWith('3030')) {
    return PrivateKey.fromStringECDSA(trimmed);
  }
  // Raw 32-byte hex — portal ECDSA accounts use this format
  try {
    return PrivateKey.fromStringECDSA(trimmed);
  } catch {
    return PrivateKey.fromStringED25519(trimmed);
  }
}

function buildClient(): Client {
  const accountId = process.env.HEDERA_ACCOUNT_ID;
  const privateKey = process.env.HEDERA_PRIVATE_KEY;

  if (!accountId || !privateKey) {
    throw new Error('HEDERA_ACCOUNT_ID and HEDERA_PRIVATE_KEY must be set in .env');
  }

  const client = Client.forTestnet();
  client.setOperator(accountId, parsePrivateKey(privateKey));
  return client;
}

/**
 * Submits a document hash record to the Hedera HCS topic.
 * Returns the transaction ID, sequence number, and consensus timestamp.
 */
export async function submitDocumentHash(params: {
  documentHash: string;
  documentName: string;
  issuerAddress: string;
  recipientAddress: string;
  issuerEns?: string;
  recipientEns?: string;
}): Promise<{ transactionId: string; sequenceNumber: number; timestamp: string }> {
  const topicId = process.env.HEDERA_TOPIC_ID;
  if (!topicId) throw new Error('HEDERA_TOPIC_ID must be set in .env');

  const payload: WrittenLedgerPayload = {
    hash: params.documentHash,
    documentName: params.documentName,
    issuerAddress: params.issuerAddress,
    recipientAddress: params.recipientAddress,
    issuedAt: new Date().toISOString(),
  };
  if (params.issuerEns) payload.issuerEns = params.issuerEns;
  if (params.recipientEns) payload.recipientEns = params.recipientEns;

  const client = buildClient();

  const response = await new TopicMessageSubmitTransaction()
    .setTopicId(topicId)
    .setMessage(JSON.stringify(payload))
    .execute(client);

  const transactionId = response.transactionId.toString();
  const receipt = await response.getReceipt(client);
  const sequenceNumber = receipt.topicSequenceNumber?.toNumber() ?? 0;

  return {
    transactionId,
    sequenceNumber,
    timestamp: new Date().toISOString(),
  };
}

export interface AuditRecord {
  hash: string;
  verified: boolean;
  timestamp: string;
}

/**
 * Writes a verification attempt to the audit HCS topic (HEDERA_AUDIT_TOPIC_ID).
 * Non-blocking — callers should fire-and-forget (void).
 */
export async function logVerificationAttempt(params: AuditRecord): Promise<void> {
  const auditTopicId = process.env.HEDERA_AUDIT_TOPIC_ID;
  if (!auditTopicId) return; // Gracefully skip if not configured

  const client = buildClient();
  await new TopicMessageSubmitTransaction()
    .setTopicId(auditTopicId)
    .setMessage(JSON.stringify(params))
    .execute(client);
}

/**
 * Fetches all messages from the configured HCS topic via Hedera Mirror Node.
 * Mirror Node messages are base64-encoded — decoded before parsing JSON.
 */
export async function fetchTopicMessages(): Promise<TopicMessage[]> {
  const topicId = process.env.HEDERA_TOPIC_ID;
  const mirrorUrl =
    process.env.HEDERA_MIRROR_NODE_URL ?? 'https://testnet.mirrornode.hedera.com';

  if (!topicId) throw new Error('HEDERA_TOPIC_ID must be set in .env');

  const url = `${mirrorUrl}/api/v1/topics/${topicId}/messages?limit=100&order=asc`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Mirror Node returned ${res.status}: ${await res.text()}`);
  }

  const data = (await res.json()) as { messages: Array<{
    sequence_number: number;
    consensus_timestamp: string;
    message: string;
  }> };

  return data.messages
    .map((msg) => {
      const decoded = Buffer.from(msg.message, 'base64').toString('utf-8');
      let parsed: unknown;
      try {
        parsed = JSON.parse(decoded);
      } catch {
        return null;
      }
      const document = normalizeLedgerDocument(parsed);
      if (!document) return null;
      return {
        sequenceNumber: msg.sequence_number,
        consensusTimestamp: msg.consensus_timestamp,
        document,
      };
    })
    .filter((m): m is TopicMessage => m !== null);
}
