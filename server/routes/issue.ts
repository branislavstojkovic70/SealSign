import { Router, Request, Response, NextFunction } from 'express';
import { getAddress, isAddress } from 'ethers';
import { submitDocumentHash } from '../lib/hedera';

const router = Router();

interface IssueRequestBody {
  hash: string;
  documentName: string;
  issuerAddress: string;
  recipientAddress: string;
  issuerEns?: string;
  recipientEns?: string;
}

/**
 * POST /api/issue
 * Stores a document hash on Hedera HCS.
 * The raw PDF never reaches this endpoint — only the SHA-256 hex hash.
 */
router.post('/', async (req: Request<{}, {}, IssueRequestBody>, res: Response, next: NextFunction) => {
  try {
    const { hash, documentName, issuerAddress, recipientAddress, issuerEns, recipientEns } = req.body;

    if (!hash || !documentName || !issuerAddress || !recipientAddress) {
      res.status(400).json({
        error: 'hash, documentName, issuerAddress, and recipientAddress are required',
      });
      return;
    }

    if (!/^[0-9a-f]{64}$/i.test(hash)) {
      res.status(400).json({ error: 'hash must be a 64-character SHA-256 hex string' });
      return;
    }

    if (!isAddress(issuerAddress) || !isAddress(recipientAddress)) {
      res.status(400).json({ error: 'issuerAddress and recipientAddress must be valid EVM addresses' });
      return;
    }

    const topicId = process.env.HEDERA_TOPIC_ID ?? '';

    const result = await submitDocumentHash({
      documentHash: hash,
      documentName: documentName.trim(),
      issuerAddress: getAddress(issuerAddress),
      recipientAddress: getAddress(recipientAddress),
      issuerEns: typeof issuerEns === 'string' && issuerEns.trim() !== '' ? issuerEns.trim() : undefined,
      recipientEns:
        typeof recipientEns === 'string' && recipientEns.trim() !== '' ? recipientEns.trim() : undefined,
    });

    res.json({
      success: true,
      transactionId: result.transactionId,
      sequenceNumber: result.sequenceNumber,
      timestamp: result.timestamp,
      topicId,
      explorerUrl: `https://hashscan.io/testnet/transaction/${result.transactionId}`,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
