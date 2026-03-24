import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

export async function getDashboardStats(_req: Request, res: Response, next: NextFunction) {
  try {
    const [
      totalProducts,
      lowStockProducts,
      totalCategories,
      recentMovements,
      categoryDistribution,
      allProducts,
      unreadNotifications,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({
        where: {
          quantity: { lte: 0 }, // Will be replaced with raw query
        },
      }),
      prisma.category.count(),
      prisma.stockMovement.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { product: { select: { id: true, name: true } } },
      }),
      prisma.category.findMany({
        include: { _count: { select: { products: true } } },
        orderBy: { name: 'asc' },
      }),
      prisma.product.findMany({
        select: { quantity: true, lowStockThreshold: true, purchasePrice: true },
      }),
      prisma.notification.count({ where: { read: false } }),
    ]);

    // Calculate low stock count properly (quantity <= threshold)
    const actualLowStock = allProducts.filter((p: { quantity: number; lowStockThreshold: number }) => p.quantity <= p.lowStockThreshold).length;

    // Calculate total inventory value
    const totalValue = allProducts.reduce((sum: number, p: { purchasePrice: number | null; quantity: number }) => {
      return sum + (p.purchasePrice || 0) * p.quantity;
    }, 0);

    res.json({
      totalProducts,
      lowStockCount: actualLowStock,
      totalCategories,
      totalValue: Math.round(totalValue * 100) / 100,
      unreadNotifications,
      recentMovements,
      categoryDistribution: categoryDistribution.map((c: { name: string; _count: { products: number } }) => ({
        name: c.name,
        count: c._count.products,
      })),
    });
  } catch (err) {
    next(err);
  }
}
