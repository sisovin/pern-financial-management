import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const reports = {
  generateCSVReport: async () => {
    const response = await axios.get(`${API_URL}/reports/csv`, {
      responseType: 'blob',
    });
    return response.data;
  },
  generatePDFReport: async () => {
    const response = await axios.get(`${API_URL}/reports/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

export { reports };
