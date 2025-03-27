import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const auth = {
  login: async (email, password) => {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    return response.data;
  },
  register: async (username, email, password) => {
    const response = await axios.post(`${API_URL}/auth/register`, { username, email, password });
    return response.data;
  },
  logout: async () => {
    const response = await axios.post(`${API_URL}/auth/logout`);
    return response.data;
  },
  getProfile: async () => {
    const response = await axios.get(`${API_URL}/auth/profile`);
    return response.data;
  },
  resetPassword: async (email) => {
    const response = await axios.post(`${API_URL}/auth/reset-password`, { email });
    return response.data;
  }
};

export { auth };
