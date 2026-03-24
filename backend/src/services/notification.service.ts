import prisma from '../lib/prisma';
import { sendEmail } from './email.service';
import { sendTelegram } from './telegram.service';

export async function checkLowStock(productId?: number) {
  try {
    const where: any = {};
    if (productId) where.id = productId;

    const products = await prisma.product.findMany({
      where,
      select: { id: true, name: true, quantity: true, lowStockThreshold: true },
    });

    const settings = await prisma.appSettings.findUnique({ where: { id: 1 } });

    for (const product of products) {
      if (product.quantity <= product.lowStockThreshold) {
        // Check if we already have an unread notification for this product
        const existing = await prisma.notification.findFirst({
          where: {
            productId: product.id,
            type: 'LOW_STOCK',
            read: false,
          },
        });

        if (!existing) {
          const message = `Scorte basse: "${product.name}" ha solo ${product.quantity} unità (soglia: ${product.lowStockThreshold})`;

          const notification = await prisma.notification.create({
            data: {
              productId: product.id,
              type: 'LOW_STOCK',
              message,
            },
          });

          // Send email if enabled
          if (settings?.enableEmailNotifications && settings.emailTo) {
            try {
              await sendEmail(
                settings.emailTo,
                `⚠️ Scorta Bassa — ${product.name}`,
                message,
                settings
              );
              await prisma.notification.update({
                where: { id: notification.id },
                data: { sentViaEmail: true },
              });
            } catch (e) {
              console.error('Email notification failed:', e);
            }
          }

          // Send telegram if enabled
          if (settings?.enableTelegramNotifications && settings.telegramBotToken && settings.telegramChatId) {
            try {
              await sendTelegram(
                `⚠️ *Scorta Bassa*\n${message}`,
                settings.telegramBotToken,
                settings.telegramChatId
              );
              await prisma.notification.update({
                where: { id: notification.id },
                data: { sentViaTelegram: true },
              });
            } catch (e) {
              console.error('Telegram notification failed:', e);
            }
          }
        }
      }
    }
  } catch (err) {
    console.error('Low stock check error:', err);
  }
}

export async function checkAllLowStock() {
  console.log('🔍 Checking all products for low stock...');
  await checkLowStock();
  console.log('✅ Low stock check complete');
}
