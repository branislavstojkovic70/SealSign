import { ethers } from 'ethers';
import { HttpError } from './errors';

// Prevent the same tx hash from being used twice.
const spentTxHashes = new Set<string>();

/**
 * Verifies that a Sepolia ETH payment was made before an issuance.
 * Only runs when ISSUE_PAYMENT_RECIPIENT is set in the environment.
 * Throws HttpError 402 if payment is missing, invalid, or already spent.
 */
export async function verifyIssuancePayment(
  paymentTxHash: string | undefined,
  expectedFrom: string,
): Promise<void> {
  const recipient = process.env.ISSUE_PAYMENT_RECIPIENT?.trim();
  if (!recipient) return; // payment not required

  if (!paymentTxHash || !/^0x[0-9a-f]{64}$/i.test(paymentTxHash)) {
    throw new HttpError(402, 'paymentTxHash is required');
  }

  const normalized = paymentTxHash.toLowerCase();
  if (spentTxHashes.has(normalized)) {
    throw new HttpError(402, 'Payment transaction already used');
  }

  const rpcUrl = process.env.SEPOLIA_RPC_URL;
  if (!rpcUrl) {
    throw new HttpError(500, 'Server misconfigured: SEPOLIA_RPC_URL not set');
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  // Wait up to 90 s for 1 confirmation — ensures the tx is mined before notarization proceeds.
  const receipt = await provider.waitForTransaction(paymentTxHash, 1, 90_000);
  if (!receipt) {
    throw new HttpError(402, 'Payment transaction not confirmed within timeout');
  }
  const tx = await provider.getTransaction(paymentTxHash);
  if (!tx) {
    throw new HttpError(402, 'Payment transaction not found after confirmation');
  }

  const requiredWei = ethers.parseEther(
    process.env.ISSUE_PAYMENT_AMOUNT_ETH?.trim() || '0.001',
  );

  if (tx.to?.toLowerCase() !== recipient.toLowerCase()) {
    throw new HttpError(402, 'Payment sent to wrong address');
  }
  if (tx.from.toLowerCase() !== expectedFrom.toLowerCase()) {
    throw new HttpError(402, 'Payment not sent by issuer');
  }
  if (tx.value < requiredWei) {
    throw new HttpError(402, 'Payment amount insufficient');
  }

  spentTxHashes.add(normalized);
}
