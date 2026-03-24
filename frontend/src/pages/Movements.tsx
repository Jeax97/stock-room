import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownCircle, ArrowUpCircle, RefreshCw, ArrowLeftRight } from 'lucide-react';
import { getMovements } from '@/services/api';
import { StockMovement } from '@/types';
import { formatDate } from '@/lib/utils';
import { TableRowSkeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';

const movementLabels: Record<string, { label: string; badge: string; icon: any }> = {
  IN: { label: 'Carico', badge: 'badge-green', icon: ArrowDownCircle },
  OUT: { label: 'Scarico', badge: 'badge-red', icon: ArrowUpCircle },
  ADJUSTMENT: { label: 'Rettifica', badge: 'badge-blue', icon: RefreshCw },
};

export default function Movements() {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 25;

  useEffect(() => {
    setLoading(true);
    const params: Record<string, any> = { page, limit };
    if (typeFilter) params.type = typeFilter;
    getMovements(params)
      .then(data => {
        setMovements(data.movements);
        setTotal(data.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, typeFilter]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Movimenti</h1>
        <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }} className="select w-auto">
          <option value="">Tutti i tipi</option>
          <option value="IN">Carico</option>
          <option value="OUT">Scarico</option>
          <option value="ADJUSTMENT">Rettifica</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Prodotto</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tipo</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Quantità</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase hidden sm:table-cell">Motivo</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Risultato</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => <TableRowSkeleton key={i} cols={6} />)
              ) : movements.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon={<ArrowLeftRight className="w-8 h-8" />}
                      title="Nessun movimento"
                      description="I movimenti appariranno qui quando effettuerai carichi o scarichi"
                    />
                  </td>
                </tr>
              ) : (
                movements.map(mov => {
                  const info = movementLabels[mov.type];
                  const Icon = info.icon;
                  return (
                    <tr key={mov.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3">
                        <Link to={`/prodotti/${mov.productId}`} className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline">
                          {mov.product?.name || `Prodotto #${mov.productId}`}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`${info.badge} gap-1`}>
                          <Icon className="w-3 h-3" /> {info.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{mov.quantity}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 hidden sm:table-cell">{mov.reason || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-mono">{mov.previousQuantity} → {mov.newQuantity}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-right whitespace-nowrap">{formatDate(mov.createdAt)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {total} movimenti totali
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary btn-sm">
                Precedente
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {page} / {totalPages}
              </span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary btn-sm">
                Successivo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
