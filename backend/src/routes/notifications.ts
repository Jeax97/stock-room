import { Router } from 'express';
import { getNotifications, markAsRead, markAllAsRead, getUnreadCount } from '../controllers/notifications';

export const notificationsRouter = Router();

notificationsRouter.get('/', getNotifications);
notificationsRouter.get('/unread-count', getUnreadCount);
notificationsRouter.put('/:id/read', markAsRead);
notificationsRouter.put('/mark-all-read', markAllAsRead);
