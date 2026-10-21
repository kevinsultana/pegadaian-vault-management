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

const DRAWER_OPTIONS = ['L01', 'L02', 'L03'];

export default function DrawerInventoryTable() {
  const {
    items,
    selectedDrawer,
    setTransferModalOpen,
    movePhysicalItem,
    togglePhysicalPresence,
    setClassificationModalOpen,
  } = useVaultStore();

  const [moveTargetItem, setMoveTargetItem] = useState(null);

  // Show items registered by system to this drawer
  const drawerItems = items.filter(
    (it) => it.systemDrawerId === selectedDrawer || it.drawerId === selectedDrawer
  );

  const handleQuickMovePhysical = (itemId, targetDrawer) => {
    movePhysicalItem(itemId, targetDrawer);
    setMoveTargetItem(null);
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
              drawerItems.map((item, index) => {
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

                        {/* 2. Tombol Pindah Fisik (Membuka Modal) */}
                        <button
                          onClick={() => setMoveTargetItem(item)}
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

      {/* Modal Dialog Pindah Fisik */}
      {moveTargetItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-sm w-full overflow-hidden">
            {/* Modal Header */}
            <div className="bg-[#0f233a] text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MoveRight className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-xs tracking-wide">
                  Simulasi Pindah Fisik (Hardware Sandbox)
                </h3>
              </div>
              <button
                onClick={() => setMoveTargetItem(null)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Item:</span>
                  <span className="font-bold text-slate-800">{moveTargetItem.brand}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Tag ID:</span>
                  <span className="font-mono font-bold text-cyan-700">{moveTargetItem.id}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Register Sistem:</span>
                  <span className="font-mono font-bold text-slate-700">{moveTargetItem.drawerId}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Posisi Fisik Sekarang:</span>
                  <span className="font-mono font-bold text-amber-600">{moveTargetItem.physicalDrawerId}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Pilih Laci Fisik Tujuan:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {DRAWER_OPTIONS.map((d) => {
                    const isCurrent = moveTargetItem.physicalDrawerId === d;
                    return (
                      <button
                        key={d}
                        onClick={() => handleQuickMovePhysical(moveTargetItem.id, d)}
                        className={`py-2 px-3 rounded-lg text-xs font-mono font-bold border transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                          isCurrent
                            ? 'bg-[#0f233a] text-white border-[#0f233a] shadow-xs'
                            : 'bg-white hover:bg-sky-50 text-slate-700 border-slate-200 hover:border-sky-300'
                        }`}
                      >
                        <span className="text-sm font-bold">{d}</span>
                        <span className="text-[10px] font-sans font-normal opacity-80">
                          {isCurrent ? '(Posisi saat ini)' : 'Pindahkan'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
                <span className="font-bold">Simulasi Uji Coba:</span> Memindahkan fisik keping emas ke laci lain tanpa pengajuan mutasi resmi akan memicu anomali <span className="font-bold font-mono">MISPLACED</span> saat reader RFID melakukan scan berikutnya.
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setMoveTargetItem(null)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
