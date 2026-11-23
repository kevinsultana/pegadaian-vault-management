import React, { Suspense } from 'react';
import MasterLemariLaciView from '@/components/views/MasterLemariLaciView';

export const metadata = {
  title: 'Master Lemari & Laci (Khusus Supervisor) | Pegadaian RFID System',
  description: 'Pusat kendali master lemari khazanah, manajemen kompartemen laci, dan konfigurasi dinamis slot grid',
};

export default function MasterLaciPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs font-mono text-slate-500">
          Memuat data Master Lemari &amp; Laci...
        </div>
      }
    >
      <MasterLemariLaciView />
    </Suspense>
  );
}
