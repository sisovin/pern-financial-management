import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const createIncome = async (income) => {
  const response = await axios.post(`${API_URL}/transactions/income`, income);
  return response.data;
};

const createExpense = async (expense) => {
  const response = await axios.post(`${API_URL}/transactions/expenses`, expense);
  return response.data;
};

const createSaving = async (saving) => {
  const response = await axios.post(`${API_URL}/transactions/savings`, saving);
  return response.data;
};

const getIncomes = async () => {
  const response = await axios.get(`${API_URL}/transactions/income`);
  return response.data;
};

const getExpenses = async () => {
  const response = await axios.get(`${API_URL}/transactions/expenses`);
  return response.data;
};

const getSavings = async () => {
  const response = await axios.get(`${API_URL}/transactions/savings`);
  return response.data;
};

export const transactions = {
  createIncome,
  createExpense,
  createSaving,
  getIncomes,
  getExpenses,
  getSavings,
};
