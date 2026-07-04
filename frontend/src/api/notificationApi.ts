import client from './client';

export const notificationApi = {
  getNotifications: async () => {
    const response = await client.get('/notifications');
    return response.data;
  },

  markAsRead: async (id: number | string) => {
    const response = await client.put(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await client.put('/notifications/read-all');
    return response.data;
  }
};
