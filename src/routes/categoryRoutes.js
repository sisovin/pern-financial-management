import express from 'express';
import {
  authenticate
} from "../middleware/authMiddleware.js";
import { checkRole } from "../middleware/roleMiddleware.js";
import {
  getAllCategoriesController,
  getCategoryByIdController,
  createCategoryController,
  updateCategoryController,
  deleteCategoryController,
  hardDeleteCategoryController,
  restoreCategoryController
} from '../controllers/categoryController.js';

const router = express.Router();

// Apply authentication middleware to all category routes
router.use(authenticate);

// Basic CRUD operations
router.get('/', getAllCategoriesController);
router.get('/:id', getCategoryByIdController);
router.post('/', createCategoryController);
router.put('/:id', updateCategoryController);
router.delete('/:id', deleteCategoryController);

// Admin-only operations
router.delete('/:id/hard', checkRole(['ADMIN']), hardDeleteCategoryController);
router.post('/:id/restore', checkRole(['ADMIN']), restoreCategoryController);

export default router;