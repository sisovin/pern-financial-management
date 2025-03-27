const express = require('express');
const dotenv = require('dotenv');
const { authenticateJWT } = require('./middleware/authMiddleware');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const goalRoutes = require('./routes/goalRoutes');
const adminRoutes = require('./routes/adminRoutes');
const reportRoutes = require('./routes/reportRoutes');

dotenv.config();

const app = express();

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', authenticateJWT, userRoutes);
app.use('/api/transactions', authenticateJWT, transactionRoutes);
app.use('/api/goals', authenticateJWT, goalRoutes);
app.use('/api/admin', authenticateJWT, adminRoutes);
app.use('/api/reports', authenticateJWT, reportRoutes);

module.exports = app;
