import React, { useEffect } from 'react';
import useTransactions from '../../hooks/useTransactions';

const Overview = () => {
  const { incomes, expenses, savings, fetchIncomes, fetchExpenses, fetchSavings } = useTransactions();

  useEffect(() => {
    fetchIncomes();
    fetchExpenses();
    fetchSavings();
  }, [fetchIncomes, fetchExpenses, fetchSavings]);

  const totalIncome = incomes.reduce((acc, income) => acc + income.amount, 0);
  const totalExpenses = expenses.reduce((acc, expense) => acc + expense.amount, 0);
  const totalSavings = savings.reduce((acc, saving) => acc + saving.amount, 0);

  return (
    <div className="overview">
      <h1>Financial Overview</h1>
      <div className="summary">
        <div className="summary-item">
          <h2>Total Income</h2>
          <p>{totalIncome}</p>
        </div>
        <div className="summary-item">
          <h2>Total Expenses</h2>
          <p>{totalExpenses}</p>
        </div>
        <div className="summary-item">
          <h2>Total Savings</h2>
          <p>{totalSavings}</p>
        </div>
      </div>
    </div>
  );
};

export default Overview;
