/**
 * One-time setup: issues a test document hash to Hedera HCS for demo purposes.
 *
 * Usage (from server/): npx tsx scripts/issueTestDoc.ts
 */

import 'dotenv/config';
import { createHash } from 'node:crypto';
import { Client, PrivateKey, TopicMessageSubmitTransaction } from '@hashgraph/sdk';

async function main() {
  const accountId = process.env.HEDERA_ACCOUNT_ID;
  const privateKey = process.env.HEDERA_PRIVATE_KEY;
  const topicId = process.env.HEDERA_TOPIC_ID;

  if (!accountId || !privateKey || !topicId) {
    throw new Error('HEDERA_ACCOUNT_ID, HEDERA_PRIVATE_KEY, and HEDERA_TOPIC_ID must be set in .env');
  }

  const trimmed = privateKey.trim().replace(/^0x/, '');
  const key = trimmed.startsWith('302e') || trimmed.startsWith('302a')
    ? PrivateKey.fromStringED25519(trimmed)
    : trimmed.startsWith('3030')
      ? PrivateKey.fromStringECDSA(trimmed)
      : PrivateKey.fromStringECDSA(trimmed); // raw hex → ECDSA (portal default)

  const client = Client.forTestnet();
  client.setOperator(accountId, key);

  // Deterministic test hash — use this same string as your "original document" in the demo
  const testContent = 'SealSign Demo Document v1 — University of Belgrade Diploma';
  const hash = createHash('sha256').update(testContent).digest('hex');

  const payload = {
    hash,
    documentName: 'Diploma',
    issuerAddress: '0x1111111111111111111111111111111111111111',
    recipientAddress: '0x2222222222222222222222222222222222222222',
    issuerEns: 'demo-issuer.eth',
    recipientEns: 'demo-recipient.eth',
    issuedAt: new Date().toISOString(),
  };

  console.log(`Submitting test document hash: ${hash}`);

  const response = await new TopicMessageSubmitTransaction()
    .setTopicId(topicId)
    .setMessage(JSON.stringify(payload))
    .execute(client);

  const transactionId = response.transactionId.toString();
  const receipt = await response.getReceipt(client);

  console.log(`\n✅ Test document issued`);
  console.log(`   Sequence number : ${receipt.topicSequenceNumber}`);
  console.log(`   Transaction ID  : ${transactionId}`);
  console.log(`   Hash            : ${hash}`);
  console.log(`\nUse this hash to verify the test document:\n  ${hash}\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
