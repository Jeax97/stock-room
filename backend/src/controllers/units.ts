import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

export async function getUnits(_req: Request, res: Response, next: NextFunction) {
  try {
    const units = await prisma.unitOfMeasure.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    });
    res.json(units);
  } catch (err) {
    next(err);
  }
}

export async function createUnit(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, symbol } = req.body;
    if (!name?.trim() || !symbol?.trim()) return res.status(400).json({ error: 'Nome e simbolo sono obbligatori.' });
    const unit = await prisma.unitOfMeasure.create({
      data: { name: name.trim(), symbol: symbol.trim() },
    });
    res.status(201).json(unit);
  } catch (err) {
    next(err);
  }
}

export async function updateUnit(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, symbol } = req.body;
    if (!name?.trim() || !symbol?.trim()) return res.status(400).json({ error: 'Nome e simbolo sono obbligatori.' });
    const unit = await prisma.unitOfMeasure.update({
      where: { id: Number(req.params.id) },
      data: { name: name.trim(), symbol: symbol.trim() },
    });
    res.json(unit);
  } catch (err) {
    next(err);
  }
}

export async function deleteUnit(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const count = await prisma.product.count({ where: { unitOfMeasureId: id } });
    if (count > 0) {
      return res.status(400).json({ error: `Impossibile eliminare: ${count} prodotti usano questa unità.` });
    }
    await prisma.unitOfMeasure.delete({ where: { id } });
    res.json({ message: 'Unità di misura eliminata.' });
  } catch (err) {
    next(err);
  }
}
