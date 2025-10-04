# Expense Management System

A comprehensive multi-tenant expense management application with role-based access control, multi-level approval workflows, and conditional approval rules.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Running the Project](#running-the-project)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [User Roles](#user-roles)
- [Approval Workflow](#approval-workflow)

## Features

### Authentication
- User signup with company creation
- User login with email and password
- Forgot password with email-based password reset
- Role-based authentication (Admin, Manager, Employee)

### User Management (Admin Only)
- View all company users
- Add new users (Employee, Manager, Admin)
- Assign managers to employees
- Configure approval settings for users

### Expense Management
- **Employees:**
  - Create and submit expenses with details (description, category, paid by, remarks, amount, date)
  - View personal expense history
  - Submit expenses for approval
  - Track expense status (Draft, Waiting Approval, Approved, Rejected)

- **Managers:**
  - View all team expenses (employees under them)
  - Approve or reject team member expenses
  - Add comments during approval/rejection

- **Admins:**
  - View all company expenses
  - Approve or reject any expense in the company

### Multi-Level Approval Workflow
- Configure sequential multi-level approvers for each user
- Percentage-based approval rules (e.g., 60% of approvers must approve)
- Specific approver rules (auto-approve if specific person approves)
- Hybrid rules (combination of percentage and specific approver)
- Manager approval as first step (optional)

### Notifications
- Toast notifications for all actions (success/error feedback)
- Email notifications for password reset

## Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** SQLite with better-sqlite3
- **Email:** Nodemailer

### Frontend
- **Framework:** React 18
- **Language:** TypeScript
- **UI Library:** Material-UI (MUI)
- **State Management:** Redux Toolkit
- **Form Handling:** React Hook Form
- **Routing:** React Router v6
- **Notifications:** Notistack
- **HTTP Client:** Axios

## Project Structure

```
expenseManagement/
├── server/                      # Backend application
│   ├── src/
│   │   ├── db/
│   │   │   └── database.ts     # Database schema and initialization
│   │   ├── routes/
│   │   │   └── api.ts          # All API endpoints
│   │   ├── utils/
│   │   │   └── email.ts        # Email utilities (password reset)
│   │   └── index.ts            # Server entry point
│   ├── data/
│   │   └── expenses.db         # SQLite database (auto-created)
│   ├── package.json
│   └── tsconfig.json
│
├── client/                      # Frontend application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── SignupForm.tsx
│   │   │   │   └── ForgotPasswordForm.tsx
│   │   │   ├── Expenses/
│   │   │   │   └── AddExpenseDialog.tsx
│   │   │   └── UserManagement/
│   │   │       ├── AddUserDialog.tsx
│   │   │       └── ApprovalSettingsDialog.tsx
│   │   ├── pages/
│   │   │   ├── HomePage.tsx            # Role-based dashboard
│   │   │   ├── ExpensesPage.tsx        # Employee expense view
│   │   │   ├── ManagerExpensesPage.tsx # Manager/Admin expense approval
│   │   │   ├── UserManagementPage.tsx  # Admin user management
│   │   │   └── ApprovalsPage.tsx       # Approvals view
│   │   ├── store/
│   │   │   ├── index.ts
│   │   │   └── slices/
│   │   │       └── authSlice.ts        # Auth state management
│   │   ├── utils/
│   │   │   └── api.ts                  # Axios instance
│   │   ├── App.tsx                     # Main app with routing
│   │   └── main.tsx                    # Entry point
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

## Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Git

### Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd expenseManagement
   ```

2. **Install Server Dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install Client Dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Configure Email (Optional)**

   Edit `server/src/utils/email.ts` to add your email credentials for password reset functionality:
   ```typescript
   const transporter = nodemailer.createTransport({
     service: 'gmail',
     auth: {
       user: 'your-email@gmail.com',
       pass: 'your-app-password'
     }
   });
   ```

## Running the Project

### Development Mode

1. **Start the Backend Server**
   ```bash
   cd server
   npm run dev
   ```
   The server will start on `http://localhost:8081`

2. **Start the Frontend (in a new terminal)**
   ```bash
   cd client
   npm run dev
   ```
   The client will start on `http://localhost:5173`

3. **Access the Application**

   Open your browser and navigate to `http://localhost:5173`

### Production Build

1. **Build the Server**
   ```bash
   cd server
   npm run build
   npm start
   ```

2. **Build the Client**
   ```bash
   cd client
   npm run build
   npm run preview
   ```

## Database Schema

The SQLite database is automatically created on first run with the following tables:

### Tables

1. **companies**
   - `id` - Primary key
   - `name` - Company name
   - `currency` - Default currency (USD, EUR, INR, etc.)
   - `created_at` - Timestamp

2. **users**
   - `id` - Primary key
   - `company_id` - Foreign key to companies
   - `email` - Unique email address
   - `password` - Plain text password (Note: Use hashing in production)
   - `name` - User's full name
   - `role` - admin/manager/employee
   - `manager_id` - Foreign key to users (for employees)
   - `created_at` - Timestamp

3. **expenses**
   - `id` - Primary key
   - `user_id` - Foreign key to users
   - `amount` - Expense amount
   - `currency` - Currency code
   - `category` - Expense category
   - `description` - Expense description
   - `paid_by` - Payment method
   - `remarks` - Additional notes
   - `date` - Expense date
   - `status` - draft/waiting_approval/approved/rejected
   - `created_at` - Timestamp

4. **approval_rules**
   - `id` - Primary key
   - `user_id` - Foreign key to users
   - `company_id` - Foreign key to companies
   - `rule_type` - percentage/specific/hybrid
   - `percentage` - Approval percentage threshold
   - `specific_approver_id` - Foreign key to users
   - `is_manager_approver` - Boolean (manager approval required)
   - `created_at` - Timestamp

5. **approvers**
   - `id` - Primary key
   - `approval_rule_id` - Foreign key to approval_rules
   - `user_id` - Foreign key to users
   - `sequence` - Approval sequence order
   - Sequential multi-level approver configuration

6. **approvals**
   - `id` - Primary key
   - `expense_id` - Foreign key to expenses
   - `approver_id` - Foreign key to users
   - `status` - pending/approved/rejected
   - `comments` - Approval/rejection comments
   - `sequence` - Approval sequence
   - `created_at` - Timestamp
   - `updated_at` - Timestamp

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create company and admin user
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Send password reset email

### Users
- `POST /api/users` - Create new user
- `GET /api/users/:companyId` - Get all company users

### Companies
- `GET /api/companies/:companyId` - Get company details

### Expenses
- `POST /api/expenses` - Create new expense
- `GET /api/expenses/user/:userId` - Get user's expenses
- `GET /api/expenses/manager/:managerId` - Get team expenses (manager)
- `GET /api/expenses/company/:companyId` - Get all company expenses (admin)
- `POST /api/expenses/:expenseId/status` - Update expense status

### Approval Rules
- `POST /api/approval-rules` - Create/update approval rule
- `GET /api/approval-rules/user/:userId` - Get user's approval rule

### Approvers
- `POST /api/approvers` - Add approver to rule
- `GET /api/approvers/:approvalRuleId` - Get approvers for rule

### Approvals
- `GET /api/approvals/pending/:approverId` - Get pending approvals
- `POST /api/approvals/:approvalId` - Approve/reject approval

### Health Check
- `GET /api/health` - Server health check

## User Roles

### Admin
- Full access to the system
- Manage users (create, view, configure approval settings)
- View and approve all company expenses
- Cannot have approval settings configured for themselves

### Manager
- View and manage team member expenses
- Approve or reject expenses from direct reports
- Access to approvals dashboard
- Can have approval settings configured

### Employee
- Create and submit expenses
- View personal expense history
- Track expense approval status
- Must be assigned to a manager (optional)

## Approval Workflow

### Expense Status Flow
1. **Draft** - Initial state when expense is created
2. **Waiting Approval** - Employee submits for approval
3. **Approved** - Manager/Admin approves the expense
4. **Rejected** - Manager/Admin rejects the expense

### Multi-Level Approval Configuration

Admins can configure complex approval workflows for each user:

1. **Manager Approval (Optional First Step)**
   - Checkbox: "Requires Manager Approval First"
   - If enabled, direct manager must approve first

2. **Sequential Multi-Level Approvers**
   - Add multiple approvers in sequence
   - Each approver reviews in order (Step 1, Step 2, Step 3...)
   - Example: CFO → CEO → Board Member

3. **Conditional Approval Rules**

   **a) Percentage Rule**
   - Set a percentage threshold (e.g., 60%)
   - Expense is approved when 60% of approvers approve

   **b) Specific Approver Rule**
   - Select one specific approver
   - If this person approves, expense is auto-approved
   - Useful for VP or C-level override

   **c) Hybrid Rule**
   - Combination of both percentage and specific approver
   - Either condition can approve the expense

