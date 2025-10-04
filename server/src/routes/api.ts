import { Router, Request, Response } from 'express';
import db from '../db/database';

const router = Router();

// Health check
router.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Auth - Signup/Login (creates company and admin user)
router.post('/auth/signup', (req: Request, res: Response) => {
  const { email, password, name, currency } = req.body;

  try {
    const insert = db.prepare(`
      INSERT INTO companies (name, currency) VALUES (?, ?)
    `);
    const companyResult = insert.run(`${name}'s Company`, currency);
    const companyId = companyResult.lastInsertRowid;

    const insertUser = db.prepare(`
      INSERT INTO users (company_id, email, password, name, role) VALUES (?, ?, ?, ?, 'admin')
    `);
    const userResult = insertUser.run(companyId, email, password, name);

    res.json({ userId: userResult.lastInsertRowid, companyId, role: 'admin' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ? AND password = ?').get(email, password) as any;

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({ userId: user.id, companyId: user.company_id, role: user.role });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Users - Create employee/manager
router.post('/users', (req: Request, res: Response) => {
  const { companyId, email, password, name, role, managerId } = req.body;

  try {
    const insert = db.prepare(`
      INSERT INTO users (company_id, email, password, name, role, manager_id) VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = insert.run(companyId, email, password, name, role, managerId || null);

    res.json({ userId: result.lastInsertRowid });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/users/:companyId', (req: Request, res: Response) => {
  const { companyId } = req.params;

  try {
    const users = db.prepare('SELECT id, email, name, role, manager_id FROM users WHERE company_id = ?').all(companyId);
    res.json({ users });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Expenses - Submit
router.post('/expenses', (req: Request, res: Response) => {
  const { userId, amount, currency, category, description, date } = req.body;

  try {
    const insert = db.prepare(`
      INSERT INTO expenses (user_id, amount, currency, category, description, date) VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = insert.run(userId, amount, currency, category, description, date);

    res.json({ expenseId: result.lastInsertRowid });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/expenses/user/:userId', (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const expenses = db.prepare('SELECT * FROM expenses WHERE user_id = ?').all(userId);
    res.json({ expenses });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Approvals - View pending, approve/reject
router.get('/approvals/pending/:approverId', (req: Request, res: Response) => {
  const { approverId } = req.params;

  try {
    const approvals = db.prepare(`
      SELECT a.*, e.amount, e.currency, e.category, e.description, e.date
      FROM approvals a
      JOIN expenses e ON a.expense_id = e.id
      WHERE a.approver_id = ? AND a.status = 'pending'
    `).all(approverId);
    res.json({ approvals });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/approvals/:approvalId', (req: Request, res: Response) => {
  const { approvalId } = req.params;
  const { status, comments } = req.body;

  try {
    const update = db.prepare(`
      UPDATE approvals SET status = ?, comments = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `);
    update.run(status, comments, approvalId);

    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Approval Rules
router.post('/approval-rules', (req: Request, res: Response) => {
  const { companyId, ruleType, percentage, specificApproverId, isManagerApprover } = req.body;

  try {
    const insert = db.prepare(`
      INSERT INTO approval_rules (company_id, rule_type, percentage, specific_approver_id, is_manager_approver)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = insert.run(companyId, ruleType, percentage || null, specificApproverId || null, isManagerApprover);

    res.json({ ruleId: result.lastInsertRowid });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
