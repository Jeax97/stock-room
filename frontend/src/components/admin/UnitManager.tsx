import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { getUnits, createUnit, updateUnit, deleteUnit } from '@/services/api';
import { UnitOfMeasure } from '@/types';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function UnitManager() {
  const [units, setUnits] = useState<UnitOfMeasure[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [newSymbol, setNewSymbol] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editSymbol, setEditSymbol] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<UnitOfMeasure | null>(null);

  const fetch = () => { getUnits().then(setUnits).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(() => { fetch(); }, []);

  const handleCreate = async () => {
    if (!newName.trim() || !newSymbol.trim()) return toast.error('Nome e simbolo obbligatori');
    try {
      await createUnit({ name: newName.trim(), symbol: newSymbol.trim() });
      setNewName(''); setNewSymbol('');
      toast.success('Unità creata');
      fetch();
    } catch (err: any) { toast.error(err?.response?.data?.error || 'Errore'); }
  };

  const handleUpdate = async () => {
    if (!editId || !editName.trim() || !editSymbol.trim()) return;
    try {
      await updateUnit(editId, { name: editName.trim(), symbol: editSymbol.trim() });
      setEditId(null);
      toast.success('Unità aggiornata');
      fetch();
    } catch (err: any) { toast.error(err?.response?.data?.error || 'Errore'); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteUnit(deleteTarget.id);
      setDeleteTarget(null);
      toast.success('Unità eliminata');
      fetch();
    } catch (err: any) { toast.error(err?.response?.data?.error || 'Errore'); }
  };

  return (
    <div className="card">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Gestione Unità di Misura</h2>
      </div>

      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-800/30">
        <div className="flex gap-2">
          <input type="text" value={newName} onChange={e => setNewName(e.target.value)} className="input flex-1" placeholder="Nome (es. Kilogrammi)" />
          <input type="text" value={newSymbol} onChange={e => setNewSymbol(e.target.value)} className="input w-24" placeholder="Simbolo (es. kg)" onKeyDown={e => e.key === 'Enter' && handleCreate()} />
          <button onClick={handleCreate} className="btn-primary" disabled={!newName.trim() || !newSymbol.trim()}>
            <Plus className="w-4 h-4" /> Aggiungi
          </button>
        </div>
      </div>

      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="px-6 py-4"><div className="skeleton h-5 w-48" /></div>)
        ) : units.map(unit => (
          <div key={unit.id} className="px-6 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/30">
            {editId === unit.id ? (
              <>
                <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="input flex-1" autoFocus />
                <input type="text" value={editSymbol} onChange={e => setEditSymbol(e.target.value)} className="input w-24" onKeyDown={e => { if (e.key === 'Enter') handleUpdate(); if (e.key === 'Escape') setEditId(null); }} />
                <button onClick={handleUpdate} className="btn-ghost btn-icon text-green-600"><Save className="w-4 h-4" /></button>
                <button onClick={() => setEditId(null)} className="btn-ghost btn-icon"><X className="w-4 h-4" /></button>
              </>
            ) : (
              <>
                <span className="flex-1 text-sm font-medium text-gray-900 dark:text-white">{unit.name}</span>
                <span className="badge-blue">{unit.symbol}</span>
                <span className="badge-gray">{unit._count?.products || 0} prodotti</span>
                <button onClick={() => { setEditId(unit.id); setEditName(unit.name); setEditSymbol(unit.symbol); }} className="btn-ghost btn-icon"><Edit className="w-4 h-4" /></button>
                <button onClick={() => setDeleteTarget(unit)} className="btn-ghost btn-icon text-red-500"><Trash2 className="w-4 h-4" /></button>
              </>
            )}
          </div>
        ))}
      </div>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Elimina Unità" message={`Eliminare "${deleteTarget?.name}"?`} />
    </div>
  );
}
