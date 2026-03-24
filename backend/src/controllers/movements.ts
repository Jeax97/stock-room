import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { checkLowStock } from '../services/notification.service';

export async function getMovements(req: Request, res: Response, next: NextFunction) {
  try {
    const { productId, type, page = '1', limit = '50' } = req.query;
    const where: any = {};
    if (productId) where.productId = Number(productId);
    if (type) where.type = String(type);

    const skip = (Number(page) - 1) * Number(limit);

    const [movements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        include: { product: { select: { id: true, name: true, photo: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.stockMovement.count({ where }),
    ]);

    res.json({ movements, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
}

export async function getProductMovements(req: Request, res: Response, next: NextFunction) {
  try {
    const productId = Number(req.params.productId);
    const movements = await prisma.stockMovement.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(movements);
  } catch (err) {
    next(err);
  }
}

export async function createMovement(req: Request, res: Response, next: NextFunction) {
  try {
    const { productId, type, quantity, reason } = req.body;

    if (!productId || !type || quantity === undefined) {
      return res.status(400).json({ error: 'Prodotto, tipo e quantità sono obbligatori.' });
    }

    if (!['IN', 'OUT', 'ADJUSTMENT'].includes(type)) {
      return res.status(400).json({ error: 'Tipo movimento non valido. Usa IN, OUT o ADJUSTMENT.' });
    }

    const product = await prisma.product.findUnique({ where: { id: Number(productId) } });
    if (!product) return res.status(404).json({ error: 'Prodotto non trovato.' });

    const previousQuantity = product.quantity;
    let newQuantity: number;

    switch (type) {
      case 'IN':
        newQuantity = previousQuantity + Number(quantity);
        break;
      case 'OUT':
        newQuantity = previousQuantity - Number(quantity);
        if (newQuantity < 0) newQuantity = 0;
        break;
      case 'ADJUSTMENT':
        newQuantity = Number(quantity);
        break;
      default:
        newQuantity = previousQuantity;
    }

    const [movement] = await prisma.$transaction([
      prisma.stockMovement.create({
        data: {
          productId: Number(productId),
          type,
          quantity: Math.abs(Number(quantity)),
          reason: reason || null,
          previousQuantity,
          newQuantity,
        },
        include: { product: { select: { id: true, name: true } } },
      }),
      prisma.product.update({
        where: { id: Number(productId) },
        data: { quantity: newQuantity },
      }),
    ]);

    // Check low stock after movement
    await checkLowStock(Number(productId));

    res.status(201).json(movement);
  } catch (err) {
    next(err);
  }
}
