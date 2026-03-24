import { useState } from 'react';
import { FileSpreadsheet, FileText, File } from 'lucide-react';
import toast from 'react-hot-toast';
import { exportCSV, exportExcel, exportPDF } from '@/services/api';
import { downloadBlob } from '@/lib/utils';

export default function ExportPanel() {
  const [exporting, setExporting] = useState('');

  const handleExport = async (type: 'csv' | 'excel' | 'pdf') => {
    setExporting(type);
    try {
      let blob: Blob;
      let filename: string;
      switch (type) {
        case 'csv':
          blob = await exportCSV();
          filename = 'magazzino.csv';
          break;
        case 'excel':
          blob = await exportExcel();
          filename = 'magazzino.xlsx';
          break;
        case 'pdf':
          blob = await exportPDF();
          filename = 'magazzino.pdf';
          break;
      }
      downloadBlob(blob, filename);
      toast.success('File esportato');
    } catch {
      toast.error('Errore durante l\'esportazione');
    } finally {
      setExporting('');
    }
  };

  return (
    <div className="card">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Esporta Dati</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Scarica l'inventario completo del magazzino</p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => handleExport('csv')}
            disabled={!!exporting}
            className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600
              hover:border-primary-400 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10
              transition-all duration-200 group"
          >
            <FileText className="w-10 h-10 text-green-600 group-hover:scale-110 transition-transform" />
            <div className="text-center">
              <p className="font-semibold text-gray-900 dark:text-white">CSV</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Compatibile con Excel</p>
            </div>
            {exporting === 'csv' && <span className="text-xs text-primary-600">Esportazione...</span>}
          </button>

          <button
            onClick={() => handleExport('excel')}
            disabled={!!exporting}
            className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600
              hover:border-primary-400 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10
              transition-all duration-200 group"
          >
            <FileSpreadsheet className="w-10 h-10 text-blue-600 group-hover:scale-110 transition-transform" />
            <div className="text-center">
              <p className="font-semibold text-gray-900 dark:text-white">Excel</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Formato .xlsx</p>
            </div>
            {exporting === 'excel' && <span className="text-xs text-primary-600">Esportazione...</span>}
          </button>

          <button
            onClick={() => handleExport('pdf')}
            disabled={!!exporting}
            className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600
              hover:border-primary-400 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10
              transition-all duration-200 group"
          >
            <File className="w-10 h-10 text-red-600 group-hover:scale-110 transition-transform" />
            <div className="text-center">
              <p className="font-semibold text-gray-900 dark:text-white">PDF</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Report stampabile</p>
            </div>
            {exporting === 'pdf' && <span className="text-xs text-primary-600">Esportazione...</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
