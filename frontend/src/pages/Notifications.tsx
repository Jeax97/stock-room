import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check, CheckCheck, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '@/services/api';
import { Notification } from '@/types';
import { formatDate, cn } from '@/lib/utils';
import EmptyState from '@/components/ui/EmptyState';

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'' | 'true' | 'false'>('');

  const fetchNotifications = () => {
    setLoading(true);
    const params: Record<string, any> = { limit: 100 };
    if (filter) params.read = filter;
    getNotifications(params)
      .then(data => setNotifications(data.notifications))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchNotifications(); }, [filter]);

  const handleMarkRead = async (id: number) => {
    try {
      await markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch {
      toast.error('Errore');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('Tutte le notifiche segnate come lette');
    } catch {
      toast.error('Errore');
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifiche</h1>
          {unreadCount > 0 && (
            <span className="badge-red">{unreadCount} non lette</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <select value={filter} onChange={e => setFilter(e.target.value as any)} className="select w-auto">
            <option value="">Tutte</option>
            <option value="false">Non lette</option>
            <option value="true">Lette</option>
          </select>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead} className="btn-secondary btn-sm">
              <CheckCheck className="w-4 h-4" /> Segna tutte lette
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card p-4">
              <div className="skeleton h-5 w-3/4 mb-2" />
              <div className="skeleton h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-8 h-8" />}
          title="Nessuna notifica"
          description="Le notifiche di scorte basse appariranno qui"
        />
      ) : (
        <div className="space-y-2">
          {notifications.map(notif => (
            <div
              key={notif.id}
              className={cn(
                'card p-4 flex items-start gap-3 transition-colors',
                !notif.read && 'border-l-4 border-l-yellow-400 bg-yellow-50/50 dark:bg-yellow-900/10'
              )}
            >
              <div className="w-10 h-10 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn('text-sm', !notif.read ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300')}>
                  {notif.message}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(notif.createdAt)}</span>
                  {notif.product && (
                    <Link to={`/prodotti/${notif.product.id}`} className="text-xs text-primary-600 dark:text-primary-400 hover:underline">
                      Vai al prodotto
                    </Link>
                  )}
                  {notif.sentViaEmail && <span className="badge-gray text-[10px]">Email</span>}
                  {notif.sentViaTelegram && <span className="badge-gray text-[10px]">Telegram</span>}
                </div>
              </div>
              {!notif.read && (
                <button onClick={() => handleMarkRead(notif.id)} className="btn-ghost btn-icon flex-shrink-0" title="Segna come letta">
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
