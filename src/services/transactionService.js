import { prisma } from "../config/db.js";
import { logger } from "../utils/logger.js";
import { getTransactionTypes } from "./categoryService.js";

// Cache for transaction types to avoid excessive database queries
let transactionTypesCache = null;
let lastCacheTime = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Create a new transaction
 * @param {Object} transactionData - The transaction data
 * @returns {Object} Created transaction
 */
export const createTransaction = async (transactionData) => {
  try {
    logger.info('Creating new transaction', { userId: transactionData.userId });
    
    const transaction = await prisma.transaction.create({
      data: transactionData
    });
    
    logger.info('Transaction created successfully', { 
      transactionId: transaction.id, 
      userId: transaction.userId 
    });
    
    return transaction;
  } catch (error) {
    logger.error('Failed to create transaction', { 
      error: error.message,
      stack: error.stack,
      data: transactionData
    });
    throw error;
  }
};

/**
 * Update an existing transaction
 * @param {number} id - Transaction ID
 * @param {Object} transactionData - Updated transaction data
 * @returns {Object} Updated transaction
 */
export const updateTransaction = async (id, transactionData) => {
  try {
    logger.info('Updating transaction', { transactionId: id });
    
    const transaction = await prisma.transaction.update({
      where: { id },
      data: transactionData
    });
    
    logger.info('Transaction updated successfully', { 
      transactionId: transaction.id,
      userId: transaction.userId 
    });
    
    return transaction;
  } catch (error) {
    logger.error('Failed to update transaction', { 
      error: error.message,
      stack: error.stack,
      transactionId: id,
      data: transactionData
    });
    throw error;
  }
};

/**
 * Delete a transaction
 * @param {number} id - Transaction ID
 * @returns {Object} Deleted transaction
 */
export const deleteTransaction = async (id) => {
  try {
    logger.info('Deleting transaction', { transactionId: id });
    
    const transaction = await prisma.transaction.delete({
      where: { id }
    });
    
    logger.info('Transaction deleted successfully', { 
      transactionId: transaction.id,
      userId: transaction.userId 
    });
    
    return transaction;
  } catch (error) {
    logger.error('Failed to delete transaction', { 
      error: error.message,
      stack: error.stack,
      transactionId: id
    });
    throw error;
  }
};

/**
 * Get all transactions with pagination
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Object} Transactions with pagination info
 */
export const getTransactions = async (page = 1, limit = 10) => {
  try {
    logger.info('Retrieving all transactions', { page, limit });
    
    const skip = (page - 1) * limit;
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.transaction.count()
    ]);
    
    logger.info('Transactions retrieved successfully', { 
      count: transactions.length,
      total,
      page
    });
    
    return {
      transactions,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    logger.error('Failed to retrieve transactions', { 
      error: error.message,
      stack: error.stack,
      page,
      limit
    });
    throw error;
  }
};

/**
 * Get a transaction by ID
 * @param {number} id - Transaction ID
 * @returns {Object} Transaction
 */
export const getTransactionById = async (id) => {
  try {
    logger.info('Retrieving transaction by ID', { transactionId: id });
    
    const transaction = await prisma.transaction.findUnique({
      where: { id }
    });
    
    if (!transaction) {
      logger.warn('Transaction not found', { transactionId: id });
      return null;
    }
    
    logger.info('Transaction retrieved successfully', { transactionId: id });
    return transaction;
  } catch (error) {
    logger.error('Failed to retrieve transaction by ID', { 
      error: error.message,
      stack: error.stack,
      transactionId: id
    });
    throw error;
  }
};

/**
 * Get transactions by date
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Object} Transactions with pagination info
 */
export const getTransactionByDate = async (startDate, endDate, page = 1, limit = 10) => {
  try {
    logger.info('Retrieving transactions by date range', { 
      startDate, 
      endDate,
      page,
      limit
    });
    
    const skip = (page - 1) * limit;
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: {
          date: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          }
        },
        skip,
        take: limit,
        orderBy: { date: 'desc' }
      }),
      prisma.transaction.count({
        where: {
          date: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          }
        }
      })
    ]);
    
    logger.info('Transactions by date retrieved successfully', { 
      count: transactions.length,
      total,
      startDate,
      endDate
    });
    
    return {
      transactions,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    logger.error('Failed to retrieve transactions by date', { 
      error: error.message,
      stack: error.stack,
      startDate,
      endDate,
      page,
      limit
    });
    throw error;
  }
};

