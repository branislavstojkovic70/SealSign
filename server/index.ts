import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import issueRouter from './routes/issue';
import verifyRouter from './routes/verify';
import hederaRouter from './routes/hedera';

const app = express();
const PORT = 3001;

app.use(cors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/issue', issueRouter);
app.use('/api/verify', verifyRouter);
app.use('/api/hedera/messages', hederaRouter);

// Global error handler — keeps stack traces off the wire in production
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err.message ?? 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`SealSign backend listening on http://localhost:${PORT}`);
});
