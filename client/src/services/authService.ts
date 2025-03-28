import api from './api';

const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    return user;
  },

  logout: () => {
    localStorage.removeItem('token');
  },

  register: async (email: string, password: string) => {
    const response = await api.post('/auth/register', { email, password });
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    return user;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export default authService;