/**
 * Get transactions by type
 * @param {string} type - Transaction type
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Object} Transactions with pagination info
 */
export const getTransactionByType = async (type, page = 1, limit = 10) => {
  try {
    logger.info('Retrieving transactions by type', { type, page, limit });
    
    const skip = (page - 1) * limit;
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: { type },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.transaction.count({
        where: { type }
      })
    ]);
    
    logger.info('Transactions by type retrieved successfully', { 
      type,
      count: transactions.length,
      total
    });
    
    return {
      transactions,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    logger.error('Failed to retrieve transactions by type', { 
      error: error.message,
      stack: error.stack,
      type,
      page,
      limit
    });
    throw error;
  }
};

/**
 * Get transactions by description
 * @param {string} description - Transaction description
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Object} Transactions with pagination info
 */
export const getTransactionByDescription = async (description, page = 1, limit = 10) => {
  try {
    logger.info('Retrieving transactions by description', { description, page, limit });
    
    const skip = (page - 1) * limit;
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: { 
          description: {
            contains: description,
            mode: 'insensitive'
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.transaction.count({
        where: {
          description: {
            contains: description,
            mode: 'insensitive'
          }
        }
      })
    ]);
    
    logger.info('Transactions by description retrieved successfully', { 
      description,
      count: transactions.length,
      total
    });
    
    return {
      transactions,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    logger.error('Failed to retrieve transactions by description', { 
      error: error.message,
      stack: error.stack,
      description,
      page,
      limit
    });
    throw error;
  }
};

/**
 * Get transactions by amount range
 * @param {number} minAmount - Minimum amount
 * @param {number} maxAmount - Maximum amount
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Object} Transactions with pagination info
 */
export const getTransactionByAmount = async (minAmount, maxAmount, page = 1, limit = 10) => {
  try {
    logger.info('Retrieving transactions by amount range', { 
      minAmount, 
      maxAmount,
      page,
      limit
    });
    
    const skip = (page - 1) * limit;
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: {
          amount: {
            gte: parseFloat(minAmount),
            lte: parseFloat(maxAmount)
          }
        },
        skip,
        take: limit,
        orderBy: { amount: 'desc' }
      }),
      prisma.transaction.count({
        where: {
          amount: {
            gte: parseFloat(minAmount),
            lte: parseFloat(maxAmount)
          }
        }
      })
    ]);
    
    logger.info('Transactions by amount retrieved successfully', { 
      minAmount,
      maxAmount,
      count: transactions.length,
      total
    });
    
    return {
      transactions,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    logger.error('Failed to retrieve transactions by amount', { 
      error: error.message,
      stack: error.stack,
      minAmount,
      maxAmount,
      page,
      limit
    });
    throw error;
  }
};

/**
 * Get transactions by category
 * @param {string} category - Transaction category
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Object} Transactions with pagination info
 */
export const getTransactionByCategory = async (category, page = 1, limit = 10) => {
  try {
    logger.info('Retrieving transactions by category', { category, page, limit });
    
    const skip = (page - 1) * limit;
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: { categoryId: category },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { category: true }
      }),
      prisma.transaction.count({
        where: { categoryId: category }
      })
    ]);
    
    logger.info('Transactions by category retrieved successfully', { 
      category,
      count: transactions.length,
      total
    });
    
    return {
      transactions,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    logger.error('Failed to retrieve transactions by category', { 
      error: error.message,
      stack: error.stack,
      category,
      page,
      limit
    });
    throw error;
  }
};

/**
 * Get transactions by user ID
 * @param {number} userId - User ID
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Object} Transactions with pagination info
 */
export const getTransactionByUserId = async (userId, page = 1, limit = 10) => {
  try {
    logger.info('Retrieving transactions by user ID', { userId, page, limit });
    
    const skip = (page - 1) * limit;
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { category: true }
      }),
      prisma.transaction.count({
        where: { userId }
      })
    ]);
    
    logger.info('Transactions by user ID retrieved successfully', { 
      userId,
      count: transactions.length,
      total
    });
    
    return {
      transactions,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    logger.error('Failed to retrieve transactions by user ID', { 
      error: error.message,
      stack: error.stack,
      userId,
      page,
      limit
    });
    throw error;
  }
};

/**
 * Search transactions by keyword
 * @param {string} keyword - Search keyword
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Object} Transactions with pagination info
 */
