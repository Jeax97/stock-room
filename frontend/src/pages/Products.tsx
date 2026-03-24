import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, ScanBarcode, Filter, X, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { getProducts, getCategories, getSubcategories as getSubcategoriesApi, getLocations, deleteProduct as deleteProductApi } from '@/services/api';
import { Product, Category, Subcategory, Location } from '@/types';
import ProductPhoto from '@/components/ui/ProductPhoto';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import ProductFormModal from '@/components/products/ProductFormModal';
import BarcodeScanner from '@/components/products/BarcodeScanner';
import { cn } from '@/lib/utils';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      const params: Record<string, any> = {};
      if (search) params.search = search;
      if (categoryId) params.categoryId = categoryId;
      if (subcategoryId) params.subcategoryId = subcategoryId;
      if (locationId) params.locationId = locationId;
      const data = await getProducts(params);
      setProducts(data.products);
    } catch {
      toast.error('Errore nel caricamento dei prodotti');
    } finally {
      setLoading(false);
    }
  }, [search, categoryId, subcategoryId, locationId]);

  useEffect(() => {
    Promise.all([
      getCategories().then(setCategories),
      getLocations().then(setLocations),
    ]).catch(() => {});
  }, []);

  useEffect(() => {
    if (categoryId) {
      getSubcategoriesApi(Number(categoryId)).then(setSubcategories).catch(() => {});
    } else {
      setSubcategories([]);
      setSubcategoryId('');
    }
  }, [categoryId]);

  useEffect(() => {
    const timer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteProductApi(deleteTarget.id);
      toast.success('Prodotto eliminato');
      setDeleteTarget(null);
      fetchProducts();
    } catch {
      toast.error('Errore durante l\'eliminazione');
    } finally {
      setDeleting(false);
    }
  };

  const activeFilters = [categoryId, subcategoryId, locationId].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Prodotti</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowScanner(true)} className="btn-secondary btn-sm" title="Scansiona barcode">
            <ScanBarcode className="w-4 h-4" />
            <span className="hidden sm:inline">Scansiona</span>
          </button>
          <button onClick={() => setShowForm(true)} className="btn-primary btn-sm">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nuovo</span>
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cerca prodotti..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input pl-10"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn('btn-secondary btn-icon relative', showFilters && 'bg-primary-50 border-primary-300 dark:bg-primary-900/30')}
          >
            <Filter className="w-4 h-4" />
            {activeFilters > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-600 text-white text-[10px] rounded-full flex items-center justify-center">
                {activeFilters}
              </span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <div>
              <label className="label">Categoria</label>
              <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="select">
                <option value="">Tutte</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Subcategoria</label>
              <select
                value={subcategoryId}
                onChange={e => setSubcategoryId(e.target.value)}
                className="select"
                disabled={!categoryId}
              >
                <option value="">Tutte</option>
                {subcategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Posizione</label>
              <select value={locationId} onChange={e => setLocationId(e.target.value)} className="select">
                <option value="">Tutte</option>
                {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={<Package className="w-8 h-8" />}
          title="Nessun prodotto trovato"
          description={search || activeFilters > 0 ? 'Prova a modificare i filtri di ricerca' : 'Inizia aggiungendo il tuo primo prodotto'}
          action={
            !search && activeFilters === 0 ? (
              <button onClick={() => setShowForm(true)} className="btn-primary">
                <Plus className="w-4 h-4" /> Aggiungi Prodotto
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map(product => (
            <Link
              key={product.id}
              to={`/prodotti/${product.id}`}
              className="card overflow-hidden group cursor-pointer"
            >
              <ProductPhoto photo={product.photo} name={product.name} />
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {product.category.name}
                  {product.subcategory && ` / ${product.subcategory.name}`}
                </p>
                {product.location && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    📍 {product.location.name}
                  </p>
                )}
                <div className="flex items-center justify-between mt-3">
                  <span className={cn(
                    'badge',
                    product.isLowStock ? 'badge-red' : 'badge-green'
                  )}>
                    {product.quantity} {product.unitOfMeasure.symbol}
                  </span>
                  {product.purchasePrice != null && (
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      €{product.purchasePrice.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Modals */}
      {showForm && (
        <ProductFormModal
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); fetchProducts(); }}
        />
      )}

      {showScanner && (
        <BarcodeScanner
          onClose={() => setShowScanner(false)}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Elimina Prodotto"
        message={`Sei sicuro di voler eliminare "${deleteTarget?.name}"? Questa azione è irreversibile.`}
        loading={deleting}
      />
    </div>
  );
}
