import React from 'react';
import { Transaction } from '../../hooks/useTransactions';

interface TransactionListProps {
  transactions: Transaction[];
  onUpdate: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ 
  transactions, 
  onUpdate, 
  onDelete 
}) => {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-6 text-text-muted">
        No transactions found. Add a new transaction to get started.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {transactions.map(transaction => (
        <div 
          key={transaction.id} 
          className={`transaction-card ${
            transaction.type === 'income' 
              ? 'transaction-income' 
              : 'transaction-expense'
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <div className="font-medium text-lg">
                {transaction.description}
              </div>
              <div className="text-text-muted">
                {transaction.category} • {new Date(transaction.date).toLocaleDateString()}
              </div>
            </div>
            <div className={`transaction-amount ${
              transaction.type === 'income' ? 'income-amount' : 'expense-amount'
            }`}>
              {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-3">
            <button 
              onClick={() => onUpdate(transaction)}
              className="btn btn-secondary mr-2"
            >
              Edit
            </button>
            <button 
              onClick={() => {
                if(window.confirm('Are you sure you want to delete this transaction?')) {
                  onDelete(transaction.id);
                }
              }}
              className="btn btn-danger"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TransactionList;