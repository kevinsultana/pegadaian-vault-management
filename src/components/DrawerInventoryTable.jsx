'use client';

import React, { useState } from 'react';
import { useVaultStore } from '../store/useVaultStore';
import {
  ArrowRightLeft,
  Eye,
  EyeOff,
  Radio,
  WifiOff,
  MoveRight,
  X,
  ShieldAlert,
} from 'lucide-react';

const DRAWER_OPTIONS = [
  'L01', 'L02', 'L03', 'L04', 'L05', 'L06',
  'L07', 'L08', 'L09', 'L10', 'L11', 'L12',
];

export default function DrawerInventoryTable() {
  const {
    items,
    selectedDrawer,
    setTransferModalOpen,
    movePhysicalItem,
    togglePhysicalPresence,
    setClassificationModalOpen,
  } = useVaultStore();

  const [activePopoverItemId, setActivePopoverItemId] = useState(null);

  // Show items registered by system to this drawer
  const drawerItems = items.filter(
    (it) => it.systemDrawerId === selectedDrawer || it.drawerId === selectedDrawer
  );

  const handleQuickMovePhysical = (itemId, targetDrawer) => {
    movePhysicalItem(itemId, targetDrawer);
    setActivePopoverItemId(null);
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center space-x-2">
          <h3 className="text-xs font-bold text-slate-800">
            Isi Laci {selectedDrawer} — Register Sistem & Status Fisik
          </h3>
          <span className="text-[10px] text-slate-400">
            (Klik [Pindah Fisik] atau [Cabut Tag] untuk uji coba anomali)
          </span>
        </div>
        <span className="text-[11px] font-mono text-slate-500">
          Total: {drawerItems.length} item terdaftar
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 font-medium">
              <th className="pb-2 font-semibold">Tag ID</th>
              <th className="pb-2 font-semibold">Barang</th>
              <th className="pb-2 font-semibold">Berat (g)</th>
              <th className="pb-2 font-semibold">Kadar</th>
              <th className="pb-2 font-semibold">Nasabah / SBG</th>
              <th className="pb-2 font-semibold">Status Deteksi Fisik</th>
              <th className="pb-2 font-semibold text-right">Aksi Operasional & Simulasi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {drawerItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-6 text-center text-slate-400 font-sans italic">
                  Laci ini kosong (0 item terdaftar)
                </td>
              </tr>
            ) : (
              drawerItems.map((item) => {
                const isTagOffline = !item.isPhysicallyPresent;
                const isMisplaced = item.isPhysicallyPresent && item.physicalDrawerId !== (item.systemDrawerId || item.drawerId);
                const isReconciledVirt = item.status === 'RECONCILED_VIRT';

                let badge = (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
                    <span>TERBACA ({item.physicalDrawerId})</span>
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

                // Row background: Soft red if tag is offline/not physically present
                const rowClass = isTagOffline
                  ? 'bg-rose-50/70 hover:bg-rose-100/60 border-l-4 border-rose-500'
                  : isMisplaced
                  ? 'bg-amber-50/50 hover:bg-amber-100/50 border-l-4 border-amber-500'
                  : 'hover:bg-slate-50/70';

                return (
                  <tr key={item.id} className={`${rowClass} transition-colors`}>
                    <td className="py-2.5 text-slate-900 font-medium">{item.id}</td>
                    <td className="py-2.5 text-slate-800 font-sans">{item.brand}</td>
                    <td className="py-2.5 text-slate-700">{item.weight.toFixed(2)}</td>
                    <td className="py-2.5 text-slate-700">{item.purity}</td>
                    <td className="py-2.5 text-slate-600 font-sans">{item.sbg}</td>
                    <td className="py-2.5 font-sans">{badge}</td>
                    <td className="py-2.5 text-right font-sans relative">
                      <div className="inline-flex items-center gap-1.5">
                        {/* 1. Pengajuan Mutasi Resmi */}
                        <button
                          onClick={() => setTransferModalOpen(true, item)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-sky-700 bg-sky-50 border border-sky-200 rounded hover:bg-sky-100 transition-colors cursor-pointer"
                          title="Ajukan mutasi resmi antar-laci"
                        >
                          <ArrowRightLeft className="w-3 h-3 text-sky-600" />
                          <span>Mutasi</span>
                        </button>

                        {/* 2. Tombol Pindah Fisik (Popover) */}
                        <div className="relative inline-block">
                          <button
                            onClick={() =>
                              setActivePopoverItemId(activePopoverItemId === item.id ? null : item.id)
                            }
                            className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded border transition-colors cursor-pointer ${
                              isMisplaced
                                ? 'bg-amber-100 border-amber-300 text-amber-900'
                                : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                            }`}
                            title="Simulasikan pemindahan fisik tanpa dokumen (Uji Alert MISPLACED)"
                          >
                            <MoveRight className="w-3 h-3 text-amber-600" />
                            <span>Pindah Fisik</span>
                          </button>

                          {/* Popover Pilihan Laci Tujuan */}
                          {activePopoverItemId === item.id && (
                            <div className="absolute right-0 bottom-full mb-1 z-30 bg-white rounded-lg shadow-xl border border-slate-200 p-2.5 w-48 text-left space-y-2">
                              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                                <span className="text-[10px] font-bold text-slate-700 uppercase">
                                  Pindah Fisik ke Laci:
                                </span>
                                <button
                                  onClick={() => setActivePopoverItemId(null)}
                                  className="text-slate-400 hover:text-slate-600"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                              <div className="grid grid-cols-4 gap-1">
                                {DRAWER_OPTIONS.map((d) => (
                                  <button
                                    key={d}
                                    onClick={() => handleQuickMovePhysical(item.id, d)}
                                    className={`py-1 text-[10px] font-mono font-bold rounded border transition-colors ${
                                      item.physicalDrawerId === d
                                        ? 'bg-[#0f233a] text-white border-[#0f233a]'
                                        : 'bg-slate-50 hover:bg-sky-50 text-slate-700 border-slate-200'
                                    }`}
                                  >
                                    {d}
                                  </button>
                                ))}
                              </div>
                              <p className="text-[9px] text-slate-400 leading-tight">
                                Memindahkan fisik tanpa dokumen izin akan memicu status MISPLACED pada scan berikutnya.
                              </p>
                            </div>
                          )}
                        </div>

                        {/* 3. Tombol Cabut / Pasang Tag Fisik */}
                        <button
                          onClick={() => togglePhysicalPresence(item.id)}
                          className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded border transition-colors cursor-pointer ${
                            item.isPhysicallyPresent
                              ? 'bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100'
                              : 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100'
                          }`}
                          title={
                            item.isPhysicallyPresent
                              ? 'Cabut / keluarkan fisik tag RFID (Uji Alert SELISIH)'
                              : 'Pasang / masukkan kembali fisik tag RFID ke laci'
                          }
                        >
                          {item.isPhysicallyPresent ? (
                            <>
                              <EyeOff className="w-3 h-3 text-rose-600" />
                              <span>Cabut Tag Fisik</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-3 h-3 text-emerald-600" />
                              <span>Pasang Tag</span>
                            </>
                          )}
                        </button>

                        {/* Tombol Rekonsiliasi khusus jika item selisih */}
                        {isTagOffline && !isReconciledVirt && (
                          <button
                            onClick={() => setClassificationModalOpen(true, 'MISSING', item)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors cursor-pointer"
                            title="Buka form klasifikasi & Berita Acara selisih"
                          >
                            <ShieldAlert className="w-3 h-3" />
                            <span>Rekonsiliasi</span>
                          </button>
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
