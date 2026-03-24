import cron from 'node-cron';
import prisma from '../lib/prisma';
import { checkAllLowStock } from '../services/notification.service';
import { createBackup } from '../services/backup.service';

let stockCheckJob: cron.ScheduledTask | null = null;
let backupJob: cron.ScheduledTask | null = null;

export async function startCronJobs() {
  try {
    const settings = await prisma.appSettings.findUnique({ where: { id: 1 } });

    // Low stock check cron
    const stockSchedule = settings?.lowStockCheckCronSchedule || '0 * * * *';
    if (cron.validate(stockSchedule)) {
      stockCheckJob = cron.schedule(stockSchedule, async () => {
        await checkAllLowStock();
      });
      console.log(`⏰ Low stock check scheduled: ${stockSchedule}`);
    }

    // Backup cron
    if (settings?.backupEnabled) {
      const backupSchedule = settings.backupCronSchedule || '0 2 * * *';
      if (cron.validate(backupSchedule)) {
        backupJob = cron.schedule(backupSchedule, async () => {
          try {
            await createBackup();
          } catch (err) {
            console.error('Scheduled backup failed:', err);
          }
        });
        console.log(`⏰ Backup scheduled: ${backupSchedule}`);
      }
    }
  } catch (err) {
    console.error('Failed to start cron jobs:', err);
    // Schedule default jobs even if settings fail
    stockCheckJob = cron.schedule('0 * * * *', checkAllLowStock);
    console.log('⏰ Default low stock check scheduled: 0 * * * *');
  }
}

export function stopCronJobs() {
  stockCheckJob?.stop();
  backupJob?.stop();
}
