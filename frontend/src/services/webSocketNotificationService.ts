import SockJS from 'sockjs-client';
import { Client, IFrame, Message, messageCallbackType, errCallbackType } from '@stomp/stompjs';

export interface WebSocketNotification {
  type: string;
  followerId?: string;
  followerName?: string;
  followerAvatar?: string;
  followingId?: string;
  timestamp: number;
  [key: string]: any;
}

export interface NotificationSubscription {
  unsubscribe: () => void;
}

class WebSocketNotificationService {
  private client: Client | null = null;
  private wsUrl = 'http://localhost:8080/ws';
  private connectionPromise: Promise<void> | null = null;
  private notificationCallbacks: Set<(notification: WebSocketNotification) => void> = new Set();
  private statusCallbacks: Set<(status: 'connected' | 'disconnected' | 'error') => void> = new Set();
  private userId: string | null = null;

  /**
   * Initialize WebSocket connection
   */
  async connect(userId: string): Promise<void> {
    if (this.client?.connected) {
      console.log('WebSocket already connected');
      return;
    }

    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        this.userId = userId;
        this.client = new Client({
          webSocketFactory: () => new SockJS(this.wsUrl),
          connectHeaders: {
            login: userId,
          },
          onConnect: (frame: IFrame) => {
            console.log('WebSocket connected:', frame);
            this.notifyStatusChange('connected');
            this.subscribeToNotifications();
            this.subscribeToUserStatus();
            resolve();
          },
          onStompError: (frame: IFrame) => {
            console.error('WebSocket error:', frame);
            this.notifyStatusChange('error');
            reject(new Error('WebSocket connection error'));
          },
          onDisconnect: (frame: IFrame) => {
            console.log('WebSocket disconnected:', frame);
            this.notifyStatusChange('disconnected');
          },
          reconnectDelay: 5000,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
        });

        this.client.activate();
      } catch (error) {
        console.error('Error initializing WebSocket:', error);
        this.notifyStatusChange('error');
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  /**
   * Disconnect WebSocket
   */
  disconnect(): void {
    if (this.client?.connected) {
      this.client.deactivate();
      console.log('WebSocket disconnected');
      this.connectionPromise = null;
    }
  }

  /**
   * Subscribe to user notifications
   */
  private subscribeToNotifications(): NotificationSubscription {
    if (!this.client?.connected || !this.userId) {
      console.warn('WebSocket not connected');
      return { unsubscribe: () => {} };
    }

    const subscription = this.client.subscribe(
      `/user/${this.userId}/queue/notifications`,
      (message: Message) => {
        try {
          const notification = JSON.parse(message.body) as WebSocketNotification;
          console.log('Notification received:', notification);
          this.notifyNotification(notification);
        } catch (error) {
          console.error('Error parsing notification:', error);
        }
      }
    );

    return {
      unsubscribe: () => subscription.unsubscribe(),
    };
  }

  /**
   * Subscribe to user status updates
   */
  private subscribeToUserStatus(): NotificationSubscription {
    if (!this.client?.connected) {
      console.warn('WebSocket not connected');
      return { unsubscribe: () => {} };
    }

    const subscription = this.client.subscribe('/topic/users/status', (message: Message) => {
      try {
        const status = JSON.parse(message.body);
        console.log('User status update:', status);
        this.notifyNotification({
          type: 'USER_STATUS',
          ...status,
          timestamp: Date.now(),
        });
      } catch (error) {
        console.error('Error parsing status update:', error);
      }
    });

    return {
      unsubscribe: () => subscription.unsubscribe(),
    };
  }

  /**
   * Subscribe to follow events
   */
  subscribeToFollowEvents(): NotificationSubscription {
    if (!this.client?.connected) {
      console.warn('WebSocket not connected');
      return { unsubscribe: () => {} };
    }

    const subscription = this.client.subscribe('/topic/social/follows', (message: Message) => {
      try {
        const followEvent = JSON.parse(message.body) as WebSocketNotification;
        console.log('Follow event received:', followEvent);
        this.notifyNotification(followEvent);
      } catch (error) {
        console.error('Error parsing follow event:', error);
      }
    });

    return {
      unsubscribe: () => subscription.unsubscribe(),
    };
  }

  /**
   * Subscribe to unfollow events
   */
  subscribeToUnfollowEvents(): NotificationSubscription {
    if (!this.client?.connected) {
      console.warn('WebSocket not connected');
      return { unsubscribe: () => {} };
    }

    const subscription = this.client.subscribe(
      '/topic/social/unfollows',
      (message: Message) => {
        try {
          const unfollowEvent = JSON.parse(message.body) as WebSocketNotification;
          console.log('Unfollow event received:', unfollowEvent);
          this.notifyNotification(unfollowEvent);
        } catch (error) {
          console.error('Error parsing unfollow event:', error);
        }
      }
    );

    return {
      unsubscribe: () => subscription.unsubscribe(),
    };
  }

  /**
   * Publish follow event
   */
  publishFollowEvent(followingId: string, followerName: string, followerAvatar?: string): void {
    if (!this.client?.connected) {
      console.warn('WebSocket not connected');
      return;
    }

    try {
      this.client.publish({
        destination: '/app/follow',
        body: JSON.stringify({
          followingId,
          followerName,
          followerAvatar,
        }),
      });
      console.log('Follow event published');
    } catch (error) {
      console.error('Error publishing follow event:', error);
    }
  }

  /**
   * Publish unfollow event
   */
  publishUnfollowEvent(followingId: string, followerName: string): void {
    if (!this.client?.connected) {
      console.warn('WebSocket not connected');
      return;
    }

    try {
      this.client.publish({
        destination: '/app/unfollow',
        body: JSON.stringify({
          followingId,
          followerName,
        }),
      });
      console.log('Unfollow event published');
    } catch (error) {
      console.error('Error publishing unfollow event:', error);
    }
  }

  /**
   * Get unread notification count
   */
  getUnreadCount(): Promise<number> {
    return new Promise((resolve, reject) => {
      if (!this.client?.connected) {
        reject(new Error('WebSocket not connected'));
        return;
      }

      try {
        const subscription = this.client.subscribe(
          `/user/${this.userId}/queue/unread`,
          (message: Message) => {
            try {
              const data = JSON.parse(message.body);
              subscription.unsubscribe();
              resolve(data.unreadCount || 0);
            } catch (error) {
              subscription.unsubscribe();
              reject(error);
            }
          }
        );

        this.client.publish({
          destination: '/app/notifications/unread',
          body: '{}',
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Register callback for notifications
   */
  onNotification(callback: (notification: WebSocketNotification) => void): () => void {
    this.notificationCallbacks.add(callback);

    // Return unsubscribe function
    return () => {
      this.notificationCallbacks.delete(callback);
    };
  }

  /**
   * Register callback for connection status changes
   */
  onStatusChange(callback: (status: 'connected' | 'disconnected' | 'error') => void): () => void {
    this.statusCallbacks.add(callback);

    // Return unsubscribe function
    return () => {
      this.statusCallbacks.delete(callback);
    };
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.client?.connected || false;
  }

  /**
   * Notify all registered notification callbacks
   */
  private notifyNotification(notification: WebSocketNotification): void {
    this.notificationCallbacks.forEach((callback) => {
      try {
        callback(notification);
      } catch (error) {
        console.error('Error in notification callback:', error);
      }
    });
  }

  /**
   * Notify all registered status change callbacks
   */
  private notifyStatusChange(status: 'connected' | 'disconnected' | 'error'): void {
    this.statusCallbacks.forEach((callback) => {
      try {
        callback(status);
      } catch (error) {
        console.error('Error in status change callback:', error);
      }
    });
  }
}

// Export singleton instance
export const webSocketNotificationService = new WebSocketNotificationService();