export const searchTransactions = async (keyword, page = 1, limit = 10) => {
  try {
    logger.info('Searching transactions', { keyword, page, limit });
    
    const skip = (page - 1) * limit;
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: {
          OR: [
            { description: { contains: keyword, mode: 'insensitive' } },
            { notes: { contains: keyword, mode: 'insensitive' } },
            { category: { name: { contains: keyword, mode: 'insensitive' } } }
          ]
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { category: true }
      }),
      prisma.transaction.count({
        where: {
          OR: [
            { description: { contains: keyword, mode: 'insensitive' } },
            { notes: { contains: keyword, mode: 'insensitive' } },
            { category: { name: { contains: keyword, mode: 'insensitive' } } }
          ]
        }
      })
    ]);
    
    logger.info('Transaction search completed', { 
      keyword,
      resultsCount: transactions.length,
      total
    });
    
    return {
      transactions,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    logger.error('Failed to search transactions', { 
      error: error.message,
      stack: error.stack,
      keyword,
      page,
      limit
    });
    throw error;
  }
};

/**
 * Get transaction summary with aggregated data
 * @param {number} userId - User ID
 * @param {string} period - Period (day, week, month, year)
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Object} Transaction summary with aggregated data
 */
export const transactionSummary = async (userId, period, startDate, endDate) => {
  try {
    logger.info('Generating transaction summary', { 
      userId, 
      period,
      startDate,
      endDate
    });
    
    // Default to current month if no dates provided
    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(1));
    const end = endDate ? new Date(endDate) : new Date(new Date().setMonth(new Date().getMonth() + 1, 0));
    
    // Get income, expenses and balance
    const [income, expenses] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          userId,
          type: 'INCOME',
          date: {
            gte: start,
            lte: end
          }
        },
        _sum: { amount: true },
        _count: true
      }),
      prisma.transaction.aggregate({
        where: {
          userId,
          type: 'EXPENSE',
          date: {
            gte: start,
            lte: end
          }
        },
        _sum: { amount: true },
        _count: true
      })
    ]);
    
    // Get transactions by category
    const categoryTransactions = await prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        userId,
        date: {
          gte: start,
          lte: end
        }
      },
      _sum: { amount: true },
      _count: true
    });
    
    // Get category details
    const categoryIds = categoryTransactions.map(ct => ct.categoryId);
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } }
    });
    
    // Format category summary
    const categorySummary = categoryTransactions.map(ct => {
      const category = categories.find(c => c.id === ct.categoryId);
      return {
        categoryId: ct.categoryId,
        categoryName: category?.name || 'Unknown',
        transactionCount: ct._count,
        totalAmount: ct._sum.amount
      };
    });
    
    // Calculate balance
    const totalIncome = income._sum.amount || 0;
    const totalExpenses = expenses._sum.amount || 0;
    const balance = totalIncome - totalExpenses;
    
    const summary = {
      period,
      startDate: start,
      endDate: end,
      income: {
        total: totalIncome,
        count: income._count
      },
      expenses: {
        total: totalExpenses,
        count: expenses._count
      },
      balance,
      categorySummary
    };
    
    logger.info('Transaction summary generated successfully', { 
      userId,
      period,
      incomeCount: income._count,
      expenseCount: expenses._count,
      balance
    });
    
    return summary;
  } catch (error) {
    logger.error('Failed to generate transaction summary', { 
      error: error.message,
      stack: error.stack,
      userId,
      period,
      startDate,
      endDate
    });
    throw error;
  }
};

/**
 * Filter transactions by multiple criteria
 * @param {Object} filters - Filter criteria
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Object} Filtered transactions with pagination info
 */
