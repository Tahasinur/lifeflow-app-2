import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { webSocketNotificationService, WebSocketNotification } from '../services/webSocketNotificationService';
import { toast } from 'sonner';

interface NotificationBadgeProps {
  userId: string;
  className?: string;
}

export function NotificationBadge({ userId, className = '' }: NotificationBadgeProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<WebSocketNotification[]>([]);

  useEffect(() => {
    // Get initial unread count
    getUnreadCount();

    // Listen for notifications
    const unsubscribeNotification = webSocketNotificationService.onNotification((notification) => {
      // Add to notifications list
      setNotifications((prev) => [notification, ...prev].slice(0, 10)); // Keep last 10

      // Increment unread count
      setUnreadCount((prev) => prev + 1);

      // Show toast for follow notifications
      if (notification.type === 'FOLLOW' && notification.followerName) {
        toast.info(`${notification.followerName} followed you!`);
      }
    });

    return () => {
      unsubscribeNotification();
    };
  }, []);

  const getUnreadCount = async () => {
    try {
      const count = await webSocketNotificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error getting unread count:', error);
    }
  };

  const markAsRead = () => {
    setUnreadCount(0);
    setNotifications([]);
  };

  const clearNotification = (index: number) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'FOLLOW':
        return '👤';
      case 'UNFOLLOW':
        return '👋';
      case 'USER_STATUS':
        return '🟢';
      default:
        return '📢';
    }
  };

  const getNotificationMessage = (notification: WebSocketNotification) => {
    switch (notification.type) {
      case 'FOLLOW':
        return `${notification.followerName} followed you`;
      case 'UNFOLLOW':
        return `${notification.followerName} unfollowed you`;
      case 'USER_STATUS':
        return `${notification.userId} is now ${notification.status}`;
      default:
        return 'New notification';
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    return date.toLocaleDateString();
  };

  return (
    <div className={`relative ${className}`}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2F2F2F] transition-colors"
        title="Notifications"
      >
        <Bell size={20} className="text-[#37352F] dark:text-[#E3E3E3]" />

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-80 max-h-96 bg-white dark:bg-[#202020] border border-gray-200 dark:border-[#2F2F2F] rounded-lg shadow-lg overflow-hidden flex flex-col z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-[#2F2F2F] bg-gray-50 dark:bg-[#191919]">
            <h3 className="text-sm font-semibold text-[#37352F] dark:text-[#FFFFFF]">
              Notifications
            </h3>
            <button
              onClick={() => {
                setIsOpen(false);
                markAsRead();
              }}
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            >
              Mark all as read
            </button>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {notifications.length > 0 ? (
              notifications.map((notification, index) => (
                <div
                  key={index}
                  className="px-4 py-3 border-b border-gray-100 dark:border-[#2F2F2F] hover:bg-gray-50 dark:hover:bg-[#2F2F2F] transition-colors flex items-start gap-3 group"
                >
                  {/* Icon */}
                  <div className="text-xl flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#37352F] dark:text-[#E3E3E3]">
                      {getNotificationMessage(notification)}
                    </p>
                    <p className="text-xs text-[#9B9A97] mt-1">
                      {formatTime(notification.timestamp)}
                    </p>
                  </div>

                  {/* Close Button */}
                  <button
                    onClick={() => clearNotification(index)}
                    className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600 dark:hover:text-red-400"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                <p className="text-sm">No notifications yet</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-gray-200 dark:border-[#2F2F2F] px-4 py-2 bg-gray-50 dark:bg-[#191919] text-center">
              <button
                onClick={() => {
                  setNotifications([]);
                  setIsOpen(false);
                }}
                className="text-xs text-[#9B9A97] hover:text-[#37352F] dark:hover:text-[#E3E3E3] font-medium"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
