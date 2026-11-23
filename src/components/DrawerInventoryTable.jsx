'use client';

import React, { useState } from 'react';
import { useVaultStore } from '../store/useVaultStore';
import {
  ArrowRightLeft,
  ArrowUpRight,
  Eye,
  Radio,
  WifiOff,
  MoveRight,
  X,
  ShieldAlert,
  User,
  Info,
} from 'lucide-react';

export default function DrawerInventoryTable() {
  const {
    items,
    selectedDrawer,
    setTransferModalOpen,
    setOutboundModalOpen,
    openItemDetail,
    currentRole,
    setClassificationModalOpen,
  } = useVaultStore();

  const isStaffBisnis = currentRole === 'STAFF_BISNIS';
  const isSPI = currentRole === 'SPI';

  // Show active items registered to this drawer
  const drawerItems = items.filter(
    (it) =>
      (it.systemDrawerId === selectedDrawer || it.drawerId === selectedDrawer) &&
      it.status !== 'DITEBUS' &&
      it.status !== 'RELOKASI_KELUAR'
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs relative space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <h3 className="text-xs font-bold text-slate-800">
            Daftar Inventori Emas di Laci {selectedDrawer}
          </h3>
          <span className="text-[10px] text-slate-400">
            (Klik [Detail & Nasabah] untuk melihat pemilik & riwayat lengkap)
          </span>
        </div>
        <span className="text-[11px] font-mono font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
          Total: {drawerItems.length} item aktif
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/50">
              <th className="py-2.5 px-3">Slot Laci</th>
              <th className="py-2.5 px-3">Tag ID</th>
              <th className="py-2.5 px-3">Keping & Karat</th>
              <th className="py-2.5 px-3">Berat (g)</th>
              <th className="py-2.5 px-3">Pemilik / SBG</th>
              <th className="py-2.5 px-3">Status Fisik RFID</th>
              <th className="py-2.5 px-3 text-right">Aksi Operasional</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {drawerItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400 font-sans italic">
                  Laci ini belum memiliki keping emas aktif (semua slot tersedia).
                </td>
              </tr>
            ) : (
              drawerItems.map((item) => {
                const isTagOffline = !item.isPhysicallyPresent;
                const isMisplaced = item.isPhysicallyPresent && item.physicalDrawerId !== (item.systemDrawerId || item.drawerId);
                const isReconciledVirt = item.status === 'RECONCILED_VIRT';

                let badge = (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <Radio className="w-3 h-3 text-emerald-600" />
                    <span>TERBACA ({item.slotId})</span>
                  </span>
                );

                if (isReconciledVirt) {
                  badge = (
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-300">
                      VIRT/OPNAME-DIFF
                    </span>
                  );
                } else if (isTagOffline) {
                  badge = (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
                      <WifiOff className="w-3 h-3 text-rose-700" />
                      <span>TAG OFFLINE</span>
                    </span>
                  );
                } else if (isMisplaced) {
                  badge = (
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      MISPLACED (di {item.physicalDrawerId})
                    </span>
                  );
                }

                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-[#008ba3]">{item.slotId || '-'}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{item.id}</td>
                    <td className="py-2.5 px-3 font-sans text-slate-800">
                      {item.brand} ({item.purity})
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">{item.weight?.toFixed(2)}</td>
                    <td className="py-2.5 px-3 font-sans">
                      <span className="font-semibold text-slate-800 block">{item.customer?.name || 'Nasabah'}</span>
                      <span className="font-mono text-[11px] text-slate-500">{item.sbg}</span>
                    </td>
                    <td className="py-2.5 px-3 font-sans">{badge}</td>
                    <td className="py-2.5 px-3 text-right font-sans">
                      <div className="inline-flex items-center gap-1.5">
                        {/* Tombol Detail Lengkap */}
                        <button
                          type="button"
                          onClick={() => openItemDetail(item)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-100 transition-colors cursor-pointer shadow-2xs"
                          title="Lihat data nasabah, SBG, dan historikal pergerakan"
                        >
                          <Info className="w-3 h-3 text-[#008ba3]" />
                          <span>Detail Nasabah</span>
                        </button>

                        {/* Aksi Staff Bisnis */}
                        {!isSPI && (
                          <>
                            <button
                              type="button"
                              onClick={() => setTransferModalOpen(true, item)}
                              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-sky-700 bg-sky-50 border border-sky-200 rounded hover:bg-sky-100 transition-colors cursor-pointer"
                              title="Ajukan mutasi pemindahan slot / laci"
                            >
                              <ArrowRightLeft className="w-3 h-3 text-sky-600" />
                              <span>Mutasi</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setOutboundModalOpen(true, item)}
                              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded hover:bg-rose-100 transition-colors cursor-pointer"
                              title="Ajukan pengeluaran/penebusan emas"
                            >
                              <ArrowUpRight className="w-3 h-3 text-rose-600" />
                              <span>Tebus</span>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
