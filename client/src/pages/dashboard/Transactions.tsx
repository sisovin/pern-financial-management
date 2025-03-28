import React, { useState, useEffect } from 'react';
import TransactionForm from '../../components/transactions/TransactionForm';
import TransactionList from '../../components/transactions/TransactionList';
import TransactionFilter from '../../components/transactions/TransactionFilter';
import useTransactions, { Transaction } from '../../hooks/useTransactions';

interface FilterCriteria {
  category?: string;
  dateRange?: { 
    startDate?: string; 
    endDate?: string; 
  };
  minAmount?: number;
  maxAmount?: number;
}

const Transactions: React.FC = () => {
  const { transactions, loading, error, addTransaction, updateTransaction, deleteTransaction } = useTransactions();
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);

  // Update filtered transactions when original transactions change
  useEffect(() => {
    setFilteredTransactions(transactions);
  }, [transactions]);

  const handleFilter = (filters: FilterCriteria) => {
    const filtered = transactions.filter(transaction => {
      let matches = true;
      
      // Filter by category
      if (filters.category && transaction.category !== filters.category) {
        matches = false;
      }
      
      // Filter by date range
      if (filters.dateRange) {
        const txDate = new Date(transaction.date);
        if (filters.dateRange.startDate && txDate < new Date(filters.dateRange.startDate)) {
          matches = false;
        }
        if (filters.dateRange.endDate && txDate > new Date(filters.dateRange.endDate)) {
          matches = false;
        }
      }
      
      // Filter by amount range
      if (filters.minAmount !== undefined && transaction.amount < filters.minAmount) {
        matches = false;
      }
      if (filters.maxAmount !== undefined && transaction.amount > filters.maxAmount) {
        matches = false;
      }
      
      return matches;
    });
    
    setFilteredTransactions(filtered);
  };

  const handleUpdate = (transaction: Transaction) => {
    updateTransaction(transaction.id, transaction);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loader"></div>
      </div>
    );
  }

  if (error) {
    return <div className="bg-error/10 text-error p-4 rounded">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Transactions</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="filter-section">
            <h2 className="text-lg font-semibold mb-4">Add Transaction</h2>
            <TransactionForm onSubmit={addTransaction} />
          </div>
          
          <div className="filter-section mt-6">
            <h2 className="text-lg font-semibold mb-4">Filter Transactions</h2>
            <TransactionFilter onFilter={handleFilter} />
          </div>
        </div>
        
        <div className="lg:col-span-2">
          <div className="filter-section">
            <h2 className="text-lg font-semibold mb-4">Your Transactions</h2>
            <TransactionList 
              transactions={filteredTransactions} 
              onUpdate={handleUpdate}
              onDelete={deleteTransaction}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transactions;