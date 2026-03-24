import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useThemeStore } from '@/stores/theme';
import { useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import Dashboard from '@/pages/Dashboard';
import Products from '@/pages/Products';
import ProductDetail from '@/pages/ProductDetail';
import Movements from '@/pages/Movements';
import Admin from '@/pages/Admin';
import Notifications from '@/pages/Notifications';

export default function App() {
  const isDark = useThemeStore((s) => s.isDark);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '12px',
            background: isDark ? '#1f2937' : '#fff',
            color: isDark ? '#f3f4f6' : '#111827',
            border: isDark ? '1px solid #374151' : '1px solid #e5e7eb',
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="prodotti" element={<Products />} />
          <Route path="prodotti/:id" element={<ProductDetail />} />
          <Route path="movimenti" element={<Movements />} />
          <Route path="admin" element={<Admin />} />
          <Route path="notifiche" element={<Notifications />} />
        </Route>
      </Routes>
    </>
  );
}
