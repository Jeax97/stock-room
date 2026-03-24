import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

async function getFilteredProducts(query: any) {
  const where: any = {};
  if (query.categoryId) where.categoryId = Number(query.categoryId);
  if (query.locationId) where.locationId = Number(query.locationId);

  return prisma.product.findMany({
    where,
    include: {
      category: true,
      subcategory: true,
      location: true,
      supplier: true,
      unitOfMeasure: true,
    },
    orderBy: { name: 'asc' },
  });
}

export async function exportCSV(req: Request, res: Response, next: NextFunction) {
  try {
    const products = await getFilteredProducts(req.query);

    const headers = ['Nome', 'Categoria', 'Subcategoria', 'Posizione', 'Fornitore', 'Quantità', 'Unità', 'Prezzo Acquisto', 'Soglia Scorta', 'Barcode', 'Note'];
    const rows = products.map((p: any) => [
      p.name,
      p.category.name,
      p.subcategory?.name || '',
      p.location?.name || '',
      p.supplier?.name || '',
      p.quantity,
      p.unitOfMeasure.symbol,
      p.purchasePrice ?? '',
      p.lowStockThreshold,
      p.barcode || '',
      p.notes || '',
    ]);

    // BOM for Excel UTF-8 compatibility
    let csv = '\ufeff' + headers.join(';') + '\n';
    for (const row of rows) {
      csv += row.map((v: unknown) => `"${String(v).replace(/"/g, '""')}"`).join(';') + '\n';
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=magazzino.csv');
    res.send(csv);
  } catch (err) {
    next(err);
  }
}

export async function exportExcel(req: Request, res: Response, next: NextFunction) {
  try {
    const products = await getFilteredProducts(req.query);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Stock-Room';
    const sheet = workbook.addWorksheet('Magazzino');

    sheet.columns = [
      { header: 'Nome', key: 'name', width: 30 },
      { header: 'Categoria', key: 'category', width: 20 },
      { header: 'Subcategoria', key: 'subcategory', width: 20 },
      { header: 'Posizione', key: 'location', width: 20 },
      { header: 'Fornitore', key: 'supplier', width: 20 },
      { header: 'Quantità', key: 'quantity', width: 12 },
      { header: 'Unità', key: 'unit', width: 10 },
      { header: 'Prezzo Acquisto', key: 'price', width: 15 },
      { header: 'Soglia Scorta', key: 'threshold', width: 15 },
      { header: 'Barcode', key: 'barcode', width: 18 },
      { header: 'Note', key: 'notes', width: 30 },
    ];

    // Style header
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };

    for (const p of products) {
      const row = sheet.addRow({
        name: p.name,
        category: p.category.name,
        subcategory: p.subcategory?.name || '',
        location: p.location?.name || '',
        supplier: p.supplier?.name || '',
        quantity: p.quantity,
        unit: p.unitOfMeasure.symbol,
        price: p.purchasePrice ?? '',
        threshold: p.lowStockThreshold,
        barcode: p.barcode || '',
        notes: p.notes || '',
      });

      // Highlight low stock
      if (p.quantity <= p.lowStockThreshold) {
        row.getCell('quantity').fill = {
          type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' },
        };
        row.getCell('quantity').font = { color: { argb: 'FFDC2626' }, bold: true };
      }
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=magazzino.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    next(err);
  }
}

export async function exportPDF(req: Request, res: Response, next: NextFunction) {
  try {
    const products = await getFilteredProducts(req.query);

    const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=magazzino.pdf');
    doc.pipe(res);

    // Title
    doc.fontSize(20).text('Stock-Room — Inventario Magazzino', { align: 'center' });
    doc.fontSize(10).text(`Generato il ${new Date().toLocaleDateString('it-IT')}`, { align: 'center' });
    doc.moveDown(1);

    // Table header
    const headers = ['Nome', 'Categoria', 'Posizione', 'Qtà', 'Unità', 'Prezzo', 'Barcode'];
    const colWidths = [180, 100, 100, 50, 50, 70, 120];
    let x = 40;
    const y = doc.y;

    doc.fontSize(9).font('Helvetica-Bold');
    headers.forEach((h, i) => {
      doc.text(h, x, y, { width: colWidths[i] });
      x += colWidths[i];
    });
    doc.moveDown(0.5);
    doc.moveTo(40, doc.y).lineTo(760, doc.y).stroke();
    doc.moveDown(0.3);

    doc.font('Helvetica').fontSize(8);
    for (const p of products) {
      if (doc.y > 520) {
        doc.addPage();
        doc.y = 40;
      }

      x = 40;
      const rowY = doc.y;
      const values = [
        p.name,
        p.category.name,
        p.location?.name || '-',
        String(p.quantity),
        p.unitOfMeasure.symbol,
        p.purchasePrice ? `€${p.purchasePrice.toFixed(2)}` : '-',
        p.barcode || '-',
      ];

      values.forEach((v, i) => {
        if (i === 3 && p.quantity <= p.lowStockThreshold) {
          doc.fillColor('red').text(v, x, rowY, { width: colWidths[i] }).fillColor('black');
        } else {
          doc.text(v, x, rowY, { width: colWidths[i] });
        }
        x += colWidths[i];
      });
      doc.moveDown(0.3);
    }

    doc.moveDown(1);
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text(`Totale prodotti: ${products.length}`, 40);

    doc.end();
  } catch (err) {
    next(err);
  }
}
