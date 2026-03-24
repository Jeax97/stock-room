import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { getLocations, createLocation, updateLocation, deleteLocation } from '@/services/api';
import { Location } from '@/types';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function LocationManager() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Location | null>(null);

  const fetch = () => {
    getLocations().then(setLocations).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      await createLocation({ name: newName.trim(), description: newDesc.trim() || undefined });
      setNewName(''); setNewDesc('');
      toast.success('Posizione creata');
      fetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Errore');
    }
  };

  const handleUpdate = async () => {
    if (!editId || !editName.trim()) return;
    try {
      await updateLocation(editId, { name: editName.trim(), description: editDesc.trim() || undefined });
      setEditId(null);
      toast.success('Posizione aggiornata');
      fetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Errore');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteLocation(deleteTarget.id);
      setDeleteTarget(null);
      toast.success('Posizione eliminata');
      fetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Errore');
    }
  };

  return (
    <div className="card">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Gestione Posizioni</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Dove sono collocati fisicamente i prodotti</p>
      </div>

      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-800/30 space-y-2">
        <div className="flex gap-2">
          <input type="text" value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCreate()} className="input flex-1" placeholder="Nome posizione..." />
          <button onClick={handleCreate} className="btn-primary" disabled={!newName.trim()}>
            <Plus className="w-4 h-4" /> Aggiungi
          </button>
        </div>
        <input type="text" value={newDesc} onChange={e => setNewDesc(e.target.value)} className="input" placeholder="Descrizione (opzionale)" />
      </div>

      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="px-6 py-4"><div className="skeleton h-5 w-48" /></div>)
        ) : locations.length === 0 ? (
          <p className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">Nessuna posizione</p>
        ) : (
          locations.map(loc => (
            <div key={loc.id} className="px-6 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/30">
              {editId === loc.id ? (
                <>
                  <div className="flex-1 space-y-2">
                    <input type="text" value={editName} onChange={e => setEditName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleUpdate(); if (e.key === 'Escape') setEditId(null); }} className="input" autoFocus />
                    <input type="text" value={editDesc} onChange={e => setEditDesc(e.target.value)} className="input" placeholder="Descrizione" />
                  </div>
                  <button onClick={handleUpdate} className="btn-ghost btn-icon text-green-600"><Save className="w-4 h-4" /></button>
                  <button onClick={() => setEditId(null)} className="btn-ghost btn-icon"><X className="w-4 h-4" /></button>
                </>
              ) : (
                <>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{loc.name}</p>
                    {loc.description && <p className="text-xs text-gray-500 dark:text-gray-400">{loc.description}</p>}
                  </div>
                  <span className="badge-gray">{loc._count?.products || 0} prodotti</span>
                  <button onClick={() => { setEditId(loc.id); setEditName(loc.name); setEditDesc(loc.description || ''); }} className="btn-ghost btn-icon"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => setDeleteTarget(loc)} className="btn-ghost btn-icon text-red-500"><Trash2 className="w-4 h-4" /></button>
                </>
              )}
            </div>
          ))
        )}
      </div>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Elimina Posizione" message={`Eliminare "${deleteTarget?.name}"?`} />
    </div>
  );
}
