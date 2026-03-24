import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

export async function getNotifications(req: Request, res: Response, next: NextFunction) {
  try {
    const { read, page = '1', limit = '50' } = req.query;
    const where: any = {};
    if (read === 'true') where.read = true;
    if (read === 'false') where.read = false;

    const skip = (Number(page) - 1) * Number(limit);

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        include: { product: { select: { id: true, name: true, photo: true, quantity: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.notification.count({ where }),
    ]);

    res.json({ notifications, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
}

export async function getUnreadCount(_req: Request, res: Response, next: NextFunction) {
  try {
    const count = await prisma.notification.count({ where: { read: false } });
    res.json({ count });
  } catch (err) {
    next(err);
  }
}

export async function markAsRead(req: Request, res: Response, next: NextFunction) {
  try {
    const notification = await prisma.notification.update({
      where: { id: Number(req.params.id) },
      data: { read: true },
    });
    res.json(notification);
  } catch (err) {
    next(err);
  }
}

export async function markAllAsRead(_req: Request, res: Response, next: NextFunction) {
  try {
    await prisma.notification.updateMany({
      where: { read: false },
      data: { read: true },
    });
    res.json({ message: 'Tutte le notifiche segnate come lette.' });
  } catch (err) {
    next(err);
  }
}
