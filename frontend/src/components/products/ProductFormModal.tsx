import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Upload, Camera } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import {
  getCategories, getSubcategories, getLocations, getUnits, getSuppliers,
  createProduct, updateProduct, uploadProductPhoto,
  createCategory as createCatApi, createSubcategory as createSubcatApi,
  createLocation as createLocApi,
} from '@/services/api';
import { Product, Category, Subcategory, Location, UnitOfMeasure, Supplier } from '@/types';
import { getPhotoUrl } from '@/lib/utils';

interface Props {
  product?: Product;
  onClose: () => void;
  onSaved: () => void;
}

export default function ProductFormModal({ product, onClose, onSaved }: Props) {
  const isEdit = !!product;

  const [form, setForm] = useState({
    name: product?.name || '',
    categoryId: product?.categoryId?.toString() || '',
    subcategoryId: product?.subcategoryId?.toString() || '',
    locationId: product?.locationId?.toString() || '',
    supplierId: product?.supplierId?.toString() || '',
    unitOfMeasureId: product?.unitOfMeasureId?.toString() || '',
    quantity: product?.quantity?.toString() || '0',
    purchasePrice: product?.purchasePrice?.toString() || '',
    lowStockThreshold: product?.lowStockThreshold?.toString() || '5',
    barcode: product?.barcode || '',
    link: product?.link || '',
    notes: product?.notes || '',
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [subcats, setSubcats] = useState<Subcategory[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [units, setUnits] = useState<UnitOfMeasure[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(getPhotoUrl(product?.photo) || null);
  const [saving, setSaving] = useState(false);

  // Quick-add states
  const [newCatName, setNewCatName] = useState('');
  const [newSubcatName, setNewSubcatName] = useState('');
  const [newLocName, setNewLocName] = useState('');
  const [showNewCat, setShowNewCat] = useState(false);
  const [showNewSubcat, setShowNewSubcat] = useState(false);
  const [showNewLoc, setShowNewLoc] = useState(false);

  useEffect(() => {
    Promise.all([
      getCategories().then(setCategories),
      getLocations().then(setLocations),
      getUnits().then(setUnits),
      getSuppliers().then(setSuppliers),
    ]).catch(() => {});
  }, []);

  useEffect(() => {
    if (form.categoryId) {
      getSubcategories(Number(form.categoryId)).then(setSubcats).catch(() => {});
    } else {
      setSubcats([]);
    }
  }, [form.categoryId]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const update = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async () => {
    if (!form.name.trim()) return toast.error('Il nome è obbligatorio');
    if (!form.categoryId) return toast.error('Seleziona una categoria');
    if (!form.unitOfMeasureId) return toast.error('Seleziona un\'unità di misura');

    setSaving(true);
    try {
      const data = {
        name: form.name.trim(),
        categoryId: Number(form.categoryId),
        subcategoryId: form.subcategoryId ? Number(form.subcategoryId) : null,
        locationId: form.locationId ? Number(form.locationId) : null,
        supplierId: form.supplierId ? Number(form.supplierId) : null,
        unitOfMeasureId: Number(form.unitOfMeasureId),
        quantity: Number(form.quantity) || 0,
        purchasePrice: form.purchasePrice ? Number(form.purchasePrice) : null,
        lowStockThreshold: Number(form.lowStockThreshold) || 5,
        barcode: form.barcode.trim() || null,
        link: form.link.trim() || null,
        notes: form.notes.trim() || null,
      };

      let saved: Product;
      if (isEdit) {
        saved = await updateProduct(product!.id, data);
      } else {
        saved = await createProduct(data);
      }

      // Upload photo if selected
      if (photoFile) {
        await uploadProductPhoto(saved.id, photoFile);
      }

      toast.success(isEdit ? 'Prodotto aggiornato' : 'Prodotto creato');
      onSaved();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Errore nel salvataggio');
    } finally {
      setSaving(false);
    }
  };

  const quickAddCategory = async () => {
    if (!newCatName.trim()) return;
    try {
      const cat = await createCatApi(newCatName.trim());
      setCategories(prev => [...prev, cat]);
      update('categoryId', cat.id.toString());
      setNewCatName('');
      setShowNewCat(false);
      toast.success('Categoria creata');
    } catch {
      toast.error('Errore nella creazione');
    }
  };

  const quickAddSubcategory = async () => {
    if (!newSubcatName.trim() || !form.categoryId) return;
    try {
      const sub = await createSubcatApi(newSubcatName.trim(), Number(form.categoryId));
      setSubcats(prev => [...prev, sub]);
      update('subcategoryId', sub.id.toString());
      setNewSubcatName('');
      setShowNewSubcat(false);
      toast.success('Subcategoria creata');
    } catch {
      toast.error('Errore nella creazione');
    }
  };

  const quickAddLocation = async () => {
    if (!newLocName.trim()) return;
    try {
      const loc = await createLocApi({ name: newLocName.trim() });
      setLocations(prev => [...prev, loc]);
      update('locationId', loc.id.toString());
      setNewLocName('');
      setShowNewLoc(false);
      toast.success('Posizione creata');
    } catch {
      toast.error('Errore nella creazione');
    }
  };

  return (
    <Modal isOpen onClose={onClose} title={isEdit ? 'Modifica Prodotto' : 'Nuovo Prodotto'} size="lg">
      <div className="space-y-4">
        {/* Photo Upload */}
        <div>
          <label className="label">Foto</label>
          <div className="flex items-center gap-4">
            {photoPreview ? (
              <img src={photoPreview} alt="Preview" className="w-24 h-24 object-cover rounded-xl border" />
            ) : (
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                <Camera className="w-8 h-8 text-gray-400" />
              </div>
            )}
            <div className="flex flex-col gap-2">
              <label className="btn-secondary btn-sm cursor-pointer">
                <Upload className="w-4 h-4" /> Carica da file
                <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              </label>
              <label className="btn-secondary btn-sm cursor-pointer">
                <Camera className="w-4 h-4" /> Scatta foto
                <input type="file" accept="image/*" capture="environment" onChange={handlePhotoChange} className="hidden" />
              </label>
            </div>
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="label">Nome *</label>
          <input type="text" value={form.name} onChange={e => update('name', e.target.value)} className="input" placeholder="Nome del prodotto" />
        </div>

        {/* Category + Subcategory */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Categoria *</label>
            <div className="flex gap-2">
              <select value={form.categoryId} onChange={e => update('categoryId', e.target.value)} className="select flex-1">
                <option value="">Seleziona...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <button type="button" onClick={() => setShowNewCat(!showNewCat)} className="btn-secondary btn-icon flex-shrink-0" title="Nuova categoria">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {showNewCat && (
              <div className="flex gap-2 mt-2">
                <input type="text" value={newCatName} onChange={e => setNewCatName(e.target.value)} className="input flex-1" placeholder="Nome categoria"
                  onKeyDown={e => e.key === 'Enter' && quickAddCategory()} />
                <button onClick={quickAddCategory} className="btn-primary btn-sm">Crea</button>
              </div>
            )}
          </div>
          <div>
            <label className="label">Subcategoria</label>
            <div className="flex gap-2">
              <select value={form.subcategoryId} onChange={e => update('subcategoryId', e.target.value)} className="select flex-1" disabled={!form.categoryId}>
                <option value="">Nessuna</option>
                {subcats.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <button type="button" onClick={() => setShowNewSubcat(!showNewSubcat)} className="btn-secondary btn-icon flex-shrink-0" title="Nuova subcategoria" disabled={!form.categoryId}>
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {showNewSubcat && form.categoryId && (
              <div className="flex gap-2 mt-2">
                <input type="text" value={newSubcatName} onChange={e => setNewSubcatName(e.target.value)} className="input flex-1" placeholder="Nome subcategoria"
                  onKeyDown={e => e.key === 'Enter' && quickAddSubcategory()} />
                <button onClick={quickAddSubcategory} className="btn-primary btn-sm">Crea</button>
              </div>
            )}
          </div>
        </div>

        {/* Location + Supplier */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Posizione</label>
            <div className="flex gap-2">
              <select value={form.locationId} onChange={e => update('locationId', e.target.value)} className="select flex-1">
                <option value="">Nessuna</option>
                {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
              <button type="button" onClick={() => setShowNewLoc(!showNewLoc)} className="btn-secondary btn-icon flex-shrink-0" title="Nuova posizione">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {showNewLoc && (
              <div className="flex gap-2 mt-2">
                <input type="text" value={newLocName} onChange={e => setNewLocName(e.target.value)} className="input flex-1" placeholder="Nome posizione"
                  onKeyDown={e => e.key === 'Enter' && quickAddLocation()} />
                <button onClick={quickAddLocation} className="btn-primary btn-sm">Crea</button>
              </div>
            )}
          </div>
          <div>
            <label className="label">Fornitore</label>
            <select value={form.supplierId} onChange={e => update('supplierId', e.target.value)} className="select">
              <option value="">Nessuno</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>

        {/* Quantity, Unit, Price, Threshold */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="label">{isEdit ? 'Quantità attuale' : 'Quantità iniziale'}</label>
            <input type="number" min="0" step="0.01" value={form.quantity} onChange={e => update('quantity', e.target.value)} className="input" disabled={isEdit} />
          </div>
          <div>
            <label className="label">Unità di misura *</label>
            <select value={form.unitOfMeasureId} onChange={e => update('unitOfMeasureId', e.target.value)} className="select">
              <option value="">Seleziona...</option>
              {units.map(u => <option key={u.id} value={u.id}>{u.name} ({u.symbol})</option>)}
            </select>
          </div>
          <div>
            <label className="label">Prezzo acquisto</label>
            <input type="number" min="0" step="0.01" value={form.purchasePrice} onChange={e => update('purchasePrice', e.target.value)} className="input" placeholder="€" />
          </div>
          <div>
            <label className="label">Soglia scorta</label>
            <input type="number" min="0" value={form.lowStockThreshold} onChange={e => update('lowStockThreshold', e.target.value)} className="input" />
          </div>
        </div>

        {/* Barcode */}
        <div>
          <label className="label">Barcode</label>
          <input type="text" value={form.barcode} onChange={e => update('barcode', e.target.value)} className="input" placeholder="Codice a barre (opzionale)" />
        </div>

        {/* Link */}
        <div>
          <label className="label">Link</label>
          <input type="url" value={form.link} onChange={e => update('link', e.target.value)} className="input" placeholder="https://esempio.com (opzionale)" />
        </div>

        {/* Notes */}
        <div>
          <label className="label">Note</label>
          <textarea value={form.notes} onChange={e => update('notes', e.target.value)} className="input min-h-[80px]" placeholder="Note aggiuntive..." />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="btn-secondary flex-1">Annulla</button>
          <button onClick={handleSubmit} className="btn-primary flex-1" disabled={saving}>
            {saving ? 'Salvataggio...' : isEdit ? 'Salva Modifiche' : 'Crea Prodotto'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
