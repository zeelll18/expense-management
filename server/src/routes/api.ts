import { Router, Request, Response } from 'express';
import db from '../db/database';
import { sendPasswordResetEmail, generateRandomPassword } from '../utils/email';

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

router.post('/auth/forgot-password', async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    // Check if user exists
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;

    if (!user) {
      return res.status(404).json({ error: 'Email not found' });
    }

    // Generate new random password
    const newPassword = generateRandomPassword();

    // Send email first before updating password
    const emailSent = await sendPasswordResetEmail(email, newPassword);

    if (!emailSent) {
      return res.status(500).json({ error: 'Failed to send email. Please try again later.' });
    }

    // Only update password if email was sent successfully
    const update = db.prepare('UPDATE users SET password = ? WHERE email = ?');
    update.run(newPassword, email);

    res.json({ message: 'New password sent to your email' });
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

// Companies - Get company info
router.get('/companies/:companyId', (req: Request, res: Response) => {
  const { companyId } = req.params;

  try {
    const company = db.prepare('SELECT * FROM companies WHERE id = ?').get(companyId);
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    res.json(company);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Expenses - Submit
router.post('/expenses', (req: Request, res: Response) => {
  const { userId, amount, currency, category, description, paidBy, remarks, date, status } = req.body;

  try {
    const insert = db.prepare(`
      INSERT INTO expenses (user_id, amount, currency, category, description, paid_by, remarks, date, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = insert.run(
      userId,
      amount,
      currency,
      category,
      description,
      paidBy || null,
      remarks || null,
      date,
      status || 'draft'
    );

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

// Get expenses for manager's team
router.get('/expenses/manager/:managerId', (req: Request, res: Response) => {
  const { managerId } = req.params;

  try {
    const expenses = db.prepare(`
      SELECT e.*, u.name as employee_name, u.email as employee_email
      FROM expenses e
      JOIN users u ON e.user_id = u.id
      WHERE u.manager_id = ?
      ORDER BY e.created_at DESC
    `).all(managerId);
    res.json({ expenses });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get all expenses for admin (all employees in company)
router.get('/expenses/company/:companyId', (req: Request, res: Response) => {
  const { companyId } = req.params;

  try {
    const expenses = db.prepare(`
      SELECT e.*, u.name as employee_name, u.email as employee_email
      FROM expenses e
      JOIN users u ON e.user_id = u.id
      WHERE u.company_id = ?
      ORDER BY e.created_at DESC
    `).all(companyId);
    res.json({ expenses });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update expense status (for manager approval/rejection)
router.post('/expenses/:expenseId/status', (req: Request, res: Response) => {
  const { expenseId } = req.params;
  const { status, comments } = req.body;

  try {
    const update = db.prepare(`
      UPDATE expenses SET status = ? WHERE id = ?
    `);
    update.run(status, expenseId);

    res.json({ success: true, message: `Expense ${status}` });
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
  const { userId, companyId, ruleType, percentage, specificApproverId, isManagerApprover } = req.body;

  try {
    // Delete existing rule for this user if any
    db.prepare('DELETE FROM approval_rules WHERE user_id = ?').run(userId);

    const insert = db.prepare(`
      INSERT INTO approval_rules (user_id, company_id, rule_type, percentage, specific_approver_id, is_manager_approver)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    // Convert boolean to integer for SQLite (1 = true, 0 = false)
    const result = insert.run(
      userId,
      companyId,
      ruleType,
      percentage || null,
      specificApproverId || null,
      isManagerApprover ? 1 : 0
    );

    res.json({ ruleId: result.lastInsertRowid });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get approval rules for a user
router.get('/approval-rules/user/:userId', (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const rule = db.prepare('SELECT * FROM approval_rules WHERE user_id = ?').get(userId);
    res.json({ rule });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get approvers for an approval rule
router.get('/approvers/:approvalRuleId', (req: Request, res: Response) => {
  const { approvalRuleId } = req.params;

  try {
    const approvers = db.prepare(`
      SELECT a.*, u.name as user_name
      FROM approvers a
      JOIN users u ON a.user_id = u.id
      WHERE a.approval_rule_id = ?
      ORDER BY a.sequence
    `).all(approvalRuleId);
    res.json({ approvers });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Approvers - Add to approval rule
router.post('/approvers', (req: Request, res: Response) => {
  const { approvalRuleId, userId, sequence } = req.body;

  try {
    const insert = db.prepare(`
      INSERT INTO approvers (approval_rule_id, user_id, sequence) VALUES (?, ?, ?)
    `);
    const result = insert.run(approvalRuleId, userId, sequence);

    res.json({ approverId: result.lastInsertRowid });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
