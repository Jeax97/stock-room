import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/services/api';
import { Category } from '@/types';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const fetch = () => {
    getCategories().then(setCategories).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      await createCategory(newName.trim());
      setNewName('');
      toast.success('Categoria creata');
      fetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Errore');
    }
  };

  const handleUpdate = async () => {
    if (!editId || !editName.trim()) return;
    try {
      await updateCategory(editId, editName.trim());
      setEditId(null);
      toast.success('Categoria aggiornata');
      fetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Errore');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCategory(deleteTarget.id);
      setDeleteTarget(null);
      toast.success('Categoria eliminata');
      fetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Errore');
    }
  };

  return (
    <div className="card">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Gestione Categorie</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Crea, modifica o elimina le categorie dei prodotti</p>
      </div>

      {/* Create New */}
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-800/30">
        <div className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
            className="input flex-1"
            placeholder="Nome nuova categoria..."
          />
          <button onClick={handleCreate} className="btn-primary" disabled={!newName.trim()}>
            <Plus className="w-4 h-4" /> Aggiungi
          </button>
        </div>
      </div>

      {/* List */}
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="px-6 py-4">
              <div className="skeleton h-5 w-48" />
            </div>
          ))
        ) : categories.length === 0 ? (
          <p className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">Nessuna categoria</p>
        ) : (
          categories.map(cat => (
            <div key={cat.id} className="px-6 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/30">
              {editId === cat.id ? (
                <>
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleUpdate(); if (e.key === 'Escape') setEditId(null); }}
                    className="input flex-1"
                    autoFocus
                  />
                  <button onClick={handleUpdate} className="btn-ghost btn-icon text-green-600"><Save className="w-4 h-4" /></button>
                  <button onClick={() => setEditId(null)} className="btn-ghost btn-icon"><X className="w-4 h-4" /></button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm font-medium text-gray-900 dark:text-white">{cat.name}</span>
                  <span className="badge-gray">{cat._count?.products || 0} prodotti</span>
                  <button onClick={() => { setEditId(cat.id); setEditName(cat.name); }} className="btn-ghost btn-icon"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => setDeleteTarget(cat)} className="btn-ghost btn-icon text-red-500"><Trash2 className="w-4 h-4" /></button>
                </>
              )}
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Elimina Categoria"
        message={`Eliminare la categoria "${deleteTarget?.name}"? Le subcategorie associate verranno eliminate.`}
      />
    </div>
  );
}