### Example Approval Scenarios

**Scenario 1: Simple Manager Approval**
- Employee submits expense
- Manager approves/rejects
- Done

**Scenario 2: Multi-Level Sequential**
- Employee submits → Manager (Step 1) → Department Head (Step 2) → CFO (Step 3)
- Each must approve in sequence

**Scenario 3: Percentage Rule**
- 5 approvers configured with 60% threshold
- 3 out of 5 approvals needed
- Once 3 approve, expense is approved

**Scenario 4: Specific Approver Override**
- Multiple approvers configured
- CEO set as specific approver
- If CEO approves, expense is immediately approved (bypass others)

## Getting Started - First Time Setup

1. **Start both server and client** (see Running the Project)

2. **Create Admin Account**
   - Navigate to signup page
   - Enter your details:
     - Name
     - Email
     - Password
     - Currency (e.g., USD)
   - This creates your company and admin account

3. **Login as Admin**
   - Use the email and password you just created

4. **Add Users**
   - Click "User Management"
   - Click "Add User"
   - Create managers and employees
   - Assign employees to their managers

5. **Configure Approval Settings**
   - In User Management, click "Settings" for each user
   - Configure approval workflow for that user
   - Add multi-level approvers
   - Set percentage or specific approver rules

6. **Create Expenses** (as Employee)
   - Login as an employee
   - Click "My Expenses"
   - Click "Add Expense"
   - Fill in details and save
   - Click the send icon to submit for approval

