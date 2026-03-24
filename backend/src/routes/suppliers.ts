import { Router } from 'express';
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../controllers/suppliers';

export const suppliersRouter = Router();

suppliersRouter.get('/', getSuppliers);
suppliersRouter.post('/', createSupplier);
suppliersRouter.put('/:id', updateSupplier);
suppliersRouter.delete('/:id', deleteSupplier);
