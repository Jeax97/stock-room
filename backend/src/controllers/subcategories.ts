import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

export async function getSubcategories(req: Request, res: Response, next: NextFunction) {
  try {
    const { categoryId } = req.query;
    const where: any = {};
    if (categoryId) where.categoryId = Number(categoryId);

    const subcategories = await prisma.subcategory.findMany({
      where,
      include: { category: true, _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    });
    res.json(subcategories);
  } catch (err) {
    next(err);
  }
}

export async function createSubcategory(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, categoryId } = req.body;
    if (!name?.trim() || !categoryId) return res.status(400).json({ error: 'Nome e categoria sono obbligatori.' });
    const subcategory = await prisma.subcategory.create({
      data: { name: name.trim(), categoryId: Number(categoryId) },
      include: { category: true },
    });
    res.status(201).json(subcategory);
  } catch (err) {
    next(err);
  }
}

export async function updateSubcategory(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, categoryId } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Il nome è obbligatorio.' });
    const data: any = { name: name.trim() };
    if (categoryId) data.categoryId = Number(categoryId);
    const subcategory = await prisma.subcategory.update({
      where: { id: Number(req.params.id) },
      data,
      include: { category: true },
    });
    res.json(subcategory);
  } catch (err) {
    next(err);
  }
}

export async function deleteSubcategory(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const count = await prisma.product.count({ where: { subcategoryId: id } });
    if (count > 0) {
      return res.status(400).json({ error: `Impossibile eliminare: ${count} prodotti usano questa subcategoria.` });
    }
    await prisma.subcategory.delete({ where: { id } });
    res.json({ message: 'Subcategoria eliminata.' });
  } catch (err) {
    next(err);
  }
}