7. **Approve Expenses** (as Manager/Admin)
   - Login as manager or admin
   - Click "Team Expenses" or "Approve Expenses"
   - Review expenses
   - Click approve or reject buttons

## Notes

- **Database Reset**: To reset the database, stop the server and delete `server/data/expenses.db`. It will be recreated on next startup.
- **Email Configuration**: Password reset requires email configuration in `server/src/utils/email.ts`
- **Security**: This is a demo application. In production:
  - Hash passwords (use bcrypt)
  - Add JWT authentication
  - Add input validation
  - Add rate limiting
  - Use environment variables for sensitive data
  - Enable HTTPS

## Troubleshooting

**Port Already in Use**
- Change server port in `server/src/index.ts` (default: 8081)
- Change client port in `client/vite.config.ts` if needed

**Database Errors**
- Delete `server/data/expenses.db` and restart server
- Ensure server has write permissions in the data directory

**Email Not Sending**
- Check email configuration in `server/src/utils/email.ts`
- Enable "Less secure app access" for Gmail or use App Password
- Check network/firewall settings

## Future Enhancements

- OCR for receipt scanning
- Multi-currency conversion with live exchange rates
- Expense analytics and reporting
- File upload for receipts
- Export expenses to CSV/PDF
- Real-time notifications with WebSockets
- Mobile application
- Audit logs

## License

MIT

## Support

For issues and questions, please open an issue in the repository.
