/**
 * One-time setup: creates the Hedera HCS topic used as the SealSign document registry.
 * Run once, then copy the printed TopicId into your .env as HEDERA_TOPIC_ID.
 *
 * Usage (from server/): npx tsx scripts/createTopic.ts
 */

import 'dotenv/config';
import { Client, PrivateKey, TopicCreateTransaction } from '@hashgraph/sdk';

async function main() {
  const accountId = process.env.HEDERA_ACCOUNT_ID;
  const privateKey = process.env.HEDERA_PRIVATE_KEY;

  if (!accountId || !privateKey) {
    throw new Error('HEDERA_ACCOUNT_ID and HEDERA_PRIVATE_KEY must be set in .env');
  }

  const trimmed = privateKey.trim().replace(/^0x/, '');
  const key = trimmed.startsWith('302e') || trimmed.startsWith('302a')
    ? PrivateKey.fromStringED25519(trimmed)
    : trimmed.startsWith('3030')
      ? PrivateKey.fromStringECDSA(trimmed)
      : PrivateKey.fromStringECDSA(trimmed); // raw hex → ECDSA (portal default)

  const client = Client.forTestnet();
  client.setOperator(accountId, key);

  const receipt = await new TopicCreateTransaction()
    .setTopicMemo('SealSign Document Registry')
    .setAdminKey(key)
    .execute(client)
    .then((tx) => tx.getReceipt(client));

  const topicId = receipt.topicId?.toString();
  console.log(`\n✅ Hedera HCS topic created: ${topicId}`);
  console.log(`\nAdd to your .env:\n  HEDERA_TOPIC_ID=${topicId}\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
