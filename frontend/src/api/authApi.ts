import client from './client';

export const authApi = {
  login: async (credentials: any) => {
    const response = await client.post('/auth/login', credentials);
    return response.data;
  },
  
  register: async (userData: any) => {
    const response = await client.post('/auth/register', userData);
    return response.data;
  },

  logout: async () => {
    const response = await client.post('/auth/logout');
    return response.data;
  },

  getProfile: async () => {
    const response = await client.get('/auth/profile');
    return response.data;
  }
};
