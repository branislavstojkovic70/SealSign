import { Router, Request, Response, NextFunction } from 'express';
import { fetchTopicMessages } from '../lib/hedera';

const router = Router();

/**
 * GET /api/hedera/messages?wallet=0x... or issuerAddress= (legacy alias)
 * Returns messages where the wallet is issuer or recipient (or legacy-only issuer).
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const raw =
      (typeof req.query.wallet === 'string' && req.query.wallet) ||
      (typeof req.query.signerAddress === 'string' && req.query.signerAddress) ||
      (typeof req.query.issuerAddress === 'string' && req.query.issuerAddress) ||
      '';

    if (!raw) {
      res.status(400).json({ error: 'wallet query param is required (EVM address)' });
      return;
    }

    if (!/^0x[0-9a-f]{40}$/i.test(raw)) {
      res.status(400).json({ error: 'wallet must be a valid EVM address' });
      return;
    }

    const all = await fetchTopicMessages();
    const normalised = raw.toLowerCase();
    const messages = all.filter((m) => {
      const iss = m.document.issuerAddress?.toLowerCase();
      const rec = m.document.recipientAddress?.toLowerCase();
      if (iss === normalised || rec === normalised) return true;
      return false;
    });
    res.json({ count: messages.length, messages });
  } catch (err) {
    next(err);
  }
});

export default router;
