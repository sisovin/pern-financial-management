import express from "express";
import {
  createTransaction as createTransactionService,
  updateTransaction as updateTransactionService,
  deleteTransaction as deleteTransactionService,
  getTransactionByUserId,
  getTransactionById,
  searchTransactions,
  getTransactionByDate,
  transactionFilter,
  transactionSummary,
  restoreTransaction,
  getTransactionByCategory,
  getTransactionByType,
  getTransactionByDescription,
  getTransactionByAmount,
  transactionIncome,
  transactionExpense,
  transactionSavings,
  transactionInvestment,
  getTransactionTypesWithCache,
} from "../services/transactionService.js";
import { logger } from "../utils/logger.js";
import { validateRequest } from "../utils/requestValidator.js";

// Transaction Type Constants
const TRANSACTION_TYPES = {
  INCOME: "INCOME",
  EXPENSE: "EXPENSE",
  TRANSFER: "TRANSFER", // For savings
  INVESTMENT: "INVESTMENT",
};


/**
 * Create a new transaction
 * @param {express.Request} req - Express request object
 * @param {express.Response} res - Express response object
 */
export const createTransaction = async (req, res) => {
  try {
    const { type, amount, description, date, categoryId, notes } = req.body;

    // Validate required fields
    if (!type || !amount || !description) {
      logger.warn("Transaction creation failed - missing required fields", {
        userId: req.user.id,
        body: req.body,
      });
      return res.status(400).json({
        success: false,
        message: "Type, amount, and description are required",
      });
    }

    // Prepare transaction data
    const transactionData = {
      type,
      amount: parseFloat(amount),
      description,
      date: date ? new Date(date) : new Date(),
      userId: req.user.id,
      categoryId,
      notes,
    };

    // Create transaction using service
    const transaction = await createTransactionService(transactionData);

    logger.info("Transaction created via API", {
      transactionId: transaction.id,
      userId: req.user.id,
    });

    return res.status(201).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    logger.error("API error - Failed to create transaction", {
      error: error.message,
      userId: req.user?.id,
      body: req.body,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to create transaction",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Update an existing transaction
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, amount, description, date, categoryId, notes } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Transaction ID is required",
      });
    }

    // Validate transaction exists and belongs to user
    const existingTransaction = await getTransactionById(Number(id));

    if (!existingTransaction) {
      logger.warn("Transaction update failed - transaction not found", {
        transactionId: id,
        userId: req.user.id,
      });
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    // Check authorization
    if (existingTransaction.userId !== req.user.id) {
      logger.warn("Transaction update failed - unauthorized access", {
        transactionId: id,
        userId: req.user.id,
        transactionUserId: existingTransaction.userId,
      });
      return res.status(403).json({
        success: false,
        message: "You don't have permission to update this transaction",
      });
    }

    // Prepare update data
    const updateData = {};
    if (type) updateData.type = type;
    if (amount) updateData.amount = parseFloat(amount);
    if (description) updateData.description = description;
    if (date) updateData.date = new Date(date);
    if (categoryId) updateData.categoryId = categoryId;
    if (notes !== undefined) updateData.notes = notes;

    // Update transaction using service
    const transaction = await updateTransactionService(Number(id), updateData);

    logger.info("Transaction updated via API", {
      transactionId: transaction.id,
      userId: req.user.id,
    });

    return res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    logger.error("API error - Failed to update transaction", {
      error: error.message,
      transactionId: req.params.id,
      userId: req.user?.id,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to update transaction",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Delete a transaction
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Transaction ID is required",
      });
    }

    // Validate transaction exists and belongs to user
    const existingTransaction = await getTransactionById(Number(id));

    if (!existingTransaction) {
      logger.warn("Transaction delete failed - transaction not found", {
        transactionId: id,
        userId: req.user.id,
      });
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    // Check authorization
    if (existingTransaction.userId !== req.user.id) {
      logger.warn("Transaction delete failed - unauthorized access", {
        transactionId: id,
        userId: req.user.id,
        transactionUserId: existingTransaction.userId,
      });
      return res.status(403).json({
        success: false,
        message: "You don't have permission to delete this transaction",
      });
    }

    // Delete transaction using service
    await deleteTransactionService(Number(id));

    logger.info("Transaction deleted via API", {
      transactionId: id,
      userId: req.user.id,
    });

    return res.status(204).send();
  } catch (error) {
    logger.error("API error - Failed to delete transaction", {
      error: error.message,
      transactionId: req.params.id,
      userId: req.user?.id,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to delete transaction",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get all transactions for the authenticated user
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const getTransactionsForUser = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await getTransactionByUserId(req.user.id, page, limit);

    logger.info("Transactions retrieved for user via API", {
      userId: req.user.id,
      count: result.transactions.length,
      page,
      limit,
    });

    return res.status(200).json({
      success: true,
      data: result.transactions,
      pagination: result.pagination,
    });
  } catch (error) {
    logger.error("API error - Failed to retrieve transactions", {
      error: error.message,
      userId: req.user?.id,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve transactions",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get transaction by ID
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const getTransactionByIdController = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Transaction ID is required",
      });
    }

    const transaction = await getTransactionById(Number(id));

    if (!transaction) {
      logger.warn("Transaction retrieval failed - transaction not found", {
        transactionId: id,
        userId: req.user.id,
      });
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    // Check authorization
    if (transaction.userId !== req.user.id) {
      logger.warn("Transaction retrieval failed - unauthorized access", {
        transactionId: id,
        userId: req.user.id,
        transactionUserId: transaction.userId,
      });
      return res.status(403).json({
        success: false,
        message: "You don't have permission to view this transaction",
      });
    }

    logger.info("Transaction retrieved by ID via API", {
      transactionId: id,
      userId: req.user.id,
    });

    return res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    logger.error("API error - Failed to retrieve transaction by ID", {
      error: error.message,
      transactionId: req.params.id,
      userId: req.user?.id,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve transaction",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Search transactions
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const searchTransactionsController = async (req, res) => {
  try {
    const { keyword } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (!keyword) {
      return res.status(400).json({
        success: false,
        message: "Search keyword is required",
      });
    }

    const result = await searchTransactions(keyword, page, limit);

    // Filter for user's transactions only
    const userTransactions = {
      transactions: result.transactions.filter((t) => t.userId === req.user.id),
      pagination: {
        ...result.pagination,
        total: result.transactions.filter((t) => t.userId === req.user.id)
          .length,
      },
    };

    logger.info("Transactions searched via API", {
      userId: req.user.id,
      keyword,
      resultsCount: userTransactions.transactions.length,
    });

    return res.status(200).json({
      success: true,
      data: userTransactions.transactions,
      pagination: userTransactions.pagination,
    });
  } catch (error) {
    logger.error("API error - Failed to search transactions", {
      error: error.message,
      keyword: req.query.keyword,
      userId: req.user?.id,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to search transactions",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get transactions by date range
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const getTransactionsByDateController = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Start date and end date are required",
      });
    }

    // Get transactions by date
    const result = await getTransactionByDate(startDate, endDate, page, limit);

    // Filter for user's transactions only
    const userTransactions = {
      transactions: result.transactions.filter((t) => t.userId === req.user.id),
      pagination: {
        ...result.pagination,
        total: result.transactions.filter((t) => t.userId === req.user.id)
          .length,
      },
    };

    logger.info("Transactions by date retrieved via API", {
      userId: req.user.id,
      startDate,
      endDate,
      resultsCount: userTransactions.transactions.length,
    });

    return res.status(200).json({
      success: true,
      data: userTransactions.transactions,
      pagination: userTransactions.pagination,
    });
  } catch (error) {
    logger.error("API error - Failed to retrieve transactions by date", {
      error: error.message,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      userId: req.user?.id,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve transactions by date",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Filter transactions
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const filterTransactionsController = async (req, res) => {
  try {
    const {
      type,
      categoryId,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      keyword,
    } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Prepare filters
    const filters = {
      userId: req.user.id, // Always filter by the authenticated user
      type: type || undefined,
      categoryId: categoryId || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      minAmount: minAmount || undefined,
      maxAmount: maxAmount || undefined,
      keyword: keyword || undefined,
    };

    // Filter transactions
    const result = await transactionFilter(filters, page, limit);

    logger.info("Transactions filtered via API", {
      userId: req.user.id,
      filters: Object.keys(filters).filter((k) => filters[k] !== undefined),
      resultsCount: result.transactions.length,
    });

    return res.status(200).json({
      success: true,
      data: result.transactions,
      pagination: result.pagination,
    });
  } catch (error) {
    logger.error("API error - Failed to filter transactions", {
      error: error.message,
      filters: req.query,
      userId: req.user?.id,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to filter transactions",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get transaction summary
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const getTransactionSummaryController = async (req, res) => {
  try {
    const { period, startDate, endDate } = req.query;

    // Generate summary
    const summary = await transactionSummary(
      req.user.id,
      period || "month",
      startDate,
      endDate
    );

    logger.info("Transaction summary generated via API", {
      userId: req.user.id,
      period: period || "month",
      startDate,
      endDate,
    });

    return res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    logger.error("API error - Failed to generate transaction summary", {
      error: error.message,
      period: req.query.period,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      userId: req.user?.id,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to generate transaction summary",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Restore a deleted transaction
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const restoreTransactionController = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Transaction ID is required",
      });
    }

    // Note: Normally would verify user ownership first, but we can't easily
    // check this for deleted transactions without additional service method

    // Restore transaction
    const transaction = await restoreTransaction(Number(id));

    // Verify ownership after restoration
    if (transaction.userId !== req.user.id) {
      logger.warn("Transaction restore failed - unauthorized access", {
        transactionId: id,
        userId: req.user.id,
        transactionUserId: transaction.userId,
      });

      // Re-delete the transaction we just restored
      await deleteTransactionService(Number(id));

      return res.status(403).json({
        success: false,
        message: "You don't have permission to restore this transaction",
      });
    }

    logger.info("Transaction restored via API", {
      transactionId: id,
      userId: req.user.id,
    });

    return res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    logger.error("API error - Failed to restore transaction", {
      error: error.message,
      transactionId: req.params.id,
      userId: req.user?.id,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to restore transaction",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get transactions by category
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const getTransactionsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: "Category ID is required",
      });
    }

    // Get transactions by category
    const result = await getTransactionByCategory(
      req.user.id,
      Number(categoryId),
      page,
      limit
    );

    logger.info("Transactions by category retrieved via API", {
      userId: req.user.id,
      categoryId,
      resultsCount: result.transactions.length,
    });

    return res.status(200).json({
      success: true,
      data: result.transactions,
      pagination: result.pagination,
    });
  } catch (error) {
    logger.error("API error - Failed to retrieve transactions by category", {
      error: error.message,
      categoryId: req.params.categoryId,
      userId: req.user?.id,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve transactions by category",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
 }
}

/**
 * Get transactions by type
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const getTransactionsByType = async (req, res) => {
  try {
    const { type } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (!type) {
      return res.status(400).json({
        success: false,
        message: "Transaction type is required",
      });
    }

    // Get transactions by type
    const result = await getTransactionByType(
      req.user.id,
      type,
      page,
      limit
    );

    logger.info("Transactions by type retrieved via API", {
      userId: req.user.id,
      type,
      resultsCount: result.transactions.length,
    });

    return res.status(200).json({
      success: true,
      data: result.transactions,
      pagination: result.pagination,
    });
  } catch (error) {
    logger.error("API error - Failed to retrieve transactions by type", {
      error: error.message,
      type: req.params.type,
      userId: req.user?.id,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve transactions by type",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

/**
 * Get transactions by description
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const getTransactionsByDescription = async (req, res) => {
  try {
    const { description } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (!description) {
      return res.status(400).json({
        success: false,
        message: "Transaction description is required",
      });
    }

    // Get transactions by description
    const result = await getTransactionByDescription(
      req.user.id,
      description,
      page,
      limit
    );

    logger.info("Transactions by description retrieved via API", {
      userId: req.user.id,
      description,
      resultsCount: result.transactions.length,
    });

    return res.status(200).json({
      success: true,
      data: result.transactions,
      pagination: result.pagination,
    });
  } catch (error) {
    logger.error("API error - Failed to retrieve transactions by description", {
      error: error.message,
      description: req.params.description,
      userId: req.user?.id,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve transactions by description",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

/**
 * Get transactions by amount
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const getTransactionsByAmount = async (req, res) => {
  try {
    const { amount } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (!amount) {
      return res.status(400).json({
        success: false,
        message: "Transaction amount is required",
      });
    }

    // Get transactions by amount
    const result = await getTransactionByAmount(
      req.user.id,
      amount,
      page,
      limit
    );

    logger.info("Transactions by amount retrieved via API", {
      userId: req.user.id,
      amount,
      resultsCount: result.transactions.length,
    });

    return res.status(200).json({
      success: true,
      data: result.transactions,
      pagination: result.pagination,
    });
  } catch (error) {
    logger.error("API error - Failed to retrieve transactions by amount", {
      error: error.message,
      amount: req.params.amount,
      userId: req.user?.id,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve transactions by amount",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

/**
 * Handle income transactions (GET and POST)
 */
export const transactionIncomeController = async (req, res) => {
  const userId = req.user.id;
  
  try {
    // Get transaction types dynamically
    const TRANSACTION_TYPES = await getTransactionTypesWithCache();
    
    // Handle GET request - fetch all income transactions
    if (req.method === 'GET') {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      
      // Use the service function to get income transactions
      const result = await transactionIncome(page, limit, userId);
      
      return res.status(200).json({
        error: false,
        message: 'Income transactions retrieved successfully',
        data: result.transactions,
        pagination: result.pagination
      });
    }
    
    // Handle POST request - create a new income transaction
    if (req.method === 'POST') {
      // Validate the income transaction request
      const { error, value } = validateRequest(req.body, {
        amount: { type: 'number', required: true },
        description: { type: 'string', required: true },
        date: { type: 'date' },
        categories: { type: 'array' },
        notes: { type: 'string' }
      });
      
      if (error) {
        return res.status(400).json({
          error: true,
          message: 'Invalid request data',
          details: error
        });
      }
      
      // Extract validated data
      const { amount, description, date, categories = [], notes } = value;
      
      // Prepare transaction data object
      const transactionData = {
        userId,
        amount: Math.abs(amount), // Income is always positive
        description,
        date: date || new Date(),
        notes,
        type: TRANSACTION_TYPES.INCOME,
        categories: {
          connect: categories.map(categoryId => ({ id: categoryId }))
        }
      };
      
      // Use the service function to create the transaction
      const transaction = await createTransaction(transactionData);
      
      // Log the transaction in audit logs
      await prisma.auditLog.create({
        data: {
          userId,
          action: 'TRANSACTION_CREATED',
          details: { 
            transactionId: transaction.id, 
            type: TRANSACTION_TYPES.INCOME,
            amount
          }
        }
      });
      
      return res.status(201).json({
        error: false,
        message: 'Income transaction created successfully',
        data: transaction
      });
    }
    
    // If neither GET nor POST
    return res.status(405).json({
      error: true,
      message: 'Method not allowed'
    });
  } catch (error) {
    logger.error('Income transaction error:', { 
      error: error.message,
      stack: error.stack,
      userId,
      method: req.method
    });
    
    return res.status(500).json({
      error: true,
      message: 'Failed to process income transaction',
      details: error.message
    });
  }
};

/**
 * Handle expense transactions (GET and POST)
 */
/**
 * Handle expense transactions (GET and POST)
 */
export const transactionExpenseController = async (req, res) => {
  const userId = req.user.id;

  try {
    // Fetch transaction types using the cached service
    const TRANSACTION_TYPES = await getTransactionTypesWithCache();
    
    // Handle GET request - fetch all expense transactions
    if (req.method === 'GET') {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      
      // Use the service function instead of direct Prisma calls
      const result = await transactionExpense(page, limit, userId);
      
      return res.status(200).json({
        error: false,
        message: 'Expense transactions retrieved successfully',
        data: result.transactions,
        pagination: result.pagination
      });
    }

    // Handle POST request - create a new expense transaction
    if (req.method === 'POST') {
      // Validate the expense transaction request
      const { error, value } = validateRequest(req.body, {
        amount: { type: 'number', required: true },
        description: { type: 'string', required: true },
        date: { type: 'date' },
        categories: { type: 'array' },
        notes: { type: 'string' }
      });

      if (error) {
        return res.status(400).json({
          error: true,
          message: 'Invalid request data',
          details: error
        });
      }

      // Extract validated data
      const { amount, description, date, categories = [], notes } = value;

      // Prepare transaction data object
      const transactionData = {
        userId,
        amount: Math.abs(amount) * -1, // Store as negative number for expenses
        description,
        date: date || new Date(),
        notes,
        type: TRANSACTION_TYPES.EXPENSE,
        categories: {
          connect: categories.map(categoryId => ({ id: categoryId }))
        }
      };

      // Use the service function to create the transaction
      const transaction = await createTransaction(transactionData);

      // Log the transaction in audit logs
      await prisma.auditLog.create({
        data: {
          userId,
          action: 'TRANSACTION_CREATED',
          details: { 
            transactionId: transaction.id, 
            type: TRANSACTION_TYPES.EXPENSE,
            amount
          }
        }
      });

      return res.status(201).json({
        error: false,
        message: 'Expense transaction created successfully',
        data: transaction
      });
    }

    // If neither GET nor POST
    return res.status(405).json({
      error: true,
      message: 'Method not allowed'
    });
  } catch (error) {
    logger.error('Expense transaction error:', { 
      error: error.message,
      stack: error.stack,
      userId,
      method: req.method
    });
    
    return res.status(500).json({
      error: true,
      message: 'Failed to process expense transaction',
      details: error.message
    });
  }
};

/**
 * Handle savings transactions (GET and POST)
 */
export const transactionSavingsController = async (req, res) => {
  const userId = req.user.id;
  
  try {
    // Get transaction types dynamically
    const TRANSACTION_TYPES = await getTransactionTypesWithCache();
    
    // Handle GET request - fetch all savings transactions
    if (req.method === 'GET') {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      
      // Use the service function to get savings transactions
      const result = await transactionSavings(page, limit, userId);
      
      return res.status(200).json({
        error: false,
        message: 'Savings transactions retrieved successfully',
        data: result.transactions,
        pagination: result.pagination
      });
    }
    
    // Handle POST request - create a new savings transaction
    if (req.method === 'POST') {
      // Validate the savings transaction request
      const { error, value } = validateRequest(req.body, {
        amount: { type: 'number', required: true },
        description: { type: 'string', required: true },
        date: { type: 'date' },
        goalId: { type: 'string' }, // Optional saving goal ID
        categories: { type: 'array' },
        notes: { type: 'string' }
      });
      
      if (error) {
        return res.status(400).json({
          error: true,
          message: 'Invalid request data',
          details: error
        });
      }
      
      // Extract validated data
      const { amount, description, date, goalId, categories = [], notes } = value;
      
      // Transaction to create the savings record and update the goal if provided
      const result = await prisma.$transaction(async (prisma) => {
        // Create the savings transaction
        const transaction = await prisma.transaction.create({
          data: {
            userId,
            amount: Math.abs(amount) * -1, // Treated as an expense from regular account
            description,
            date: date || new Date(),
            notes,
            type: TRANSACTION_TYPES.TRANSFER,
            categories: {
              connect: categories.map(categoryId => ({ id: categoryId }))
            }
          },
          include: {
            categories: true
          }
        });
        
        // If a goal ID is provided, update the goal's current amount
        if (goalId) {
          const goal = await prisma.savingGoal.findUnique({
            where: { id: goalId, userId }
          });
          
          if (!goal) {
            throw new Error('Saving goal not found');
          }
          
          // Update the goal with the new amount
          await prisma.savingGoal.update({
            where: { id: goalId },
            data: {
              currentAmount: {
                increment: Math.abs(amount)
              },
              // Automatically mark as achieved if target is reached
              isAchieved: goal.currentAmount + Math.abs(amount) >= goal.targetAmount
            }
          });
        }
        
        return transaction;
      });
      
      // Log the transaction in audit logs
      await prisma.auditLog.create({
        data: {
          userId,
          action: 'TRANSACTION_CREATED',
          details: { 
            transactionId: result.id, 
            type: TRANSACTION_TYPES.TRANSFER,
            amount,
            goalId
          }
        }
      });
      
      return res.status(201).json({
        error: false,
        message: 'Savings transaction created successfully',
        data: result
      });
    }
    
    // If neither GET nor POST
    return res.status(405).json({
      error: true,
      message: 'Method not allowed'
    });
  } catch (error) {
    logger.error('Savings transaction error:', { 
      error: error.message,
      stack: error.stack,
      userId,
      method: req.method
    });
    
    return res.status(500).json({
      error: true,
      message: 'Failed to process savings transaction',
      details: error.message
    });
  }
};

/**
 * Handle investment transactions (GET and POST)
 */
export const transactionInvestmentController = async (req, res) => {
  const userId = req.user.id;
  
  try {
    // Get transaction types dynamically
    const TRANSACTION_TYPES = await getTransactionTypesWithCache();
    
    // Handle GET request - fetch all investment transactions
    if (req.method === 'GET') {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      
      // Use the service function to get investment transactions
      const result = await transactionInvestment(page, limit, userId);
      
      return res.status(200).json({
        error: false,
        message: 'Investment transactions retrieved successfully',
        data: result.transactions,
        pagination: result.pagination
      });
    }
    
    // Handle POST request - create a new investment transaction
    if (req.method === 'POST') {
      // Validate the investment transaction request
      const { error, value } = validateRequest(req.body, {
        amount: { type: 'number', required: true },
        description: { type: 'string', required: true },
        date: { type: 'date' },
        investmentType: { type: 'string' }, // e.g., stock, bond, real estate
        categories: { type: 'array' },
        notes: { type: 'string' }
      });
      
      if (error) {
        return res.status(400).json({
          error: true,
          message: 'Invalid request data',
          details: error
        });
      }
      
      // Extract validated data
      const { amount, description, date, investmentType, categories = [], notes } = value;
      
      // Prepare transaction data object
      const transactionData = {
        userId,
        amount: Math.abs(amount) * -1, // Initial investment is an outflow
        description,
        date: date || new Date(),
        notes: notes || (investmentType ? `Investment Type: ${investmentType}` : null),
        type: TRANSACTION_TYPES.INVESTMENT,
        categories: {
          connect: categories.map(categoryId => ({ id: categoryId }))
        }
      };
      
      // Use the service function to create the transaction
      const transaction = await createTransaction(transactionData);
      
      // Log the transaction in audit logs
      await prisma.auditLog.create({
        data: {
          userId,
          action: 'TRANSACTION_CREATED',
          details: { 
            transactionId: transaction.id, 
            type: TRANSACTION_TYPES.INVESTMENT,
            amount,
            investmentType
          }
        }
      });
      
      return res.status(201).json({
        error: false,
        message: 'Investment transaction created successfully',
        data: transaction
      });
    }
    
    // If neither GET nor POST
    return res.status(405).json({
      error: true,
      message: 'Method not allowed'
    });
  } catch (error) {
    logger.error('Investment transaction error:', { 
      error: error.message,
      stack: error.stack,
      userId,
      method: req.method
    });
    
    return res.status(500).json({
      error: true,
      message: 'Failed to process investment transaction',
      details: error.message
    });
  }
};