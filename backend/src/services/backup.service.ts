import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';

const backupDir = process.env.BACKUP_DIR || path.join(__dirname, '..', '..', 'backups');

export async function createBackup(): Promise<string> {
  // Ensure backup directory exists
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `backup-${timestamp}.sql`;
  const filepath = path.join(backupDir, filename);

  const dbUrl = process.env.DATABASE_URL || '';
  // Parse DATABASE_URL for pg_dump
  const match = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/);

  if (!match) {
    throw new Error('Invalid DATABASE_URL format');
  }

  const [, user, password, host, port, database] = match;

  return new Promise((resolve, reject) => {
    const env = { ...process.env, PGPASSWORD: password };
    const cmd = `pg_dump -h ${host} -p ${port} -U ${user} -d ${database} -F p -f ${filepath}`;

    exec(cmd, { env }, (error, _stdout, stderr) => {
      if (error) {
        console.error('Backup failed:', stderr);
        reject(error);
      } else {
        console.log(`✅ Backup created: ${filename}`);
        // Clean old backups (keep last 7)
        cleanOldBackups(7);
        resolve(filename);
      }
    });
  });
}

function cleanOldBackups(keepCount: number) {
  try {
    const files = fs.readdirSync(backupDir)
      .filter(f => f.startsWith('backup-') && f.endsWith('.sql'))
      .sort()
      .reverse();

    for (let i = keepCount; i < files.length; i++) {
      fs.unlinkSync(path.join(backupDir, files[i]));
      console.log(`🗑️ Deleted old backup: ${files[i]}`);
    }
  } catch (err) {
    console.error('Cleanup error:', err);
  }
}
