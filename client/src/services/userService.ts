import api from './api';

const userService = {
  getUsers: async () => {
    return await api.get('/users');
  },
  getUserById: async (id: string) => {
    return await api.get(`/users/${id}`);
  },
  createUser: async (userData: any) => {
    return await api.post('/users', userData);
  },
  updateUser: async (id: string, userData: any) => {
    return await api.put(`/users/${id}`, userData);
  },
  deleteUser: async (id: string) => {
    return await api.delete(`/users/${id}`);
  },
};

export default userService;
