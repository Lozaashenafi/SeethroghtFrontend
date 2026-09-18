import { apiClient } from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';
import type { ApiResponse, Notification, Pagination } from '@/types';

interface ListNotificationsResponse {
  notifications: Notification[];
  pagination: Pagination;
}

export async function getNotifications(
  params: { page?: number; limit?: number } = {},
): Promise<ListNotificationsResponse> {
  const { data } = await apiClient.get<ApiResponse<ListNotificationsResponse>>(
    API_ENDPOINTS.NOTIFICATIONS,
    { params },
  );
  return data.data ?? { notifications: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } };
}

export async function getUnreadCount(): Promise<number> {
  const { data } = await apiClient.get<ApiResponse<{ total: number }>>(
    `${API_ENDPOINTS.NOTIFICATIONS}/unread-count`,
  );
  return data.data?.total ?? 0;
}

export async function markAsRead(id: number): Promise<void> {
  await apiClient.patch(`${API_ENDPOINTS.NOTIFICATIONS}/${id}/read`);
}

export async function markAllAsRead(): Promise<void> {
  await apiClient.patch(`${API_ENDPOINTS.NOTIFICATIONS}/read-all`);
}
