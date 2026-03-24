import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

export async function getSuppliers(_req: Request, res: Response, next: NextFunction) {
  try {
    const suppliers = await prisma.supplier.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    });
    res.json(suppliers);
  } catch (err) {
    next(err);
  }
}

export async function createSupplier(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, contactInfo } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Il nome è obbligatorio.' });
    const supplier = await prisma.supplier.create({
      data: { name: name.trim(), contactInfo: contactInfo?.trim() || null },
    });
    res.status(201).json(supplier);
  } catch (err) {
    next(err);
  }
}

export async function updateSupplier(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, contactInfo } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Il nome è obbligatorio.' });
    const supplier = await prisma.supplier.update({
      where: { id: Number(req.params.id) },
      data: { name: name.trim(), contactInfo: contactInfo?.trim() || null },
    });
    res.json(supplier);
  } catch (err) {
    next(err);
  }
}

export async function deleteSupplier(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const count = await prisma.product.count({ where: { supplierId: id } });
    if (count > 0) {
      return res.status(400).json({ error: `Impossibile eliminare: ${count} prodotti usano questo fornitore.` });
    }
    await prisma.supplier.delete({ where: { id } });
    res.json({ message: 'Fornitore eliminato.' });
  } catch (err) {
    next(err);
  }
}
