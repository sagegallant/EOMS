import { Notification } from '../models/index.js';

export async function listNotifications(req, res, next) {
  try {
    const userId = req.user?.userId || req.user?.id;
    const notifications = await Notification.findAll({
      where: { userId },
      order: [['created_at', 'DESC']],
      limit: 50,
    });
    res.json({ data: notifications });
  } catch (e) {
    next(e);
  }
}

export async function markAsRead(req, res, next) {
  try {
    const notification = await Notification.findOne({
      where: { notificationId: req.params.id, userId: req.user.userId },
    });

    if (!notification) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Notification not found.' });
    }

    await notification.update({ isRead: true, readAt: new Date() });
    res.json({ message: 'Marked as read.', data: notification });
  } catch (e) {
    next(e);
  }
}

export async function markAllAsRead(req, res, next) {
  try {
    await Notification.update(
      { isRead: true, readAt: new Date() },
      { where: { userId: req.user.userId, isRead: false } },
    );
    res.json({ message: 'All notifications marked as read.' });
  } catch (e) {
    next(e);
  }
}
