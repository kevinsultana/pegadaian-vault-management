import React, { Suspense } from 'react';
import DrawerMonitorView from '@/components/views/DrawerMonitorView';

export const metadata = {
  title: 'Monitoring Lemari & Laci | Pegadaian RFID System',
  description: 'Deteksi real-time matriks 12 laci lemari emas LT-01 dan inventori fisik',
};

export default function LemariLaciPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs font-mono text-slate-500">
          Memuat data deteksi sensor laci LT-01...
        </div>
      }
    >
      <DrawerMonitorView />
    </Suspense>
  );
}
