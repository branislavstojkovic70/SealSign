import { Router, Request, Response, NextFunction } from 'express';
import { fetchTopicMessages } from '../lib/hedera';

const router = Router();

/**
 * GET /api/hedera/messages?issuerAddress=0x...
 * Returns notarized document records filtered by the connected wallet's address.
 * Requires `issuerAddress` query param — returns 400 without it to prevent full dumps.
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { issuerAddress } = req.query;

    if (!issuerAddress || typeof issuerAddress !== 'string') {
      res.status(400).json({ error: 'issuerAddress query param is required' });
      return;
    }

    if (!/^0x[0-9a-f]{40}$/i.test(issuerAddress)) {
      res.status(400).json({ error: 'issuerAddress must be a valid EVM address' });
      return;
    }

    const all = await fetchTopicMessages();
    const normalised = issuerAddress.toLowerCase();
    const messages = all.filter(
      (m) => m.document.issuerAddress?.toLowerCase() === normalised,
    );
    res.json({ count: messages.length, messages });
  } catch (err) {
    next(err);
  }
});

export default router;
