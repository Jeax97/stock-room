import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  console.error('❌ Error:', err.message);
  console.error(err.stack);

  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaErr = err as any;
    if (prismaErr.code === 'P2002') {
      return res.status(409).json({ error: 'Un record con questo valore esiste già.' });
    }
    if (prismaErr.code === 'P2003') {
      return res.status(400).json({ error: 'Riferimento a un record inesistente.' });
    }
    if (prismaErr.code === 'P2025') {
      return res.status(404).json({ error: 'Record non trovato.' });
    }
  }

  if (err.name === 'PrismaClientValidationError') {
    return res.status(400).json({ error: 'Dati non validi.' });
  }

  res.status(500).json({ error: 'Errore interno del server.' });
}
