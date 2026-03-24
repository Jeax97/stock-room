import { Router } from 'express';
import { exportCSV, exportExcel, exportPDF } from '../controllers/export';

export const exportRouter = Router();

exportRouter.get('/csv', exportCSV);
exportRouter.get('/excel', exportExcel);
exportRouter.get('/pdf', exportPDF);
