import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, ArrowDownCircle, ArrowUpCircle, RefreshCw, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { getProduct, getProductMovements, deleteProduct as deleteProductApi, uploadProductPhoto, createMovement } from '@/services/api';
import { Product, StockMovement } from '@/types';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import ProductPhoto from '@/components/ui/ProductPhoto';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import ProductFormModal from '@/components/products/ProductFormModal';
import Modal from '@/components/ui/Modal';

const movementLabels: Record<string, { label: string; color: string; icon: any }> = {
  IN: { label: 'Carico', color: 'text-green-600 dark:text-green-400', icon: ArrowDownCircle },
  OUT: { label: 'Scarico', color: 'text-red-600 dark:text-red-400', icon: ArrowUpCircle },
  ADJUSTMENT: { label: 'Rettifica', color: 'text-blue-600 dark:text-blue-400', icon: RefreshCw },
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showMovement, setShowMovement] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [movType, setMovType] = useState<'IN' | 'OUT' | 'ADJUSTMENT'>('IN');
  const [movQty, setMovQty] = useState('');
  const [movReason, setMovReason] = useState('');
  const [submittingMov, setSubmittingMov] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchData = () => {
    if (!id) return;
    Promise.all([
      getProduct(Number(id)).then(setProduct),
      getProductMovements(Number(id)).then(setMovements),
    ])
      .catch(() => toast.error('Errore nel caricamento'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleDelete = async () => {
    if (!product) return;
    setDeleting(true);
    try {
      await deleteProductApi(product.id);
      toast.success('Prodotto eliminato');
      navigate('/prodotti');
    } catch {
      toast.error('Errore durante l\'eliminazione');
    } finally {
      setDeleting(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !product) return;
    setUploading(true);
    try {
      await uploadProductPhoto(product.id, file);
      toast.success('Foto aggiornata');
      fetchData();
    } catch {
      toast.error('Errore durante l\'upload');
    } finally {
      setUploading(false);
    }
  };

  const handleMovement = async () => {
    if (!product || !movQty) return;
    setSubmittingMov(true);
    try {
      await createMovement({
        productId: product.id,
        type: movType,
        quantity: Number(movQty),
        reason: movReason || undefined,
      });
      toast.success('Movimento registrato');
      setShowMovement(false);
      setMovQty('');
      setMovReason('');
      fetchData();
    } catch {
      toast.error('Errore nella registrazione');
    } finally {
      setSubmittingMov(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-8 w-32" />
        <div className="skeleton h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Prodotto non trovato</p>
        <button onClick={() => navigate('/prodotti')} className="btn-primary mt-4">Torna ai prodotti</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back + Actions */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/prodotti')} className="btn-ghost">
          <ArrowLeft className="w-4 h-4" /> Indietro
        </button>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowMovement(true)} className="btn-primary btn-sm">
            <ArrowDownCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Movimento</span>
          </button>
          <button onClick={() => setShowEdit(true)} className="btn-secondary btn-sm">
            <Edit className="w-4 h-4" />
            <span className="hidden sm:inline">Modifica</span>
          </button>
          <button onClick={() => setShowDelete(true)} className="btn-danger btn-sm">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Product Card */}
      <div className="card overflow-hidden">
        <div className="md:flex">
          {/* Photo */}
          <div className="relative md:w-80 flex-shrink-0">
            <ProductPhoto photo={product.photo} name={product.name} size="lg" className="md:rounded-none md:h-full" />
            <label className={cn(
              'absolute bottom-3 right-3 btn-secondary btn-sm cursor-pointer',
              uploading && 'opacity-50 pointer-events-none'
            )}>
              <Upload className="w-4 h-4" />
              {uploading ? 'Caricamento...' : 'Carica foto'}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Details */}
          <div className="p-6 flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{product.name}</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  {product.category.name}
                  {product.subcategory && ` / ${product.subcategory.name}`}
                </p>
              </div>
              <span className={cn('badge text-base px-3 py-1', product.isLowStock ? 'badge-red' : 'badge-green')}>
                {product.quantity} {product.unitOfMeasure.symbol}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              {product.location && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Posizione</p>
                  <p className="font-medium text-gray-900 dark:text-white mt-0.5">{product.location.name}</p>
                </div>
              )}
              {product.supplier && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fornitore</p>
                  <p className="font-medium text-gray-900 dark:text-white mt-0.5">{product.supplier.name}</p>
                </div>
              )}
              {product.purchasePrice != null && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Prezzo Acquisto</p>
                  <p className="font-medium text-gray-900 dark:text-white mt-0.5">{formatCurrency(product.purchasePrice)}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Soglia Scorta</p>
                <p className="font-medium text-gray-900 dark:text-white mt-0.5">{product.lowStockThreshold} {product.unitOfMeasure.symbol}</p>
              </div>
              {product.barcode && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Barcode</p>
                  <p className="font-mono text-sm text-gray-900 dark:text-white mt-0.5">{product.barcode}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Unità</p>
                <p className="font-medium text-gray-900 dark:text-white mt-0.5">{product.unitOfMeasure.name}</p>
              </div>
            </div>

            {product.link && (
              <div className="mt-6">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Link</p>
                <a href={product.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline mt-1 inline-block break-all">{product.link}</a>
              </div>
            )}

            {product.notes && (
              <div className="mt-6">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Note</p>
                <p className="text-gray-700 dark:text-gray-300 mt-1 whitespace-pre-wrap">{product.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Movement History */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Storico Movimenti</h2>
        </div>
        {movements.length > 0 ? (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {movements.map(mov => {
              const info = movementLabels[mov.type];
              const Icon = info.icon;
              return (
                <div key={mov.id} className="flex items-center gap-3 px-6 py-3">
                  <Icon className={`w-5 h-5 flex-shrink-0 ${info.color}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {info.label}: {mov.quantity} unità
                    </p>
                    {mov.reason && <p className="text-xs text-gray-500 dark:text-gray-400">{mov.reason}</p>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {mov.previousQuantity} → {mov.newQuantity}
                    </p>
                    <p className="text-xs text-gray-400">{formatDate(mov.createdAt)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">Nessun movimento registrato</p>
        )}
      </div>

      {/* Movement Modal */}
      <Modal isOpen={showMovement} onClose={() => setShowMovement(false)} title="Nuovo Movimento" size="sm">
        <div className="space-y-4">
          <div>
            <label className="label">Tipo</label>
            <select value={movType} onChange={e => setMovType(e.target.value as any)} className="select">
              <option value="IN">Carico (+)</option>
              <option value="OUT">Scarico (-)</option>
              <option value="ADJUSTMENT">Rettifica (=)</option>
            </select>
          </div>
          <div>
            <label className="label">Quantità</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={movQty}
              onChange={e => setMovQty(e.target.value)}
              className="input"
              placeholder={movType === 'ADJUSTMENT' ? 'Nuova quantità' : 'Quantità da aggiungere/rimuovere'}
            />
          </div>
          <div>
            <label className="label">Motivo (opzionale)</label>
            <input
              type="text"
              value={movReason}
              onChange={e => setMovReason(e.target.value)}
              className="input"
              placeholder="es. Vendita, Reso, Inventario..."
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowMovement(false)} className="btn-secondary flex-1">Annulla</button>
            <button onClick={handleMovement} className="btn-primary flex-1" disabled={!movQty || submittingMov}>
              {submittingMov ? 'Salvataggio...' : 'Conferma'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      {showEdit && (
        <ProductFormModal
          product={product}
          onClose={() => setShowEdit(false)}
          onSaved={() => { setShowEdit(false); fetchData(); }}
        />
      )}

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Elimina Prodotto"
        message={`Sei sicuro di voler eliminare "${product.name}"? Tutti i movimenti associati verranno eliminati.`}
        loading={deleting}
      />
    </div>
  );
}
