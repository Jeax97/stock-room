import { Router } from 'express';
import { getUnits, createUnit, updateUnit, deleteUnit } from '../controllers/units';

export const unitsRouter = Router();

unitsRouter.get('/', getUnits);
unitsRouter.post('/', createUnit);
unitsRouter.put('/:id', updateUnit);
unitsRouter.delete('/:id', deleteUnit);
