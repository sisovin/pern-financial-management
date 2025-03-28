import React, { useState } from 'react';
import { Transaction } from '../../hooks/useTransactions';

interface TransactionFormProps {  
  onSubmit: (transaction: Omit<Transaction, "id">) => void;
  initialData?: Transaction;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onSubmit, initialData }) => {
  const [transaction, setTransaction] = useState<Omit<Transaction, "id">>(
    initialData ? {
      amount: initialData.amount,
      date: initialData.date,
      description: initialData.description,
      category: initialData.category,
      type: initialData.type
    } : {
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      description: '',
      category: '',
      type: 'expense',
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'amount') {
      setTransaction(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0,
      }));
    } else if (name === 'type') {
      setTransaction(prev => ({
        ...prev,
        [name]: value as 'income' | 'expense',
      }));
    } else {
      setTransaction(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(transaction);
    
    if (!initialData) {
      setTransaction({
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        description: '',
        category: '',
        type: 'expense',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-control">
        <label htmlFor="type" className="form-label">Type</label>
        <select
          id="type"
          name="type"
          value={transaction.type}
          onChange={handleChange}
          className="form-select"
          required
        >
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>
      
      <div className="form-control">
        <label htmlFor="amount" className="form-label">Amount</label>
        <input
          type="number"
          id="amount"
          name="amount"
          value={transaction.amount}
          onChange={handleChange}
          className="form-input"
          step="0.01"
          min="0"
          required
        />
      </div>
      
      <div className="form-control">
        <label htmlFor="date" className="form-label">Date</label>
        <input
          type="date"
          id="date"
          name="date"
          value={transaction.date}
          onChange={handleChange}
          className="form-input"
          required
        />
      </div>
      
      <div className="form-control">
        <label htmlFor="category" className="form-label">Category</label>
        <select
          id="category"
          name="category"
          value={transaction.category}
          onChange={handleChange}
          className="form-select"
          required
        >
          <option value="">Select a category</option>
          <option value="Income">Income</option>
          <option value="Food">Food</option>
          <option value="Transportation">Transportation</option>
          <option value="Entertainment">Entertainment</option>
          <option value="Utilities">Utilities</option>
          <option value="Housing">Housing</option>
          <option value="Other">Other</option>
        </select>
      </div>
      
      <div className="form-control">
        <label htmlFor="description" className="form-label">Description</label>
        <input
          type="text"
          id="description"
          name="description"
          value={transaction.description}
          onChange={handleChange}
          className="form-input"
          required
        />
      </div>
      
      <button 
        type="submit" 
        className="btn btn-primary btn-full"
      >
        {initialData ? 'Update' : 'Add'} Transaction
      </button>
    </form>
  );
};

export default TransactionForm;