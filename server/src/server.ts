import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import apiRoutes from './routes/api';
import './db/database'; // Initialize database

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api', apiRoutes);

// Serve React app
app.use('/', express.static(path.join(__dirname, '../../client/build')));

// Handle React routing, return all requests to React app
app.get('*', (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../../client/build', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('SQLite database initialized');
});
