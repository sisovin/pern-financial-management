import express from "express";
import { authenticate, validateTransaction } from "../middleware/authMiddleware.js";
import {
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionsForUser,
  getTransactionByIdController,
  searchTransactionsController,
  getTransactionsByDateController,
  filterTransactionsController,
  getTransactionSummaryController,
  restoreTransactionController,
  getTransactionsByCategory,
  getTransactionsByType,
  getTransactionsByDescription,
  getTransactionsByAmount,
  transactionIncomeController,
  transactionExpenseController,
  transactionSavingsController,
  transactionInvestmentController,
} from "../controllers/transactionController.js";

const router = express.Router();

// Apply authentication to all transaction routes
router.use(authenticate);

// Basic CRUD operations
router.post("/", validateTransaction, createTransaction);
router.put("/:id", validateTransaction, updateTransaction);
router.delete("/:id", deleteTransaction);
router.get("/", getTransactionsForUser);
router.get("/:id", getTransactionByIdController);

// Advanced query operations
router.get("/search", searchTransactionsController);
router.get("/date-range", getTransactionsByDateController);
router.get("/filter", filterTransactionsController);
router.get("/summary", getTransactionSummaryController);
router.get("/category", getTransactionsByCategory);
router.get("/type", getTransactionsByType);
router.get("/description", getTransactionsByDescription);
router.get("/amount", getTransactionsByAmount);

// Transactions Income
router.get("/income", transactionIncomeController);
router.post("/income", transactionIncomeController);
// Transactions Expense
router.get("/expense", transactionExpenseController);
router.post("/expense", transactionExpenseController);
// Transactions Savings
router.get("/savings", transactionSavingsController);
router.post("/savings", transactionSavingsController);
// Transactions Investment
router.get("/investment", transactionInvestmentController);
router.post("/investment", transactionInvestmentController);


// Special operations
router.post("/:id/restore", restoreTransactionController);

export default router;
