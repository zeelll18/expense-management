import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Use absolute path from project root
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'expenses.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
const createTables = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS companies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      currency TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'manager', 'employee')),
      manager_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id),
      FOREIGN KEY (manager_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      currency TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      paid_by TEXT,
      remarks TEXT,
      date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'waiting_approval', 'approved', 'rejected')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS approval_rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL,
      rule_type TEXT NOT NULL CHECK(rule_type IN ('percentage', 'specific', 'hybrid')),
      percentage INTEGER,
      specific_approver_id INTEGER,
      is_manager_approver BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id),
      FOREIGN KEY (specific_approver_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS approvers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      approval_rule_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      sequence INTEGER NOT NULL,
      FOREIGN KEY (approval_rule_id) REFERENCES approval_rules(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS approvals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      expense_id INTEGER NOT NULL,
      approver_id INTEGER NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('pending', 'approved', 'rejected')),
      comments TEXT,
      sequence INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (expense_id) REFERENCES expenses(id),
      FOREIGN KEY (approver_id) REFERENCES users(id)
    );
  `);

  console.log('Database tables created successfully');
};

createTables();

export default db;