export const transactionFilter = async (filters, page = 1, limit = 10) => {
  try {
    logger.info('Filtering transactions', { filters, page, limit });
    
    const { 
      userId, 
      type, 
      categoryId, 
      startDate, 
      endDate, 
      minAmount, 
      maxAmount, 
      keyword 
    } = filters;
    
    // Build where clause based on filters
    const where = {};
    
    if (userId) where.userId = userId;
    if (type) where.type = type;
    if (categoryId) where.categoryId = categoryId;
    
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }
    
    if (minAmount || maxAmount) {
      where.amount = {};
      if (minAmount) where.amount.gte = parseFloat(minAmount);
      if (maxAmount) where.amount.lte = parseFloat(maxAmount);
    }
    
    if (keyword) {
      where.OR = [
        { description: { contains: keyword, mode: 'insensitive' } },
        { notes: { contains: keyword, mode: 'insensitive' } }
      ];
    }
    
    const skip = (page - 1) * limit;
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: { category: true }
      }),
      prisma.transaction.count({ where })
    ]);
    
    logger.info('Transactions filtered successfully', { 
      filtersApplied: Object.keys(filters).filter(k => filters[k]),
      resultsCount: transactions.length,
      total
    });
    
    return {
      transactions,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    logger.error('Failed to filter transactions', { 
      error: error.message,
      stack: error.stack,
      filters,
      page,
      limit
    });
    throw error;
  }
};

/**
 * Restore a soft-deleted transaction
 * @param {number} id - Transaction ID
 * @returns {Object} Restored transaction
 */
export const restoreTransaction = async (id) => {
  try {
    logger.info('Restoring transaction', { transactionId: id });
    
    // Check if transaction exists and is deleted
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id },
      select: { deletedAt: true }
    });
    
    if (!existingTransaction) {
      logger.warn('Transaction not found for restoration', { transactionId: id });
      throw new Error('Transaction not found');
    }
    
    if (!existingTransaction.deletedAt) {
      logger.warn('Transaction is not deleted, cannot restore', { transactionId: id });
      throw new Error('Transaction is not deleted');
    }
    
    // Restore transaction
    const transaction = await prisma.transaction.update({
      where: { id },
      data: { deletedAt: null }
    });
    
    logger.info('Transaction restored successfully', { 
      transactionId: transaction.id,
      userId: transaction.userId
    });
    
    return transaction;
  } catch (error) {
    logger.error('Failed to restore transaction', { 
      error: error.message,
      stack: error.stack,
      transactionId: id
    });
    throw error;
  }
};

/**
 * Get transaction types with caching
 * @returns {Object} Transaction types object
 */
export const getTransactionTypesWithCache = async () => {
  const now = Date.now();
  
  // If cache exists and is still valid, return it
  if (transactionTypesCache && lastCacheTime && (now - lastCacheTime < CACHE_DURATION)) {
    return transactionTypesCache;
  }
  
  // Otherwise fetch new data
  const types = await getTransactionTypes();
  
  // Update cache
  transactionTypesCache = types;
  lastCacheTime = now;
  
  return types;
};



/**
 * Get transactions by type with pagination
 * @param {string} type - Transaction type
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @param {string} userId - Optional user ID to filter by
 * @returns {Object} Transactions with pagination info
 */
export const getTransactionsByType = async (type, page = 1, limit = 10, userId = null) => {
  try {
    logger.info('Retrieving transactions by type', { type, page, limit, userId });
    
    // Validate transaction type
    const validTypes = await getTransactionTypesWithCache();
    if (!validTypes[type]) {
      throw new Error(`Invalid transaction type: ${type}`);
    }
    
    const skip = (page - 1) * limit;
    
    // Build where clause
    const where = { 
      type,
      isDeleted: false
    };
    
    // Add userId filter if provided
    if (userId) {
      where.userId = userId;
    }
    
    // Execute query with pagination
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: {
          categories: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        }
      }),
      prisma.transaction.count({ where })
    ]);
    
    logger.info('Transactions by type retrieved successfully', { 
      type,
      count: transactions.length,
      total
    });
    
    return {
      transactions,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    logger.error('Failed to retrieve transactions by type', { 
      error: error.message,
      stack: error.stack,
      type
    });
    throw error;
  }
};

// Named exports for specific transaction types
export const transactionIncome = (page = 1, limit = 10, userId = null) => 
  getTransactionsByType('INCOME', page, limit, userId);

export const transactionExpense = (page = 1, limit = 10, userId = null) => 
  getTransactionsByType('EXPENSE', page, limit, userId);

export const transactionSavings = (page = 1, limit = 10, userId = null) => 
  getTransactionsByType('TRANSFER', page, limit, userId);

export const transactionInvestment = (page = 1, limit = 10, userId = null) => 
  getTransactionsByType('INVESTMENT', page, limit, userId);

// For backward compatibility, keep the old function names
/* 
export const transactionIncome = getTransactionsByType;
export const transactionExpense = getTransactionsByType;
export const transactionSavings = getTransactionsByType;
export const transactionInvestment = getTransactionsByType; 
*/