import { NotificationItem } from '@/types/application';
import { MOCK_NOTIFICATIONS } from '@/lib/mock/notifications';

export const notificationsApi = {
  async getNotifications(): Promise<NotificationItem[]> {
    // Simulates TRD GET /api/notifications
    await new Promise((resolve) => setTimeout(resolve, 80));
    return [...MOCK_NOTIFICATIONS];
  },

  async markAsRead(id: string): Promise<boolean> {
    // Simulates TRD PATCH /api/notifications/:id/read
    await new Promise((resolve) => setTimeout(resolve, 50));
    const item = MOCK_NOTIFICATIONS.find((n) => n.id === id);
    if (item) item.isRead = true;
    return true;
  },

  async markAllAsRead(): Promise<boolean> {
    // Simulates TRD PATCH /api/notifications/read-all
    await new Promise((resolve) => setTimeout(resolve, 50));
    MOCK_NOTIFICATIONS.forEach((n) => (n.isRead = true));
    return true;
  }
};
