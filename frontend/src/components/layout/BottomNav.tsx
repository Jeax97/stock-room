import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, ArrowLeftRight, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  { to: '/', icon: LayoutDashboard, label: 'Home' },
  { to: '/prodotti', icon: Package, label: 'Prodotti' },
  { to: '/movimenti', icon: ArrowLeftRight, label: 'Movimenti' },
  { to: '/admin', icon: Settings, label: 'Admin' },
];

export default function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 safe-area-bottom">
      <div className="flex items-center justify-around py-2">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-colors',
                isActive
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-500 dark:text-gray-400'
              )
            }
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
