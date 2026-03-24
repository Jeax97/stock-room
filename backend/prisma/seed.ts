/// <reference types="node" />
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Controlla se il database è già stato inizializzato
  const existingSettings = await prisma.appSettings.findUnique({ where: { id: 1 } });
  if (existingSettings) {
    console.log('⏭️  Database già inizializzato, skip seed.');
    return;
  }

  console.log('🌱 Seeding database...');

  // Unità di misura default
  const units = await Promise.all([
    prisma.unitOfMeasure.upsert({ where: { name: 'Pezzi' }, update: {}, create: { name: 'Pezzi', symbol: 'pz' } }),
    prisma.unitOfMeasure.upsert({ where: { name: 'Chilogrammi' }, update: {}, create: { name: 'Chilogrammi', symbol: 'kg' } }),
    prisma.unitOfMeasure.upsert({ where: { name: 'Grammi' }, update: {}, create: { name: 'Grammi', symbol: 'g' } }),
    prisma.unitOfMeasure.upsert({ where: { name: 'Litri' }, update: {}, create: { name: 'Litri', symbol: 'L' } }),
    prisma.unitOfMeasure.upsert({ where: { name: 'Millilitri' }, update: {}, create: { name: 'Millilitri', symbol: 'ml' } }),
    prisma.unitOfMeasure.upsert({ where: { name: 'Metri' }, update: {}, create: { name: 'Metri', symbol: 'm' } }),
    prisma.unitOfMeasure.upsert({ where: { name: 'Centimetri' }, update: {}, create: { name: 'Centimetri', symbol: 'cm' } }),
    prisma.unitOfMeasure.upsert({ where: { name: 'Confezioni' }, update: {}, create: { name: 'Confezioni', symbol: 'conf' } }),
  ]);

  // Categorie demo
  const catElettronica = await prisma.category.upsert({ where: { name: 'Elettronica' }, update: {}, create: { name: 'Elettronica' } });
  const catCancelleria = await prisma.category.upsert({ where: { name: 'Cancelleria' }, update: {}, create: { name: 'Cancelleria' } });
  const catImballaggio = await prisma.category.upsert({ where: { name: 'Imballaggio' }, update: {}, create: { name: 'Imballaggio' } });

  // Subcategorie demo
  const subCavi = await prisma.subcategory.upsert({
    where: { name_categoryId: { name: 'Cavi', categoryId: catElettronica.id } },
    update: {},
    create: { name: 'Cavi', categoryId: catElettronica.id },
  });
  const subAccessori = await prisma.subcategory.upsert({
    where: { name_categoryId: { name: 'Accessori', categoryId: catElettronica.id } },
    update: {},
    create: { name: 'Accessori', categoryId: catElettronica.id },
  });
  const subPenne = await prisma.subcategory.upsert({
    where: { name_categoryId: { name: 'Penne', categoryId: catCancelleria.id } },
    update: {},
    create: { name: 'Penne', categoryId: catCancelleria.id },
  });
  const subScatole = await prisma.subcategory.upsert({
    where: { name_categoryId: { name: 'Scatole', categoryId: catImballaggio.id } },
    update: {},
    create: { name: 'Scatole', categoryId: catImballaggio.id },
  });

  // Posizioni demo
  const locScaffaleA = await prisma.location.upsert({ where: { name: 'Scaffale A' }, update: {}, create: { name: 'Scaffale A', description: 'Piano terra, lato sinistro' } });
  const locScaffaleB = await prisma.location.upsert({ where: { name: 'Scaffale B' }, update: {}, create: { name: 'Scaffale B', description: 'Piano terra, lato destro' } });
  const locMagazzino = await prisma.location.upsert({ where: { name: 'Magazzino Principale' }, update: {}, create: { name: 'Magazzino Principale', description: 'Stanza principale di stoccaggio' } });

  // Fornitori demo
  const supplierTech = await prisma.supplier.upsert({ where: { name: 'TechSupply Srl' }, update: {}, create: { name: 'TechSupply Srl', contactInfo: 'info@techsupply.it - 02 1234567' } });
  const supplierCart = await prisma.supplier.upsert({ where: { name: 'CartaPlus' }, update: {}, create: { name: 'CartaPlus', contactInfo: 'ordini@cartaplus.it' } });

  // Prodotti demo
  const products = [
    {
      name: 'Cavo USB-C 1m',
      categoryId: catElettronica.id,
      subcategoryId: subCavi.id,
      locationId: locScaffaleA.id,
      supplierId: supplierTech.id,
      unitOfMeasureId: units[0].id,
      quantity: 25,
      purchasePrice: 3.50,
      lowStockThreshold: 5,
      barcode: '8001234567890',
      notes: 'Cavo dati e ricarica, compatibile con tutti i dispositivi USB-C',
    },
    {
      name: 'Cavo HDMI 2m',
      categoryId: catElettronica.id,
      subcategoryId: subCavi.id,
      locationId: locScaffaleA.id,
      supplierId: supplierTech.id,
      unitOfMeasureId: units[0].id,
      quantity: 12,
      purchasePrice: 8.00,
      lowStockThreshold: 3,
      barcode: '8001234567891',
    },
    {
      name: 'Mouse Wireless',
      categoryId: catElettronica.id,
      subcategoryId: subAccessori.id,
      locationId: locScaffaleA.id,
      supplierId: supplierTech.id,
      unitOfMeasureId: units[0].id,
      quantity: 2,
      purchasePrice: 15.00,
      lowStockThreshold: 5,
      notes: 'Scorte basse! Riordinare.',
    },
    {
      name: 'Penna Biro Blu',
      categoryId: catCancelleria.id,
      subcategoryId: subPenne.id,
      locationId: locScaffaleB.id,
      supplierId: supplierCart.id,
      unitOfMeasureId: units[7].id,
      quantity: 50,
      purchasePrice: 0.30,
      lowStockThreshold: 10,
    },
    {
      name: 'Scatola Cartone 30x20x15',
      categoryId: catImballaggio.id,
      subcategoryId: subScatole.id,
      locationId: locMagazzino.id,
      unitOfMeasureId: units[0].id,
      quantity: 100,
      purchasePrice: 1.20,
      lowStockThreshold: 20,
    },
    {
      name: 'Nastro Adesivo',
      categoryId: catImballaggio.id,
      locationId: locMagazzino.id,
      unitOfMeasureId: units[0].id,
      quantity: 8,
      purchasePrice: 2.50,
      lowStockThreshold: 10,
      notes: 'Nastro trasparente largo 5cm',
    },
  ];

  for (const product of products) {
    const existing = await prisma.product.findFirst({ where: { name: product.name } });
    if (!existing) {
      await prisma.product.create({ data: product });
    }
  }

  // App Settings default
  await prisma.appSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      enableEmailNotifications: false,
      enableTelegramNotifications: false,
      backupEnabled: false,
      backupCronSchedule: '0 2 * * *',
      lowStockCheckCronSchedule: '0 * * * *',
    },
  });

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
