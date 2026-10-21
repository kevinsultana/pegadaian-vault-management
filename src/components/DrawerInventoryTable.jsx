'use client';

import React from 'react';
import { useVaultStore } from '../store/useVaultStore';
import { ArrowRightLeft, Eye, EyeOff, Hand, ArrowRight } from 'lucide-react';

const DRAWER_OPTIONS = [
  'L01', 'L02', 'L03', 'L04', 'L05', 'L06',
  'L07', 'L08', 'L09', 'L10', 'L11', 'L12',
];

export default function DrawerInventoryTable() {
  const {
    items,
    selectedDrawer,
    setTransferModalOpen,
    physicalInteractionMode,
    movePhysicalItem,
    togglePhysicalPresence,
  } = useVaultStore();

  // In physical interaction mode, show items currently physically in this drawer;
  // otherwise show items registered by system to this drawer.
  const drawerItems = items.filter((it) =>
    physicalInteractionMode
      ? it.physicalDrawerId === selectedDrawer
      : it.systemDrawerId === selectedDrawer || it.drawerId === selectedDrawer
  );

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center space-x-2">
          <h3 className="text-xs font-bold text-slate-800">
            Isi Laci {selectedDrawer} — {physicalInteractionMode ? 'Penataan Fisik Aktual (Sandbox)' : 'Hasil Pembacaan Sistem'}
          </h3>
          {physicalInteractionMode && (
            <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded text-[10px] border border-amber-300 flex items-center gap-1 animate-pulse">
              <Hand className="w-3 h-3" />
              MODE INTERAKSI FISIK AKTIF
            </span>
          )}
        </div>
        <span className="text-[11px] font-mono text-slate-500">
          Total: {drawerItems.length} item
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
              <th className="pb-2 font-semibold">Status Deteksi</th>
              <th className="pb-2 font-semibold text-right">
                {physicalInteractionMode ? 'Simulasi Tangan Fisik' : 'Aksi Operasional'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {drawerItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-6 text-center text-slate-400 font-sans italic">
                  Laci ini kosong (0 item terbaca)
                </td>
              </tr>
            ) : (
              drawerItems.map((item) => {
                let badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                let statusLabel = 'TERBACA';

                if (!item.isPhysicallyPresent || item.status === 'MISSING') {
                  badgeClass = 'bg-rose-50 text-rose-700 border-rose-200';
                  statusLabel = 'TIDAK TERBACA / HILANG';
                } else if (item.status === 'MISPLACED') {
                  badgeClass = 'bg-amber-50 text-amber-700 border-amber-200';
                  statusLabel = `MISPLACED (di ${item.physicalDrawerId})`;
                } else if (item.status === 'RECONCILED_VIRT') {
                  badgeClass = 'bg-slate-100 text-slate-600 border-slate-300';
                  statusLabel = 'VIRT/OPNAME-DIFF';
                }

                return (
                  <tr key={item.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 text-slate-900 font-medium">{item.id}</td>
                    <td className="py-2.5 text-slate-800 font-sans">{item.brand}</td>
                    <td className="py-2.5 text-slate-700">{item.weight.toFixed(2)}</td>
                    <td className="py-2.5 text-slate-700">{item.purity}</td>
                    <td className="py-2.5 text-slate-600 font-sans">{item.sbg}</td>
                    <td className="py-2.5 font-sans">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${badgeClass}`}>
                        {statusLabel}
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-sans">
                      {physicalInteractionMode ? (
                        /* Physical Sandbox Interaction Tools */
                        <div className="inline-flex items-center gap-2">
                          {/* Sembunyikan / Ambil Fisik Item */}
                          <button
                            onClick={() => togglePhysicalPresence(item.id)}
                            className={`p-1.5 rounded-md border text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                              item.isPhysicallyPresent
                                ? 'bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100'
                                : 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100'
                            }`}
                            title={
                              item.isPhysicallyPresent
                                ? 'Keluarkan item dari laci fisik (Simulasi Hilang)'
                                : 'Masukkan kembali item ke laci fisik'
                            }
                          >
                            {item.isPhysicallyPresent ? (
                              <>
                                <EyeOff className="w-3.5 h-3.5 text-rose-600" />
                                <span>Ambil / Sembunyikan</span>
                              </>
                            ) : (
                              <>
                                <Eye className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Kembalikan Fisik</span>
                              </>
                            )}
                          </button>

                          {/* Quick Physical Move to another drawer */}
                          <select
                            value={item.physicalDrawerId}
                            onChange={(e) => movePhysicalItem(item.id, e.target.value)}
                            className="px-2 py-1 border border-slate-300 rounded text-xs font-mono font-semibold bg-white text-slate-800 focus:outline-none"
                            title="Pindahkan fisik ke laci lain"
                          >
                            {DRAWER_OPTIONS.map((d) => (
                              <option key={d} value={d}>
                                Pindah ke {d}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        /* Standard Operational Action */
                        <button
                          onClick={() => setTransferModalOpen(true, item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-sky-700 bg-sky-50 border border-sky-200 rounded-md hover:bg-sky-100 hover:border-sky-300 transition-colors cursor-pointer"
                          title={`Ajukan transfer ${item.id} ke laci lain`}
                        >
                          <ArrowRightLeft className="w-3 h-3 text-sky-600" />
                          <span>Pindahkan Item</span>
                        </button>
                      )}
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
