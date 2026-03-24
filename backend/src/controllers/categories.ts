import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

export async function getCategories(_req: Request, res: Response, next: NextFunction) {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { products: true, subcategories: true } } },
      orderBy: { name: 'asc' },
    });
    res.json(categories);
  } catch (err) {
    next(err);
  }
}

export async function getCategoryById(req: Request, res: Response, next: NextFunction) {
  try {
    const category = await prisma.category.findUnique({
      where: { id: Number(req.params.id) },
      include: { subcategories: true, _count: { select: { products: true } } },
    });
    if (!category) return res.status(404).json({ error: 'Categoria non trovata.' });
    res.json(category);
  } catch (err) {
    next(err);
  }
}

export async function createCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Il nome è obbligatorio.' });
    const category = await prisma.category.create({ data: { name: name.trim() } });
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
}

export async function updateCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Il nome è obbligatorio.' });
    const category = await prisma.category.update({
      where: { id: Number(req.params.id) },
      data: { name: name.trim() },
    });
    res.json(category);
  } catch (err) {
    next(err);
  }
}

export async function deleteCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const count = await prisma.product.count({ where: { categoryId: id } });
    if (count > 0) {
      return res.status(400).json({ error: `Impossibile eliminare: ${count} prodotti usano questa categoria.` });
    }
    // Delete subcategories first
    await prisma.subcategory.deleteMany({ where: { categoryId: id } });
    await prisma.category.delete({ where: { id } });
    res.json({ message: 'Categoria eliminata.' });
  } catch (err) {
    next(err);
  }
}
