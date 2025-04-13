type Role = 'admin' | 'user' | 'guest';

interface User {
  id: string;
  role: Role;
}

const permissions = {
  admin: ['create', 'read', 'update', 'delete'],
  user: ['read', 'update'],
  guest: ['read'],
};

export const canPerformAction = (user: User, action: string): boolean => {
  const userPermissions = permissions[user.role];
  return userPermissions.includes(action);
};
