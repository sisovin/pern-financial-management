import { PrismaClient } from '@prisma/client';
import { NotFoundError, BadRequestError, ConflictError } from '../utils/errors.js';

const prisma = new PrismaClient();

/**
 * Get all available transaction types from the database
 * @returns {Object} Object with transaction types as keys and values
 */
export const getTransactionTypes = async () => {
  try {
    logger.info('Retrieving all transaction types');
    
    // Query distinct transaction types from the category table
    const types = await prisma.$queryRaw`
      SELECT DISTINCT "type" FROM "categories"
    `;
    
    // Convert the array of types to an object for easier usage
    const typeObject = {};
    types.forEach(typeRow => {
      const type = typeRow.type;
      typeObject[type] = type;
    });
    
    logger.info('Transaction types retrieved successfully', { types: Object.keys(typeObject) });
    
    return typeObject;
  } catch (error) {
    logger.error('Failed to retrieve transaction types', { 
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
};

/**
 * Get standard transaction type constants
 * Returns a dictionary of transaction types from the Prisma schema
 * @returns {Object} Transaction type constants
 */
export const getStandardTransactionTypes = () => {
  return {
    INCOME: 'INCOME',
    EXPENSE: 'EXPENSE',
    TRANSFER: 'TRANSFER',
    INVESTMENT: 'INVESTMENT'
  };
};

/**
 * Get all categories with pagination
 */
export const getAllCategories = async (options = {}) => {
  const {
    page = 1,
    limit = 10,
    includeDeleted = false,
    type = null,
    searchTerm = ''
  } = options;

  const skip = (page - 1) * limit;

  // Build filter conditions
  const whereConditions = {
    ...(includeDeleted ? {} : { isDeleted: false }),
    ...(type ? { type } : {}),
    ...(searchTerm ? {
      OR: [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
      ]
    } : {})
  };

  // Execute query with pagination
  const [categories, totalCount] = await Promise.all([
    prisma.category.findMany({
      where: whereConditions,
      skip,
      take: limit,
      orderBy: { name: 'asc' }
    }),
    prisma.category.count({ where: whereConditions })
  ]);

  // Calculate pagination data
  const totalPages = Math.ceil(totalCount / limit);

  return {
    categories,
    pagination: {
      total: totalCount,
      page: Number(page),
      limit: Number(limit),
      pages: totalPages
    }
  };
};

/**
 * Get category by ID
 */
export const getCategoryById = async (id) => {
  const category = await prisma.category.findUnique({
    where: { id }
  });

  if (!category) {
    throw new NotFoundError('Category not found');
  }

  if (category.isDeleted) {
    throw new NotFoundError('Category has been deleted');
  }

  return category;
};

/**
 * Create a new category
 */
export const createCategory = async (categoryData) => {
  const { name, type, description } = categoryData;

  // Check if category with same name and type already exists
  const existingCategory = await prisma.category.findFirst({
    where: {
      name,
      type,
      isDeleted: false
    }
  });

  if (existingCategory) {
    throw new ConflictError(`Category with name '${name}' and type '${type}' already exists`);
  }

  // Create new category
  const category = await prisma.category.create({
    data: {
      name,
      type,
      description
    }
  });

  return category;
};

/**
 * Update an existing category
 */
export const updateCategory = async (id, categoryData) => {
  const { name, type, description } = categoryData;

  // Check if category exists
  const existingCategory = await prisma.category.findUnique({
    where: { id }
  });

  if (!existingCategory) {
    throw new NotFoundError('Category not found');
  }

  if (existingCategory.isDeleted) {
    throw new NotFoundError('Cannot update a deleted category');
  }

  // If name or type is changing, check for conflicts
  if ((name && name !== existingCategory.name) || (type && type !== existingCategory.type)) {
    const conflictingCategory = await prisma.category.findFirst({
      where: {
        name: name || existingCategory.name,
        type: type || existingCategory.type,
        isDeleted: false,
        id: { not: id }
      }
    });

    if (conflictingCategory) {
      throw new ConflictError(`Category with name '${name || existingCategory.name}' and type '${type || existingCategory.type}' already exists`);
    }
  }

  // Update category
  const updatedCategory = await prisma.category.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(type && { type }),
      ...(description !== undefined && { description })
    }
  });

  return updatedCategory;
};

/**
 * Soft delete a category
 */
export const softDeleteCategory = async (id) => {
  // Check if category exists
  const category = await prisma.category.findUnique({
    where: { id },
    include: { transactions: { select: { id: true } } }
  });

  if (!category) {
    throw new NotFoundError('Category not found');
  }

  if (category.isDeleted) {
    throw new BadRequestError('Category is already deleted');
  }

  // Check if category is used in transactions
  if (category.transactions.length > 0) {
    // We soft delete to maintain data integrity
    return await prisma.category.update({
      where: { id },
      data: { isDeleted: true }
    });
  }

  // If no transactions use this category, we can optionally hard delete it
  return await prisma.category.update({
    where: { id },
    data: { isDeleted: true }
  });
};

/**
 * Hard delete a category (admin only)
 * Note: This should be used with caution
 */
export const hardDeleteCategory = async (id) => {
  const category = await prisma.category.findUnique({
    where: { id },
    include: { transactions: { select: { id: true } } }
  });

  if (!category) {
    throw new NotFoundError('Category not found');
  }

  // Block deletion if category is used in transactions
  if (category.transactions.length > 0) {
    throw new BadRequestError('Cannot delete category that is used in transactions. Use soft delete instead.');
  }

  // Proceed with hard delete if no transactions use this category
  await prisma.category.delete({
    where: { id }
  });

  return { success: true, message: 'Category permanently deleted' };
};

/**
 * Restore a soft-deleted category
 */
export const restoreCategory = async (id) => {
  const category = await prisma.category.findUnique({
    where: { id }
  });

  if (!category) {
    throw new NotFoundError('Category not found');
  }

  if (!category.isDeleted) {
    throw new BadRequestError('Category is not deleted');
  }

  // Check for name/type conflicts before restoring
  const conflictingCategory = await prisma.category.findFirst({
    where: {
      name: category.name,
      type: category.type,
      isDeleted: false,
      id: { not: id }
    }
  });

  if (conflictingCategory) {
    throw new ConflictError(
      `Cannot restore category: A category with name '${category.name}' and type '${category.type}' already exists`
    );
  }

  // Restore the category
  return await prisma.category.update({
    where: { id },
    data: { isDeleted: false }
  });
};