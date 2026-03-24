import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Moon, Sun, Box } from 'lucide-react';
import { useThemeStore } from '@/stores/theme';
import { getUnreadCount } from '@/services/api';

export default function Header() {
  const { isDark, toggle } = useThemeStore();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    getUnreadCount().then(d => setUnread(d.count)).catch(() => {});
    const interval = setInterval(() => {
      getUnreadCount().then(d => setUnread(d.count)).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between px-4 md:px-6 py-3">
        {/* Mobile logo */}
        <div className="flex items-center gap-2 md:hidden">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <Box className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-gray-900 dark:text-white">Stock-Room</span>
        </div>

        <div className="hidden md:block" />

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button onClick={toggle} className="btn-ghost btn-icon" title={isDark ? 'Tema chiaro' : 'Tema scuro'}>
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <Link to="/notifiche" className="btn-ghost btn-icon relative">
            <Bell className="w-5 h-5" />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unread > 99 ? '99+' : unread}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
