import client from './client';

export const reportApi = {
  getCompletedReport: async () => {
    const response = await client.get('/reports/completed');
    return response.data;
  },

  getPendingReport: async () => {
    const response = await client.get('/reports/pending');
    return response.data;
  },

  getEmployeeWiseReport: async () => {
    const response = await client.get('/reports/employee-wise');
    return response.data;
  },

  exportCSV: async (type: 'completed' | 'pending' | 'employee-wise') => {
    const response = await client.get(`/reports/export/csv`, {
      params: { type },
      responseType: 'blob'
    });
    return response.data; // Blob
  },

  exportExcel: async (type: 'completed' | 'pending' | 'employee-wise') => {
    const response = await client.get(`/reports/export/excel`, {
      params: { type },
      responseType: 'blob'
    });
    return response.data; // Blob
  }
};
