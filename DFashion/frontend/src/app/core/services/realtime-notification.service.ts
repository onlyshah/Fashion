import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';

export interface RealtimeNotification {
  _id: string;
  recipient: string;
  sender?: {
    _id: string;
    fullName: string;
    username: string;
    avatar?: string;
  };
  type: string;
  title: string;
  message: string;
  data: any;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  timeAgo: string;
  relatedEntity?: {
    entityType: string;
    entityId: string;
  };
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
  sms: boolean;
  categories: {
    order: boolean;
    payment: boolean;
    social: boolean;
    marketing: boolean;
    system: boolean;
    security: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class RealtimeNotificationService {
  private socket: Socket | null = null;
  private connected = false;

  // Observables
  private notificationsSubject = new BehaviorSubject<RealtimeNotification[]>([]);
  private unreadCountSubject = new BehaviorSubject<number>(0);
  private connectionStatusSubject = new BehaviorSubject<boolean>(false);
  private onlineUsersSubject = new BehaviorSubject<string[]>([]);

  public notifications$ = this.notificationsSubject.asObservable();
  public unreadCount$ = this.unreadCountSubject.asObservable();
  public connectionStatus$ = this.connectionStatusSubject.asObservable();
  public onlineUsers$ = this.onlineUsersSubject.asObservable();

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService
  ) {
    // Auto-connect when user is authenticated
    this.authService.isAuthenticated$.subscribe(isAuth => {
      if (isAuth && !this.connected) {
        this.connect();
      } else if (!isAuth && this.connected) {
        this.disconnect();
      }
    });
  }

  connect(): void {
    const token = this.authService.getToken();
    if (!token) {
      console.warn('No auth token available for socket connection');
      return;
    }

    this.socket = io('http://10.0.2.2:5000', { // Direct IP for testing
      auth: {
        token: token
      },
      transports: ['websocket', 'polling']
    });

    this.setupEventListeners();
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      this.connectionStatusSubject.next(false);
    }
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('✅ Connected to notification server');
      this.connected = true;
      this.connectionStatusSubject.next(true);
      this.loadInitialNotifications();
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from notification server');
      this.connected = false;
      this.connectionStatusSubject.next(false);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.connected = false;
      this.connectionStatusSubject.next(false);
    });

    // Notification events
    this.socket.on('notification', (notification: RealtimeNotification) => {
      console.log('📨 New notification received:', notification);
      this.addNotification(notification);
      this.showToastNotification(notification);
    });

    this.socket.on('unreadCount', (data: { count: number }) => {
      this.unreadCountSubject.next(data.count);
    });

    this.socket.on('notificationRead', (data: { notificationId: string }) => {
      this.markNotificationAsRead(data.notificationId);
    });

    this.socket.on('allNotificationsRead', () => {
      this.markAllNotificationsAsRead();
    });

    this.socket.on('notificationsData', (data: {
      notifications: RealtimeNotification[];
      pagination: any;
      unreadCount: number;
    }) => {
      this.notificationsSubject.next(data.notifications);
      this.unreadCountSubject.next(data.unreadCount);
    });

    // Presence events
    this.socket.on('userOnline', (data: { userId: string; userName: string; avatar?: string }) => {
      console.log(`👤 ${data.userName} is online`);
    });

    this.socket.on('userOffline', (data: { userId: string }) => {
      console.log(`👤 User ${data.userId} went offline`);
    });

    this.socket.on('userStatusUpdate', (data: { userId: string; status: string }) => {
      console.log(`👤 User ${data.userId} status: ${data.status}`);
    });

    // Error handling
    this.socket.on('error', (error: { message: string }) => {
      console.error('Socket error:', error);
      this.notificationService.error('Connection Error', error.message);
    });
  }

  private loadInitialNotifications(): void {
    this.getNotifications({ page: 1, limit: 20 });
  }

  private addNotification(notification: RealtimeNotification): void {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = [notification, ...currentNotifications];
    this.notificationsSubject.next(updatedNotifications);
    
    // Update unread count
    if (!notification.isRead) {
      const currentCount = this.unreadCountSubject.value;
      this.unreadCountSubject.next(currentCount + 1);
    }
  }

  private markNotificationAsRead(notificationId: string): void {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = currentNotifications.map(notification => {
      if (notification._id === notificationId && !notification.isRead) {
        return { ...notification, isRead: true, readAt: new Date() };
      }
      return notification;
    });
    this.notificationsSubject.next(updatedNotifications);
    
    // Update unread count
    const currentCount = this.unreadCountSubject.value;
    this.unreadCountSubject.next(Math.max(0, currentCount - 1));
  }

  private markAllNotificationsAsRead(): void {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = currentNotifications.map(notification => ({
      ...notification,
      isRead: true,
      readAt: new Date()
    }));
    this.notificationsSubject.next(updatedNotifications);
    this.unreadCountSubject.next(0);
  }

  private showToastNotification(notification: RealtimeNotification): void {
    // Show toast notification based on priority
    const duration = notification.priority === 'urgent' ? 10000 : 
                    notification.priority === 'high' ? 7000 : 5000;

    const type = notification.category === 'payment' && notification.type.includes('failed') ? 'error' :
                notification.category === 'payment' && notification.type.includes('success') ? 'success' :
                notification.priority === 'urgent' ? 'warning' : 'info';

    this.notificationService.show({
      type,
      title: notification.title,
      message: notification.message,
      duration
    });
  }

  // Public methods
  getNotifications(options: {
    page?: number;
    limit?: number;
    category?: string;
    isRead?: boolean;
    type?: string;
  } = {}): void {
    if (this.socket && this.connected) {
      this.socket.emit('getNotifications', options);
    }
  }

  markAsRead(notificationId: string): void {
    if (this.socket && this.connected) {
      this.socket.emit('markNotificationRead', { notificationId });
    }
  }

  markAllAsRead(): void {
    if (this.socket && this.connected) {
      this.socket.emit('markAllNotificationsRead');
    }
  }

  updateStatus(status: 'online' | 'away' | 'busy' | 'offline'): void {
    if (this.socket && this.connected) {
      this.socket.emit('updateStatus', { status });
    }
  }

  // Typing indicators for chat features
  setTyping(chatId: string, isTyping: boolean): void {
    if (this.socket && this.connected) {
      this.socket.emit('typing', { chatId, isTyping });
    }
  }

  // Getters
  get isConnected(): boolean {
    return this.connected;
  }

  get currentNotifications(): RealtimeNotification[] {
    return this.notificationsSubject.value;
  }

  get currentUnreadCount(): number {
    return this.unreadCountSubject.value;
  }

  // Utility methods
  getNotificationIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      'order_placed': 'shopping-cart',
      'order_confirmed': 'check-circle',
      'order_shipped': 'truck',
      'order_delivered': 'package',
      'order_cancelled': 'x-circle',
      'payment_success': 'credit-card',
      'payment_failed': 'alert-circle',
      'product_liked': 'heart',
      'product_commented': 'message-circle',
      'user_followed': 'user-plus',
      'post_liked': 'thumbs-up',
      'post_commented': 'message-square',
      'story_viewed': 'eye',
      'vendor_approved': 'check',
      'vendor_rejected': 'x',
      'low_stock': 'alert-triangle',
      'welcome': 'smile',
      'password_changed': 'lock',
      'profile_updated': 'user'
    };
    return iconMap[type] || 'bell';
  }

  getNotificationColor(priority: string): string {
    const colorMap: { [key: string]: string } = {
      'low': '#6b7280',
      'medium': '#3b82f6',
      'high': '#f59e0b',
      'urgent': '#ef4444'
    };
    return colorMap[priority] || '#6b7280';
  }
}
