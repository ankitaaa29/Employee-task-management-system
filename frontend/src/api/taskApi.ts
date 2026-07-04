import client from './client';

export interface TaskQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  priority?: string;
  status?: string;
  assigned_to?: string;
  sortField?: string;
  sortOrder?: string;
}

export const taskApi = {
  getTasks: async (params?: TaskQueryParams) => {
    const response = await client.get('/tasks', { params });
    return response.data;
  },

  getTaskById: async (id: number | string) => {
    const response = await client.get(`/tasks/${id}`);
    return response.data;
  },

  createTask: async (formData: FormData) => {
    const response = await client.post('/tasks', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateTask: async (id: number | string, formData: FormData | any) => {
    const headers = formData instanceof FormData 
      ? { 'Content-Type': 'multipart/form-data' } 
      : { 'Content-Type': 'application/json' };
      
    const response = await client.put(`/tasks/${id}`, formData, { headers });
    return response.data;
  },

  deleteTask: async (id: number | string) => {
    const response = await client.delete(`/tasks/${id}`);
    return response.data;
  },

  getDashboardStats: async () => {
    const response = await client.get('/tasks/dashboard');
    return response.data;
  }
};
