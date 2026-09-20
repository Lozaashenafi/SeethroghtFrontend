import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserAuth } from '@/context/UserAuthContext';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from '@/services/notifications.service';

export function useNotifications(params: { page?: number; limit?: number } = {}) {
  const { isAuthenticated } = useUserAuth();
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: () => getNotifications(params),
    // Only fetch for logged-in users — the endpoints require auth and
    // polling them while logged out just spams 401/404s.
    enabled: isAuthenticated,
  });
}

export function useUnreadCount() {
  const { isAuthenticated } = useUserAuth();
  return useQuery({
    queryKey: ['notifications-unread'],
    queryFn: getUnreadCount,
    refetchInterval: 30000,
    // Only poll while logged in; automatically stops when the user logs out
    // and resumes when they log back in.
    enabled: isAuthenticated,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
    },
  });
}
