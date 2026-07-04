import client from './client';

export interface EmployeeQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortField?: string;
  sortOrder?: string;
  all?: boolean;
}

export const employeeApi = {
  getEmployees: async (params?: EmployeeQueryParams) => {
    const response = await client.get('/employees', { params });
    return response.data;
  },

  createEmployee: async (employeeData: any) => {
    const response = await client.post('/employees', employeeData);
    return response.data;
  },

  updateEmployee: async (id: number | string, employeeData: any) => {
    const response = await client.put(`/employees/${id}`, employeeData);
    return response.data;
  },

  deleteEmployee: async (id: number | string) => {
    const response = await client.delete(`/employees/${id}`);
    return response.data;
  }
};
