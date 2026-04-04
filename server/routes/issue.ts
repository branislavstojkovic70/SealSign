import { Router, Request, Response, NextFunction } from 'express';
import { submitDocumentHash } from '../lib/hedera';

const router = Router();

interface IssueRequestBody {
  hash: string;
  issuerName: string;
  issuerAddress: string;
  documentType: string;
  recipientName: string;
}

/**
 * POST /api/issue
 * Stores a document hash on Hedera HCS.
 * The raw PDF never reaches this endpoint — only the SHA-256 hex hash.
 */
router.post('/', async (req: Request<{}, {}, IssueRequestBody>, res: Response, next: NextFunction) => {
  try {
    const { hash, issuerName, issuerAddress, documentType, recipientName } = req.body;

    if (!hash || !issuerName || !issuerAddress || !documentType || !recipientName) {
      res.status(400).json({ error: 'hash, issuerName, issuerAddress, documentType, and recipientName are required' });
      return;
    }

    if (!/^[0-9a-f]{64}$/i.test(hash)) {
      res.status(400).json({ error: 'hash must be a 64-character SHA-256 hex string' });
      return;
    }

    if (!/^0x[0-9a-f]{40}$/i.test(issuerAddress)) {
      res.status(400).json({ error: 'issuerAddress must be a valid EVM address' });
      return;
    }

    const topicId = process.env.HEDERA_TOPIC_ID ?? '';

    const result = await submitDocumentHash({ documentHash: hash, issuerName, issuerAddress, documentType, recipientName });

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
