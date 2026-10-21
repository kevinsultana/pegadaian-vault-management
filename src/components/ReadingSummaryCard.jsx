'use client';

import React from 'react';
import { useVaultStore } from '../store/useVaultStore';

export default function ReadingSummaryCard() {
  const { items, readDuration } = useVaultStore();

  const totalPhysicalItems = items.filter((it) => it.status !== 'RECONCILED_VIRT').length;
  const missingItems = items.filter((it) => it.status === 'MISSING');
  const missingCount = missingItems.length;
  const readTagsCount = totalPhysicalItems - missingCount;

  // Occupied drawers calculation
  const drawerOccupancy = new Set();
  items.forEach((it) => {
    if (it.status !== 'RECONCILED_VIRT' && it.status !== 'MISSING') {
      drawerOccupancy.add(it.drawerId);
    }
  });
  const occupiedDrawers = drawerOccupancy.size;
  const totalDrawers = 3;

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
      <h3 className="text-xs font-bold text-slate-800 tracking-wide mb-3">
        Ringkasan pembacaan
      </h3>

      <div className="space-y-3 font-sans text-xs">
        {/* Tag terbaca */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <span className="text-slate-500">Tag terbaca</span>
          <span className="text-sm font-bold font-mono text-emerald-600">
            {readTagsCount} / {totalPhysicalItems}
          </span>
        </div>

        {/* Laci terisi */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <span className="text-slate-500">Laci terisi</span>
          <span className="font-semibold text-slate-800">
            {occupiedDrawers} dari {totalDrawers}
          </span>
        </div>

        {/* Waktu baca 1 lemari */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <span className="text-slate-500">Waktu baca 1 lemari</span>
          <span className="font-semibold text-slate-800">±2 detik</span>
        </div>

        {/* Selisih vs sistem */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-slate-500">Selisih vs sistem</span>
          <span
            className={`text-sm font-bold font-mono ${
              missingCount > 0 ? 'text-red-600' : 'text-emerald-600'
            }`}
          >
            {missingCount}
          </span>
        </div>
      </div>
    </div>
  );
}
