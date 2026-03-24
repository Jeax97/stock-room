import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { getCategories, getSubcategories, createSubcategory, updateSubcategory, deleteSubcategory } from '@/services/api';
import { Category, Subcategory } from '@/types';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function SubcategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCatId, setSelectedCatId] = useState('');
  const [newName, setNewName] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Subcategory | null>(null);

  useEffect(() => { getCategories().then(setCategories).catch(() => {}); }, []);

  const fetchSubs = () => {
    const catId = selectedCatId ? Number(selectedCatId) : undefined;
    getSubcategories(catId).then(setSubcategories).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { setLoading(true); fetchSubs(); }, [selectedCatId]);

  const handleCreate = async () => {
    if (!newName.trim() || !selectedCatId) return toast.error('Seleziona una categoria');
    try {
      await createSubcategory(newName.trim(), Number(selectedCatId));
      setNewName('');
      toast.success('Subcategoria creata');
      fetchSubs();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Errore');
    }
  };

  const handleUpdate = async () => {
    if (!editId || !editName.trim()) return;
    try {
      await updateSubcategory(editId, { name: editName.trim() });
      setEditId(null);
      toast.success('Subcategoria aggiornata');
      fetchSubs();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Errore');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteSubcategory(deleteTarget.id);
      setDeleteTarget(null);
      toast.success('Subcategoria eliminata');
      fetchSubs();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Errore');
    }
  };

  return (
    <div className="card">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Gestione Subcategorie</h2>
      </div>

      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-800/30 space-y-3">
        <select value={selectedCatId} onChange={e => setSelectedCatId(e.target.value)} className="select">
          <option value="">Tutte le categorie</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {selectedCatId && (
          <div className="flex gap-2">
            <input type="text" value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCreate()} className="input flex-1" placeholder="Nome nuova subcategoria..." />
            <button onClick={handleCreate} className="btn-primary" disabled={!newName.trim()}>
              <Plus className="w-4 h-4" /> Aggiungi
            </button>
          </div>
        )}
      </div>

      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="px-6 py-4"><div className="skeleton h-5 w-48" /></div>)
        ) : subcategories.length === 0 ? (
          <p className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
            {selectedCatId ? 'Nessuna subcategoria per questa categoria' : 'Seleziona una categoria per vedere le subcategorie'}
          </p>
        ) : (
          subcategories.map(sub => (
            <div key={sub.id} className="px-6 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/30">
              {editId === sub.id ? (
                <>
                  <input type="text" value={editName} onChange={e => setEditName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleUpdate(); if (e.key === 'Escape') setEditId(null); }} className="input flex-1" autoFocus />
                  <button onClick={handleUpdate} className="btn-ghost btn-icon text-green-600"><Save className="w-4 h-4" /></button>
                  <button onClick={() => setEditId(null)} className="btn-ghost btn-icon"><X className="w-4 h-4" /></button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm font-medium text-gray-900 dark:text-white">{sub.name}</span>
                  {sub.category && <span className="badge-blue text-xs">{sub.category.name}</span>}
                  <span className="badge-gray">{sub._count?.products || 0} prodotti</span>
                  <button onClick={() => { setEditId(sub.id); setEditName(sub.name); }} className="btn-ghost btn-icon"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => setDeleteTarget(sub)} className="btn-ghost btn-icon text-red-500"><Trash2 className="w-4 h-4" /></button>
                </>
              )}
            </div>
          ))
        )}
      </div>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Elimina Subcategoria" message={`Eliminare "${deleteTarget?.name}"?`} />
    </div>
  );
}
