import { Router } from 'express';
import {
  getSubcategories,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
} from '../controllers/subcategories';

export const subcategoriesRouter = Router();

subcategoriesRouter.get('/', getSubcategories);
subcategoriesRouter.post('/', createSubcategory);
subcategoriesRouter.put('/:id', updateSubcategory);
subcategoriesRouter.delete('/:id', deleteSubcategory);
