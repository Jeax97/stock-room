import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

export async function getLocations(_req: Request, res: Response, next: NextFunction) {
  try {
    const locations = await prisma.location.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    });
    res.json(locations);
  } catch (err) {
    next(err);
  }
}

export async function createLocation(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, description } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Il nome è obbligatorio.' });
    const location = await prisma.location.create({
      data: { name: name.trim(), description: description?.trim() || null },
    });
    res.status(201).json(location);
  } catch (err) {
    next(err);
  }
}

export async function updateLocation(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, description } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Il nome è obbligatorio.' });
    const location = await prisma.location.update({
      where: { id: Number(req.params.id) },
      data: { name: name.trim(), description: description?.trim() || null },
    });
    res.json(location);
  } catch (err) {
    next(err);
  }
}

export async function deleteLocation(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const count = await prisma.product.count({ where: { locationId: id } });
    if (count > 0) {
      return res.status(400).json({ error: `Impossibile eliminare: ${count} prodotti usano questa posizione.` });
    }
    await prisma.location.delete({ where: { id } });
    res.json({ message: 'Posizione eliminata.' });
  } catch (err) {
    next(err);
  }
}
