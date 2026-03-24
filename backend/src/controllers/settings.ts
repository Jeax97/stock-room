import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

export async function getSettings(_req: Request, res: Response, next: NextFunction) {
  try {
    let settings = await prisma.appSettings.findUnique({ where: { id: 1 } });
    if (!settings) {
      settings = await prisma.appSettings.create({ data: { id: 1 } });
    }
    res.json(settings);
  } catch (err) {
    next(err);
  }
}

export async function updateSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const data = req.body;
    // Remove id from update data
    delete data.id;
    delete data.createdAt;
    delete data.updatedAt;

    const settings = await prisma.appSettings.upsert({
      where: { id: 1 },
      update: data,
      create: { id: 1, ...data },
    });
    res.json(settings);
  } catch (err) {
    next(err);
  }
}
