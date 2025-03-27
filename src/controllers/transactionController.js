const prisma = require('../config/db');
const dotenv = require('dotenv');

dotenv.config();

const createIncome = async (req, res) => {
  const { amount } = req.body;
  const { userId } = req.user;

  try {
    const income = await prisma.transaction.create({
      data: {
        userId,
        type: 'income',
        amount,
      },
    });
    res.json(income);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create income' });
  }
};

const createExpense = async (req, res) => {
  const { amount } = req.body;
  const { userId } = req.user;

  try {
    const expense = await prisma.transaction.create({
      data: {
        userId,
        type: 'expense',
        amount,
      },
    });
    res.json(expense);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create expense' });
  }
};

const createSaving = async (req, res) => {
  const { amount } = req.body;
  const { userId } = req.user;

  try {
    const saving = await prisma.transaction.create({
      data: {
        userId,
        type: 'saving',
        amount,
      },
    });
    res.json(saving);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create saving' });
  }
};

const getIncomes = async (req, res) => {
  const { userId } = req.user;

  try {
    const incomes = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'income',
      },
    });
    res.json(incomes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch incomes' });
  }
};

const getExpenses = async (req, res) => {
  const { userId } = req.user;

  try {
    const expenses = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'expense',
      },
    });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
};

const getSavings = async (req, res) => {
  const { userId } = req.user;

  try {
    const savings = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'saving',
      },
    });
    res.json(savings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch savings' });
  }
};

module.exports = {
  createIncome,
  createExpense,
  createSaving,
  getIncomes,
  getExpenses,
  getSavings,
};
