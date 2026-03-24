import { useState } from 'react';
import { Layers, MapPin, Ruler, Truck, Settings, FileDown, FolderTree } from 'lucide-react';
import { cn } from '@/lib/utils';
import CategoryManager from '@/components/admin/CategoryManager';
import SubcategoryManager from '@/components/admin/SubcategoryManager';
import LocationManager from '@/components/admin/LocationManager';
import UnitManager from '@/components/admin/UnitManager';
import SupplierManager from '@/components/admin/SupplierManager';
import SettingsPanel from '@/components/admin/SettingsPanel';
import ExportPanel from '@/components/admin/ExportPanel';

const tabs = [
  { id: 'categories', label: 'Categorie', icon: Layers },
  { id: 'subcategories', label: 'Subcategorie', icon: FolderTree },
  { id: 'locations', label: 'Posizioni', icon: MapPin },
  { id: 'units', label: 'Unità Misura', icon: Ruler },
  { id: 'suppliers', label: 'Fornitori', icon: Truck },
  { id: 'settings', label: 'Impostazioni', icon: Settings },
  { id: 'export', label: 'Export Dati', icon: FileDown },
];

export default function Admin() {
  const [activeTab, setActiveTab] = useState('categories');

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pannello Admin</h1>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl no-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            )}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'categories' && <CategoryManager />}
        {activeTab === 'subcategories' && <SubcategoryManager />}
        {activeTab === 'locations' && <LocationManager />}
        {activeTab === 'units' && <UnitManager />}
        {activeTab === 'suppliers' && <SupplierManager />}
        {activeTab === 'settings' && <SettingsPanel />}
        {activeTab === 'export' && <ExportPanel />}
      </div>
    </div>
  );
}
