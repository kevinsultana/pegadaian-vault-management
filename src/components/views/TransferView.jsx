'use client';

import React from 'react';
import { useVaultStore } from '../../store/useVaultStore';
import DrawerMatrix from '../DrawerMatrix';
import RealTimeRfidLogs from '../RealTimeRfidLogs';

export default function TransferView() {
  const { transfers } = useVaultStore();
  const activeTransfer = transfers[0] || {
    id: 'TRF-2026-10-0042',
    tagId: 'E0040007',
    itemDesc: 'UBS 25 g · 999,9 · SBG-00134',
    sourceDrawer: '1-S05-R01-L01',
    targetDrawer: '1-S05-R01-L02',
    approvedBy: 'supervisor.vault',
    detectTime: '10:22:41',
  };

  return (
    <div className="space-y-4">
      {/* Subheader */}
      <div className="pb-1">
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">
          Perpindahan Item — Laci L01 → Laci L02
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Item dipindahkan petugas dengan otorisasi transfer; sistem memverifikasi lokasi baru pada siklus baca berikutnya
        </p>
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Drawer Grid + Detail Perpindahan Box (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <DrawerMatrix />

          {/* Detail Perpindahan Box */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
            <h3 className="text-xs font-bold text-slate-800 mb-3">Detail perpindahan</h3>

            <div className="space-y-2 text-xs">
              <div className="flex">
                <span className="w-36 text-slate-500 shrink-0">Tag ID</span>
                <span className="font-mono font-semibold text-slate-800">
                  {activeTransfer.tagId} — {activeTransfer.itemDesc}
                </span>
              </div>

              <div className="flex">
                <span className="w-36 text-slate-500 shrink-0">Lokasi asal</span>
                <span className="font-mono text-slate-800">{activeTransfer.sourceDrawer}</span>
              </div>

              <div className="flex">
                <span className="w-36 text-slate-500 shrink-0">Lokasi tujuan</span>
                <span className="font-mono text-slate-800">{activeTransfer.targetDrawer}</span>
              </div>

              <div className="flex">
                <span className="w-36 text-slate-500 shrink-0">No. transfer</span>
                <span className="font-mono text-slate-800">
                  {activeTransfer.id} · <span className="text-slate-600">disetujui {activeTransfer.approvedBy}</span>
                </span>
              </div>

              <div className="flex">
                <span className="w-36 text-slate-500 shrink-0">Terdeteksi sistem</span>
                <span className="font-mono text-slate-800">
                  {activeTransfer.detectTime} (siklus baca berikutnya ± 4 detik)
                </span>
              </div>

              <div className="flex items-center pt-1">
                <span className="w-36 text-slate-500 shrink-0">Status</span>
                <span className="font-semibold text-emerald-600">
                  Lokasi terverifikasi — stok sistem diperbarui otomatis
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Real-time RFID Logs + Perbandingan + Aturan Sistem (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <RealTimeRfidLogs />

          {/* Perbandingan Sebelum vs Sesudah Box */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
            <h3 className="text-xs font-bold text-slate-800 mb-3">
              Perbandingan sebelum vs sesudah
            </h3>

            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-[11px] font-sans">
                  <th className="pb-1.5 font-semibold">Laci</th>
                  <th className="pb-1.5 font-semibold">Sebelum</th>
                  <th className="pb-1.5 font-semibold">Sesudah</th>
                  <th className="pb-1.5 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-2 font-bold text-slate-800">L01</td>
                  <td className="py-2 text-slate-600">5</td>
                  <td className="py-2 font-bold text-slate-800">4</td>
                  <td className="py-2 text-emerald-600 font-sans font-medium">Sesuai transfer</td>
                </tr>
                <tr>
                  <td className="py-2 font-bold text-slate-800">L02</td>
                  <td className="py-2 text-slate-600">3</td>
                  <td className="py-2 font-bold text-slate-800">4</td>
                  <td className="py-2 text-emerald-600 font-sans font-medium">Sesuai transfer</td>
                </tr>
                <tr className="border-t border-slate-200 font-bold">
                  <td className="pt-2 text-slate-800">Total LT-01</td>
                  <td className="pt-2 text-slate-600">39</td>
                  <td className="pt-2 text-slate-900">39</td>
                  <td className="pt-2 text-emerald-600 font-sans">Tidak ada selisih</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Aturan Sistem Box */}
          <div className="bg-[#f0f9ff] rounded-lg border border-sky-200 p-4 shadow-sm text-xs text-slate-700">
            <h4 className="font-bold text-[#0369a1] mb-2 flex items-center gap-1.5">
              <span>Aturan sistem</span>
            </h4>
            <ul className="space-y-1.5 text-[11px] text-slate-600 list-disc list-inside">
              <li>
                <span className="text-slate-800 font-medium">Tag pindah dengan dokumen transfer</span> → dicatat sebagai mutasi sah
              </li>
              <li>
                <span className="text-slate-800 font-medium">Tag pindah tanpa dokumen</span> → status MISPLACED + alert
              </li>
              <li>
                <span className="text-slate-800 font-medium">Total item lemari tetap</span> → tidak dihitung sebagai selisih
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
