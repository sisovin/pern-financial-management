import React, { useEffect, useState } from 'react';
import useTransactions from '../../hooks/useTransactions';

const Transactions = () => {
  const { incomes, expenses, savings, fetchIncomes, fetchExpenses, fetchSavings, createIncome, createExpense, createSaving } = useTransactions();
  const [newIncome, setNewIncome] = useState('');
  const [newExpense, setNewExpense] = useState('');
  const [newSaving, setNewSaving] = useState('');

  useEffect(() => {
    fetchIncomes();
    fetchExpenses();
    fetchSavings();
  }, [fetchIncomes, fetchExpenses, fetchSavings]);

  const handleAddIncome = () => {
    createIncome({ amount: parseFloat(newIncome) });
    setNewIncome('');
  };

  const handleAddExpense = () => {
    createExpense({ amount: parseFloat(newExpense) });
    setNewExpense('');
  };

  const handleAddSaving = () => {
    createSaving({ amount: parseFloat(newSaving) });
    setNewSaving('');
  };

  return (
    <div className="transactions">
      <h1>Transactions</h1>
      <div className="transaction-form">
        <h2>Add Income</h2>
        <input
          type="number"
          value={newIncome}
          onChange={(e) => setNewIncome(e.target.value)}
          placeholder="Amount"
        />
        <button onClick={handleAddIncome}>Add Income</button>
      </div>
      <div className="transaction-form">
        <h2>Add Expense</h2>
        <input
          type="number"
          value={newExpense}
          onChange={(e) => setNewExpense(e.target.value)}
          placeholder="Amount"
        />
        <button onClick={handleAddExpense}>Add Expense</button>
      </div>
      <div className="transaction-form">
        <h2>Add Saving</h2>
        <input
          type="number"
          value={newSaving}
          onChange={(e) => setNewSaving(e.target.value)}
          placeholder="Amount"
        />
        <button onClick={handleAddSaving}>Add Saving</button>
      </div>
      <div className="transaction-list">
        <h2>Incomes</h2>
        <ul>
          {incomes.map((income) => (
            <li key={income.id}>{income.amount}</li>
          ))}
        </ul>
      </div>
      <div className="transaction-list">
        <h2>Expenses</h2>
        <ul>
          {expenses.map((expense) => (
            <li key={expense.id}>{expense.amount}</li>
          ))}
        </ul>
      </div>
      <div className="transaction-list">
        <h2>Savings</h2>
        <ul>
          {savings.map((saving) => (
            <li key={saving.id}>{saving.amount}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Transactions;
