import { Router } from 'express';
import { getMovements, getProductMovements, createMovement } from '../controllers/movements';

export const movementsRouter = Router();

movementsRouter.get('/', getMovements);
movementsRouter.get('/product/:productId', getProductMovements);
movementsRouter.post('/', createMovement);
