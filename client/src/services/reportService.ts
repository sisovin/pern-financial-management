import api from './api';

export const generateReport = async () => {
  try {
    const response = await api.get('/reports/generate');
    return response.data;
  } catch (error) {
    console.error('Error generating report:', error);
    throw error;
  }
};

export const fetchReportData = async (reportId) => {
  try {
    const response = await api.get(`/reports/${reportId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching report data:', error);
    throw error;
  }
};

export const saveReport = async (reportData) => {
  try {
    const response = await api.post('/reports/save', reportData);
    return response.data;
  } catch (error) {
    console.error('Error saving report:', error);
    throw error;
  }
};

export const deleteReport = async (reportId) => {
  try {
    const response = await api.delete(`/reports/${reportId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting report:', error);
    throw error;
  }
};
