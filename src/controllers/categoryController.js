import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  softDeleteCategory,
  hardDeleteCategory,
  restoreCategory
} from '../services/categoryService.js';
import { validateRequest } from '../utils/requestValidator.js';

/**
 * Get all categories with pagination
 */
export const getAllCategoriesController = async (req, res, next) => {
  try {
    const { page, limit, type, search, includeDeleted } = req.query;
    
    const options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      type: type || null,
      searchTerm: search || '',
      includeDeleted: includeDeleted === 'true'
    };

    const result = await getAllCategories(options);

    return res.status(200).json({
      error: false,
      message: 'Categories retrieved successfully',
      data: result.categories,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get category by ID
 */
export const getCategoryByIdController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await getCategoryById(id);

    return res.status(200).json({
      error: false,
      message: 'Category retrieved successfully',
      data: category
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new category
 */
export const createCategoryController = async (req, res, next) => {
  try {
    // Validate request body
    const { error, value } = validateRequest(req.body, {
      name: { type: 'string', required: true },
      type: { type: 'string', required: true },
      description: { type: 'string' }
    });

    if (error) {
      return res.status(400).json({
        error: true,
        message: 'Invalid request data',
        details: error
      });
    }

    const category = await createCategory(value);

    return res.status(201).json({
      error: false,
      message: 'Category created successfully',
      data: category
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing category
 */
export const updateCategoryController = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Validate request body
    const { error, value } = validateRequest(req.body, {
      name: { type: 'string' },
      type: { type: 'string' },
      description: { type: 'string' }
    });

    if (error) {
      return res.status(400).json({
        error: true,
        message: 'Invalid request data',
        details: error
      });
    }

    // At least one field must be provided for update
    if (Object.keys(value).length === 0) {
      return res.status(400).json({
        error: true,
        message: 'At least one field must be provided for update'
      });
    }

    const updatedCategory = await updateCategory(id, value);

    return res.status(200).json({
      error: false,
      message: 'Category updated successfully',
      data: updatedCategory
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a category (soft delete)
 */
export const deleteCategoryController = async (req, res, next) => {
  try {
    const { id } = req.params;
    await softDeleteCategory(id);

    return res.status(200).json({
      error: false,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Hard delete a category (admin only)
 */
export const hardDeleteCategoryController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await hardDeleteCategory(id);

    return res.status(200).json({
      error: false,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Restore a soft-deleted category
 */
export const restoreCategoryController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const restoredCategory = await restoreCategory(id);

    return res.status(200).json({
      error: false,
      message: 'Category restored successfully',
      data: restoredCategory
    });
  } catch (error) {
    next(error);
  }
};