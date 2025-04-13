export const roles = {
  ADMIN: 'admin',
  USER: 'user',
  GUEST: 'guest',
};

export const permissions = {
  admin: ['create', 'read', 'update', 'delete'],
  user: ['read', 'update'],
  guest: ['read'],
};
