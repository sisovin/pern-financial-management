const API_BASE_URL = 'https://api.example.com';

const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    ME: `${API_BASE_URL}/auth/me`,
  },
  TRANSACTIONS: {
    BASE: `${API_BASE_URL}/transactions`,
    GET: (id: string) => `${API_BASE_URL}/transactions/${id}`,
    CREATE: `${API_BASE_URL}/transactions`,
    UPDATE: (id: string) => `${API_BASE_URL}/transactions/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/transactions/${id}`,
  },
  GOALS: {
    BASE: `${API_BASE_URL}/goals`,
    GET: (id: string) => `${API_BASE_URL}/goals/${id}`,
    CREATE: `${API_BASE_URL}/goals`,
    UPDATE: (id: string) => `${API_BASE_URL}/goals/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/goals/${id}`,
  },
  REPORTS: {
    BASE: `${API_BASE_URL}/reports`,
    GENERATE: `${API_BASE_URL}/reports/generate`,
    GET: (id: string) => `${API_BASE_URL}/reports/${id}`,
    SAVE: `${API_BASE_URL}/reports/save`,
    DELETE: (id: string) => `${API_BASE_URL}/reports/${id}`,
  },
  USERS: {
    BASE: `${API_BASE_URL}/users`,
    GET: (id: string) => `${API_BASE_URL}/users/${id}`,
    CREATE: `${API_BASE_URL}/users`,
    UPDATE: (id: string) => `${API_BASE_URL}/users/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/users/${id}`,
  },
};

export default API_ENDPOINTS;
