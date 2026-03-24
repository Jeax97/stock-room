import { Router } from 'express';
import { upload } from '../middleware/upload';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductPhoto,
  getProductByBarcode,
} from '../controllers/products';

export const productsRouter = Router();

productsRouter.get('/', getProducts);
productsRouter.get('/barcode/:code', getProductByBarcode);
productsRouter.get('/:id', getProductById);
productsRouter.post('/', createProduct);
productsRouter.put('/:id', updateProduct);
productsRouter.delete('/:id', deleteProduct);
productsRouter.post('/:id/photo', upload.single('photo'), uploadProductPhoto);
