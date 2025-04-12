import express from 'express';
import { 
  getDashboardStats,
  manageUsers,
  getUserDetails,
  createUser,
  updateUser,
  softDeleteUser,
  hardDeleteUser,
  setUserActiveStatus,
  getRolesAndPermissions,
  createRole,
  createPermission,
  updateRolePermissions,
  getAuditLogs
} from '../controllers/adminController.js';
import { authenticate, authorize, hasPermissions } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication to all admin routes
router.use(authenticate);

// Allow only users with ADMIN role
router.use(authorize(['ADMIN']));

// Dashboard
router.get('/dashboard', getDashboardStats);

// User management
router.get('/users', manageUsers);
router.get('/users/:userId', getUserDetails);
router.post('/users', hasPermissions(['create:users']), createUser);
router.put('/users/:userId', hasPermissions(['update:users']), updateUser);
router.patch('/users/:userId/status', hasPermissions(['update:users']), setUserActiveStatus);
router.delete('/users/:userId/soft', hasPermissions(['delete:users']), softDeleteUser);
router.delete('/users/:userId', hasPermissions(['delete:users:permanent']), hardDeleteUser);

// Role & Permission management
router.get('/roles', getRolesAndPermissions);
router.post('/roles', hasPermissions(['create:roles']), createRole);
router.post('/permissions', hasPermissions(['create:permissions']), createPermission);
router.put('/roles/:roleId/permissions', hasPermissions(['update:roles']), updateRolePermissions);

// Audit logs
router.get('/audit-logs', hasPermissions(['view:audit-logs']), getAuditLogs);

export default router;