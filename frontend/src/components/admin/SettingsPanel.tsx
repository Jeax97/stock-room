import { useEffect, useState } from 'react';
import { Save, Mail, Send, Database, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { getSettings, updateSettings } from '@/services/api';
import { AppSettings } from '@/types';

export default function SettingsPanel() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSettings().then(setSettings).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const update = (field: string, value: any) => {
    setSettings(s => s ? { ...s, [field]: value } : null);
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const saved = await updateSettings(settings);
      setSettings(saved);
      toast.success('Impostazioni salvate');
    } catch {
      toast.error('Errore nel salvataggio');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return <div className="card p-6"><div className="skeleton h-64 w-full" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
          <Mail className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notifiche Email</h2>
        </div>
        <div className="p-6 space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enableEmailNotifications}
              onChange={e => update('enableEmailNotifications', e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm font-medium text-gray-900 dark:text-white">Abilita notifiche email</span>
          </label>

          {settings.enableEmailNotifications && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-8">
              <div>
                <label className="label">Host SMTP</label>
                <input type="text" value={settings.emailSmtpHost} onChange={e => update('emailSmtpHost', e.target.value)} className="input" placeholder="smtp.gmail.com" />
              </div>
              <div>
                <label className="label">Porta SMTP</label>
                <input type="number" value={settings.emailSmtpPort} onChange={e => update('emailSmtpPort', Number(e.target.value))} className="input" />
              </div>
              <div>
                <label className="label">Utente SMTP</label>
                <input type="text" value={settings.emailSmtpUser} onChange={e => update('emailSmtpUser', e.target.value)} className="input" placeholder="user@example.com" />
              </div>
              <div>
                <label className="label">Password SMTP</label>
                <input type="password" value={settings.emailSmtpPass} onChange={e => update('emailSmtpPass', e.target.value)} className="input" />
              </div>
              <div>
                <label className="label">Email Mittente</label>
                <input type="email" value={settings.emailFrom} onChange={e => update('emailFrom', e.target.value)} className="input" placeholder="stockroom@example.com" />
              </div>
              <div>
                <label className="label">Email Destinatario</label>
                <input type="email" value={settings.emailTo} onChange={e => update('emailTo', e.target.value)} className="input" placeholder="admin@example.com" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Telegram Notifications */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
          <Send className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notifiche Telegram</h2>
        </div>
        <div className="p-6 space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enableTelegramNotifications}
              onChange={e => update('enableTelegramNotifications', e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm font-medium text-gray-900 dark:text-white">Abilita notifiche Telegram</span>
          </label>

          {settings.enableTelegramNotifications && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-8">
              <div>
                <label className="label">Bot Token</label>
                <input type="text" value={settings.telegramBotToken} onChange={e => update('telegramBotToken', e.target.value)} className="input" placeholder="123456:ABC-DEF..." />
                <p className="text-xs text-gray-500 mt-1">Ottienilo da @BotFather su Telegram</p>
              </div>
              <div>
                <label className="label">Chat ID</label>
                <input type="text" value={settings.telegramChatId} onChange={e => update('telegramChatId', e.target.value)} className="input" placeholder="123456789" />
                <p className="text-xs text-gray-500 mt-1">Usa @userinfobot per trovarlo</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Backup Settings */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
          <Database className="w-5 h-5 text-green-600" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Backup Database</h2>
        </div>
        <div className="p-6 space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.backupEnabled}
              onChange={e => update('backupEnabled', e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm font-medium text-gray-900 dark:text-white">Abilita backup automatico</span>
          </label>

          {settings.backupEnabled && (
            <div className="pl-8">
              <label className="label">Pianificazione (cron)</label>
              <input type="text" value={settings.backupCronSchedule} onChange={e => update('backupCronSchedule', e.target.value)} className="input w-64" />
              <p className="text-xs text-gray-500 mt-1">Default: "0 2 * * *" (ogni giorno alle 2:00)</p>
            </div>
          )}
        </div>
      </div>

      {/* Stock Check Schedule */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
          <Clock className="w-5 h-5 text-yellow-600" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Controllo Scorte</h2>
        </div>
        <div className="p-6">
          <label className="label">Pianificazione controllo (cron)</label>
          <input type="text" value={settings.lowStockCheckCronSchedule} onChange={e => update('lowStockCheckCronSchedule', e.target.value)} className="input w-64" />
          <p className="text-xs text-gray-500 mt-1">Default: "0 * * * *" (ogni ora)</p>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button onClick={handleSave} className="btn-primary" disabled={saving}>
          <Save className="w-4 h-4" /> {saving ? 'Salvataggio...' : 'Salva Impostazioni'}
        </button>
      </div>
    </div>
  );
}
