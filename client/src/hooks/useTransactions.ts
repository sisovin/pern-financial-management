import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/apiClient';

// Define the Transaction interface
export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  type: 'income' | 'expense';
}

// Mock data for development
const mockTransactions: Transaction[] = [
  {
    id: '1',
    amount: 1200,
    description: 'Salary',
    category: 'Income',
    date: '2025-03-15',
    type: 'income'
  },
  {
    id: '2',
    amount: 45.99,
    description: 'Grocery shopping',
    category: 'Food',
    date: '2025-03-20',
    type: 'expense'
  },
  {
    id: '3',
    amount: 10.50,
    description: 'Coffee',
    category: 'Food',
    date: '2025-03-21',
    type: 'expense'
  },
  {
    id: '4',
    amount: 500,
    description: 'Freelance work',
    category: 'Income',
    date: '2025-03-22',
    type: 'income'
  }
];

// Flag to use mock data (set to true for development)
const USE_MOCK_DATA = true;

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch transactions from API or use mock data
  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (USE_MOCK_DATA) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        setTransactions(mockTransactions);
      } else {
        const response = await apiClient.get('/transactions');
        setTransactions(response.data);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to load transactions. Using sample data instead.');
      // Fall back to mock data even in production if API fails
      setTransactions(mockTransactions);
    } finally {
      setLoading(false);
    }
  }, []);

  // Add a new transaction
  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    try {
      if (USE_MOCK_DATA) {
        // Create mock transaction with generated ID
        const newTransaction = {
          ...transaction,
          id: Date.now().toString(),
        };
        setTransactions(prev => [...prev, newTransaction]);
        return newTransaction;
      } else {
        const response = await apiClient.post('/transactions', transaction);
        setTransactions(prev => [...prev, response.data]);
        return response.data;
      }
    } catch (err) {
      console.error('Error adding transaction:', err);
      setError('Failed to add transaction');
      throw err;
    }
  };

  // Update an existing transaction
  const updateTransaction = async (id: string, data: Partial<Transaction>) => {
    try {
      if (USE_MOCK_DATA) {
        // Update mock transaction
        const updatedTransaction = { id, ...data } as Transaction;
        setTransactions(prev => 
          prev.map(t => (t.id === id ? { ...t, ...data } : t))
        );
        return updatedTransaction;
      } else {
        const response = await apiClient.put(`/transactions/${id}`, data);
        setTransactions(prev => 
          prev.map(t => (t.id === id ? { ...t, ...response.data } : t))
        );
        return response.data;
      }
    } catch (err) {
      console.error('Error updating transaction:', err);
      setError('Failed to update transaction');
      throw err;
    }
  };

  // Delete a transaction
  const deleteTransaction = async (id: string) => {
    try {
      if (USE_MOCK_DATA) {
        // Delete mock transaction
        setTransactions(prev => prev.filter(t => t.id !== id));
      } else {
        await apiClient.delete(`/transactions/${id}`);
        setTransactions(prev => prev.filter(t => t.id !== id));
      }
    } catch (err) {
      console.error('Error deleting transaction:', err);
      setError('Failed to delete transaction');
      throw err;
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return {
    transactions,
    loading,
    error,
    fetchTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction
  };
};

export default useTransactions;