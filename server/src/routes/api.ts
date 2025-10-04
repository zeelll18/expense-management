import { Router, Request, Response } from 'express';

const router = Router();

// Example API route
router.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Add your API routes here
router.get('/expenses', (req: Request, res: Response) => {
  res.json({ expenses: [] });
});

export default router;
