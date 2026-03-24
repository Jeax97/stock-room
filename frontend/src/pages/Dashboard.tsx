import { useEffect, useState } from 'react';
import { Package, AlertTriangle, Layers, Euro, ArrowDownCircle, ArrowUpCircle, RefreshCw } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { getDashboardStats } from '@/services/api';
import { DashboardStats } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { StatCardSkeleton } from '@/components/ui/Skeleton';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#f97316', '#84cc16'];

const movementTypeLabels: Record<string, { label: string; color: string; icon: any }> = {
  IN: { label: 'Carico', color: 'text-green-600 dark:text-green-400', icon: ArrowDownCircle },
  OUT: { label: 'Scarico', color: 'text-red-600 dark:text-red-400', icon: ArrowUpCircle },
  ADJUSTMENT: { label: 'Rettifica', color: 'text-blue-600 dark:text-blue-400', icon: RefreshCw },
};

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    { label: 'Prodotti Totali', value: stats.totalProducts, icon: Package, color: 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400' },
    { label: 'Scorte Basse', value: stats.lowStockCount, icon: AlertTriangle, color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
    { label: 'Categorie', value: stats.totalCategories, icon: Layers, color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
    { label: 'Valore Magazzino', value: formatCurrency(stats.totalValue), icon: Euro, color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{card.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.color}`}>
                <card.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution Chart */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Distribuzione per Categoria</h2>
          {stats.categoryDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={stats.categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="count"
                  nameKey="name"
                >
                  {stats.categoryDistribution.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                  formatter={(value: number, name: string) => [`${value} prodotti`, name]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">Nessun dato disponibile</p>
          )}
        </div>

        {/* Recent Movements */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Ultimi Movimenti</h2>
          {stats.recentMovements.length > 0 ? (
            <div className="space-y-3">
              {stats.recentMovements.map((mov) => {
                const typeInfo = movementTypeLabels[mov.type];
                const Icon = typeInfo.icon;
                return (
                  <div
                    key={mov.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50"
                  >
                    <Icon className={`w-5 h-5 flex-shrink-0 ${typeInfo.color}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {mov.product?.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {typeInfo.label}: {mov.quantity} &middot; {formatDate(mov.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {mov.newQuantity}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">Nessun movimento recente</p>
          )}
        </div>
      </div>
    </div>
  );
}
