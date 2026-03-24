import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '..', '..', 'uploads');

export async function getProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const { search, categoryId, subcategoryId, locationId, supplierId, lowStock, page = '1', limit = '50', sortBy = 'name', sortOrder = 'asc' } = req.query;

    const where: any = {};

    if (search) {
      where.name = { contains: String(search), mode: 'insensitive' };
    }
    if (categoryId) {
      where.categoryId = Number(categoryId);
    }
    if (subcategoryId) {
      where.subcategoryId = Number(subcategoryId);
    }
    if (locationId) {
      where.locationId = Number(locationId);
    }
    if (supplierId) {
      where.supplierId = Number(supplierId);
    }
    // lowStock filter is handled post-query since it compares two columns

    const skip = (Number(page) - 1) * Number(limit);
    const orderBy: any = {};
    orderBy[String(sortBy)] = String(sortOrder);

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          subcategory: true,
          location: true,
          supplier: true,
          unitOfMeasure: true,
        },
        orderBy,
        skip,
        take: Number(limit),
      }),
      prisma.product.count({ where }),
    ]);

    // Add isLowStock flag
    const enriched = products.map((p: { quantity: number; lowStockThreshold: number; [key: string]: unknown }) => ({
      ...p,
      isLowStock: p.quantity <= p.lowStockThreshold,
    }));

    res.json({ products: enriched, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
}

export async function getProductById(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        category: true,
        subcategory: true,
        location: true,
        supplier: true,
        unitOfMeasure: true,
      },
    });
    if (!product) return res.status(404).json({ error: 'Prodotto non trovato.' });
    res.json({ ...product, isLowStock: product.quantity <= product.lowStockThreshold });
  } catch (err) {
    next(err);
  }
}

export async function getProductByBarcode(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await prisma.product.findUnique({
      where: { barcode: req.params.code },
      include: {
        category: true,
        subcategory: true,
        location: true,
        supplier: true,
        unitOfMeasure: true,
      },
    });
    if (!product) return res.status(404).json({ error: 'Nessun prodotto trovato con questo barcode.' });
    res.json({ ...product, isLowStock: product.quantity <= product.lowStockThreshold });
  } catch (err) {
    next(err);
  }
}

export async function createProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, categoryId, subcategoryId, locationId, supplierId, unitOfMeasureId, quantity, purchasePrice, lowStockThreshold, barcode, notes } = req.body;

    if (!name || !categoryId || !unitOfMeasureId) {
      return res.status(400).json({ error: 'Nome, categoria e unità di misura sono obbligatori.' });
    }

    const product = await prisma.product.create({
      data: {
        name,
        categoryId: Number(categoryId),
        subcategoryId: subcategoryId ? Number(subcategoryId) : null,
        locationId: locationId ? Number(locationId) : null,
        supplierId: supplierId ? Number(supplierId) : null,
        unitOfMeasureId: Number(unitOfMeasureId),
        quantity: Number(quantity) || 0,
        purchasePrice: purchasePrice ? Number(purchasePrice) : null,
        lowStockThreshold: Number(lowStockThreshold) || 5,
        barcode: barcode || null,
        notes: notes || null,
      },
      include: {
        category: true,
        subcategory: true,
        location: true,
        supplier: true,
        unitOfMeasure: true,
      },
    });

    // Create initial stock movement if quantity > 0
    if (product.quantity > 0) {
      await prisma.stockMovement.create({
        data: {
          productId: product.id,
          type: 'IN',
          quantity: product.quantity,
          reason: 'Carico iniziale',
          previousQuantity: 0,
          newQuantity: product.quantity,
        },
      });
    }

    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
}

export async function updateProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const { name, categoryId, subcategoryId, locationId, supplierId, unitOfMeasureId, purchasePrice, lowStockThreshold, barcode, notes } = req.body;

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(categoryId !== undefined && { categoryId: Number(categoryId) }),
        ...(subcategoryId !== undefined && { subcategoryId: subcategoryId ? Number(subcategoryId) : null }),
        ...(locationId !== undefined && { locationId: locationId ? Number(locationId) : null }),
        ...(supplierId !== undefined && { supplierId: supplierId ? Number(supplierId) : null }),
        ...(unitOfMeasureId !== undefined && { unitOfMeasureId: Number(unitOfMeasureId) }),
        ...(purchasePrice !== undefined && { purchasePrice: purchasePrice ? Number(purchasePrice) : null }),
        ...(lowStockThreshold !== undefined && { lowStockThreshold: Number(lowStockThreshold) }),
        ...(barcode !== undefined && { barcode: barcode || null }),
        ...(notes !== undefined && { notes: notes || null }),
      },
      include: {
        category: true,
        subcategory: true,
        location: true,
        supplier: true,
        unitOfMeasure: true,
      },
    });

    res.json(product);
  } catch (err) {
    next(err);
  }
}

export async function deleteProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return res.status(404).json({ error: 'Prodotto non trovato.' });

    // Delete photo file if exists
    if (product.photo) {
      const photoPath = path.join(uploadDir, product.photo);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }

    await prisma.product.delete({ where: { id } });
    res.json({ message: 'Prodotto eliminato.' });
  } catch (err) {
    next(err);
  }
}

export async function uploadProductPhoto(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    if (!req.file) return res.status(400).json({ error: 'Nessun file caricato.' });

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return res.status(404).json({ error: 'Prodotto non trovato.' });

    // Delete old photo
    if (product.photo) {
      const oldPath = path.join(uploadDir, product.photo);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // Resize image with sharp — always output as .jpg
    const baseName = path.parse(req.file.filename).name;
    const resizedFilename = `resized-${baseName}.jpg`;
    const resizedPath = path.join(uploadDir, resizedFilename);
    await sharp(req.file.path)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toFile(resizedPath);

    // Delete original uploaded file
    fs.unlinkSync(req.file.path);

    const updated = await prisma.product.update({
      where: { id },
      data: { photo: resizedFilename },
    });

    res.json({ photo: updated.photo });
  } catch (err) {
    next(err);
  }
}
