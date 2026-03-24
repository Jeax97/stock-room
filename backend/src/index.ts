import express from 'express';
import cors from 'cors';
import path from 'path';
import { productsRouter } from './routes/products';
import { categoriesRouter } from './routes/categories';
import { subcategoriesRouter } from './routes/subcategories';
import { locationsRouter } from './routes/locations';
import { unitsRouter } from './routes/units';
import { suppliersRouter } from './routes/suppliers';
import { movementsRouter } from './routes/movements';
import { notificationsRouter } from './routes/notifications';
import { settingsRouter } from './routes/settings';
import { exportRouter } from './routes/export';
import { dashboardRouter } from './routes/dashboard';
import { errorHandler } from './middleware/errorHandler';
import { startCronJobs } from './cron';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve uploaded files
const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '..', 'uploads');
app.use('/uploads', express.static(uploadDir));

// API Routes
app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/subcategories', subcategoriesRouter);
app.use('/api/locations', locationsRouter);
app.use('/api/units', unitsRouter);
app.use('/api/suppliers', suppliersRouter);
app.use('/api/movements', movementsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/export', exportRouter);
app.use('/api/dashboard', dashboardRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

// Start cron jobs
startCronJobs();

app.listen(PORT, () => {
  console.log(`🚀 Stock-Room API running on port ${PORT}`);
});

export default app;
