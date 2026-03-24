import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Camera } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import toast from 'react-hot-toast';
import { getProductByBarcode } from '@/services/api';

interface Props {
  onClose: () => void;
}

export default function BarcodeScanner({ onClose }: Props) {
  const navigate = useNavigate();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const scanner = new Html5Qrcode('barcode-reader');
    scannerRef.current = scanner;

    scanner.start(
      { facingMode: 'environment' },
      {
        fps: 10,
        qrbox: { width: 280, height: 150 },
        aspectRatio: 1.0,
      },
      async (decodedText) => {
        scanner.stop().catch(() => {});
        try {
          const product = await getProductByBarcode(decodedText);
          toast.success(`Trovato: ${product.name}`);
          onClose();
          navigate(`/prodotti/${product.id}`);
        } catch {
          toast.error(`Nessun prodotto con barcode: ${decodedText}`);
          // Restart scanner
          try {
            await scanner.start(
              { facingMode: 'environment' },
              { fps: 10, qrbox: { width: 280, height: 150 }, aspectRatio: 1.0 },
              () => {},
              () => {}
            );
          } catch {
            setError('Impossibile riavviare la fotocamera');
          }
        }
      },
      () => {} // ignore scan errors
    ).catch((err) => {
      setError('Impossibile accedere alla fotocamera. Assicurati di aver concesso i permessi.');
      console.error('Scanner error:', err);
    });

    return () => {
      scanner.stop().catch(() => {});
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/80 z-10">
        <div className="flex items-center gap-2 text-white">
          <Camera className="w-5 h-5" />
          <span className="font-medium">Scansiona Barcode</span>
        </div>
        <button onClick={onClose} className="text-white p-2 hover:bg-white/10 rounded-lg">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scanner Area */}
      <div className="flex-1 flex items-center justify-center" ref={containerRef}>
        <div id="barcode-reader" className="w-full max-w-md" />
      </div>

      {error && (
        <div className="p-4 bg-red-500/90 text-white text-center">
          <p>{error}</p>
          <button onClick={onClose} className="mt-2 underline">Chiudi</button>
        </div>
      )}

      <div className="p-4 bg-black/80 text-center text-white/70 text-sm">
        Inquadra il codice a barre del prodotto
      </div>
    </div>
  );
}
