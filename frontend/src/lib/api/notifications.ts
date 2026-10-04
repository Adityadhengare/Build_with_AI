import { NotificationItem } from '@/types/application';
import { apiClient } from './client';

export const notificationsApi = {
  async getNotifications(): Promise<NotificationItem[]> {
    return await apiClient<NotificationItem[]>('/notifications');
  },

  async markAsRead(id: string): Promise<boolean> {
    await apiClient(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
    return true;
  },

  async markAllAsRead(): Promise<boolean> {
    await apiClient('/notifications/read-all', {
      method: 'PATCH',
    });
    return true;
  },
};
