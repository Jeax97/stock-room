import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from '@/services/api';
import { Supplier } from '@/types';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function SupplierManager() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [newContact, setNewContact] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editContact, setEditContact] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Supplier | null>(null);

  const fetch = () => { getSuppliers().then(setSuppliers).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(() => { fetch(); }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      await createSupplier({ name: newName.trim(), contactInfo: newContact.trim() || undefined });
      setNewName(''); setNewContact('');
      toast.success('Fornitore creato');
      fetch();
    } catch (err: any) { toast.error(err?.response?.data?.error || 'Errore'); }
  };

  const handleUpdate = async () => {
    if (!editId || !editName.trim()) return;
    try {
      await updateSupplier(editId, { name: editName.trim(), contactInfo: editContact.trim() || undefined });
      setEditId(null);
      toast.success('Fornitore aggiornato');
      fetch();
    } catch (err: any) { toast.error(err?.response?.data?.error || 'Errore'); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteSupplier(deleteTarget.id);
      setDeleteTarget(null);
      toast.success('Fornitore eliminato');
      fetch();
    } catch (err: any) { toast.error(err?.response?.data?.error || 'Errore'); }
  };

  return (
    <div className="card">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Gestione Fornitori</h2>
      </div>

      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-800/30 space-y-2">
        <div className="flex gap-2">
          <input type="text" value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCreate()} className="input flex-1" placeholder="Nome fornitore..." />
          <button onClick={handleCreate} className="btn-primary" disabled={!newName.trim()}>
            <Plus className="w-4 h-4" /> Aggiungi
          </button>
        </div>
        <input type="text" value={newContact} onChange={e => setNewContact(e.target.value)} className="input" placeholder="Info contatto (email, telefono...)" />
      </div>

      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="px-6 py-4"><div className="skeleton h-5 w-48" /></div>)
        ) : suppliers.length === 0 ? (
          <p className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">Nessun fornitore</p>
        ) : (
          suppliers.map(sup => (
            <div key={sup.id} className="px-6 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/30">
              {editId === sup.id ? (
                <>
                  <div className="flex-1 space-y-2">
                    <input type="text" value={editName} onChange={e => setEditName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleUpdate(); if (e.key === 'Escape') setEditId(null); }} className="input" autoFocus />
                    <input type="text" value={editContact} onChange={e => setEditContact(e.target.value)} className="input" placeholder="Info contatto" />
                  </div>
                  <button onClick={handleUpdate} className="btn-ghost btn-icon text-green-600"><Save className="w-4 h-4" /></button>
                  <button onClick={() => setEditId(null)} className="btn-ghost btn-icon"><X className="w-4 h-4" /></button>
                </>
              ) : (
                <>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{sup.name}</p>
                    {sup.contactInfo && <p className="text-xs text-gray-500 dark:text-gray-400">{sup.contactInfo}</p>}
                  </div>
                  <span className="badge-gray">{sup._count?.products || 0} prodotti</span>
                  <button onClick={() => { setEditId(sup.id); setEditName(sup.name); setEditContact(sup.contactInfo || ''); }} className="btn-ghost btn-icon"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => setDeleteTarget(sup)} className="btn-ghost btn-icon text-red-500"><Trash2 className="w-4 h-4" /></button>
                </>
              )}
            </div>
          ))
        )}
      </div>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Elimina Fornitore" message={`Eliminare "${deleteTarget?.name}"?`} />
    </div>
  );
}
