const prisma = require('../config/db');
const dotenv = require('dotenv');

dotenv.config();

const createIncome = async (userId, amount) => {
  try {
    const income = await prisma.transaction.create({
      data: {
        userId,
        type: 'income',
        amount,
      },
    });
    return income;
  } catch (error) {
    throw new Error('Failed to create income');
  }
};

const createExpense = async (userId, amount) => {
  try {
    const expense = await prisma.transaction.create({
      data: {
        userId,
        type: 'expense',
        amount,
      },
    });
    return expense;
  } catch (error) {
    throw new Error('Failed to create expense');
  }
};

const createSaving = async (userId, amount) => {
  try {
    const saving = await prisma.transaction.create({
      data: {
        userId,
        type: 'saving',
        amount,
      },
    });
    return saving;
  } catch (error) {
    throw new Error('Failed to create saving');
  }
};

const getIncomes = async (userId) => {
  try {
    const incomes = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'income',
      },
    });
    return incomes;
  } catch (error) {
    throw new Error('Failed to fetch incomes');
  }
};

const getExpenses = async (userId) => {
  try {
    const expenses = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'expense',
      },
    });
    return expenses;
  } catch (error) {
    throw new Error('Failed to fetch expenses');
  }
};

const getSavings = async (userId) => {
  try {
    const savings = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'saving',
      },
    });
    return savings;
  } catch (error) {
    throw new Error('Failed to fetch savings');
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
