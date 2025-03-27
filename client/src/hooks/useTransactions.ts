import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { transactions } from '../services/transactions';

const useTransactions = create(
  devtools(
    persist(
      (set, get) => ({
        incomes: [],
        expenses: [],
        savings: [],
        fetchIncomes: async () => {
          const incomes = await transactions.getIncomes();
          set({ incomes });
        },
        fetchExpenses: async () => {
          const expenses = await transactions.getExpenses();
          set({ expenses });
        },
        fetchSavings: async () => {
          const savings = await transactions.getSavings();
          set({ savings });
        },
        createIncome: async (income) => {
          await transactions.createIncome(income);
          get().fetchIncomes();
        },
        createExpense: async (expense) => {
          await transactions.createExpense(expense);
          get().fetchExpenses();
        },
        createSaving: async (saving) => {
          await transactions.createSaving(saving);
          get().fetchSavings();
        },
      }),
      {
        name: 'transactions-storage',
      }
    )
  )
);

export default useTransactions;
