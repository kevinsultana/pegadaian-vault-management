'use client';

import React, { useState } from 'react';
import { useVaultStore } from '../../store/useVaultStore';
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  ArrowDownRight,
  ArrowUpRight,
  ArrowRightLeft,
  MapPin,
  Lock,
  User,
  Radio,
  FileCheck2,
  Sparkles,
  Layers,
} from 'lucide-react';

export default function WorkOrderView() {
  const { transactions, currentRole, executeWorkOrder, openItemDetail, items } = useVaultStore();

  const [filterType, setFilterType] = useState('ALL'); // ALL | INBOUND | OUTBOUND | MUTASI
  const isPetugas = currentRole === 'PETUGAS';

  // Work orders that are either APPROVED (ready to execute) or COMPLETED
  const workOrders = transactions.filter(
    (t) => t.status === 'APPROVED' || t.status === 'COMPLETED'
  );

  const pendingExecutionCount = transactions.filter((t) => t.status === 'APPROVED').length;

  const filtered = workOrders.filter((t) => {
    if (filterType === 'ALL') return true;
    return t.type === filterType;
  });

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <span>Perintah Kerja Fisik Vault (Surat Perintah Kerja / SPK)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar instruksi penempatan fisik, pengambilan barang tebus, dan relokasi laci yang telah disetujui Supervisor
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 text-[#008ba3] text-xs font-bold font-mono tracking-wide border border-sky-200">
            <Clock className="w-3.5 h-3.5" />
            <span>{pendingExecutionCount} SIAP DIEKSEKUSI FISIK</span>
          </span>
        </div>
      </div>

      {/* Role Notice if not Petugas */}
      {!isPetugas && (
        <div className="bg-sky-50 border border-sky-200 rounded-xl p-3.5 text-xs text-sky-950 flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-sky-700 shrink-0" />
            <span>
              Peran Anda saat ini: <strong>{currentRole}</strong>. Tombol konfirmasi eksekusi fisik hanya aktif untuk <strong>Petugas Vault</strong>.
            </span>
          </div>
          <span className="text-[11px] font-bold text-sky-800 bg-sky-200/60 px-2 py-0.5 rounded border border-sky-300 shrink-0">
            Ganti ke &quot;Petugas Vault&quot; di Header untuk Eksekusi
          </span>
        </div>
      )}

      {/* Petugas SOP Physical Execution Guide Banner */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-2.5">
          Prosedur Standar Operasional (SOP) Eksekusi Fisik Petugas Vault:
        </span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-[#008ba3] text-white flex items-center justify-center text-[10px]">1</span>
              Verifikasi Dokumen & Fisik
            </span>
            <p className="text-[11px] text-slate-500">
              Cocokkan Tag ID fisik emas, gramatur, dan nomor SBG dengan data pada SPK di bawah.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-[#008ba3] text-white flex items-center justify-center text-[10px]">2</span>
              Aksi Fisik di Lemari LT-01
            </span>
            <p className="text-[11px] text-slate-500">
              Buka kompartemen laci dan letakkan/ambil keping emas tepat di <strong>Nomor Slot</strong> yang diinstruksikan.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-[#008ba3] text-white flex items-center justify-center text-[10px]">3</span>
              Konfirmasi Sistem & Validasi RFID
            </span>
            <p className="text-[11px] text-slate-500">
              Klik tombol aksi eksekusi. Reader RFID otomatis memverifikasi kecocokan lokasi dan memperbarui slot.
            </p>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold w-fit">
          {[
            { id: 'ALL', label: 'Semua SPK' },
            { id: 'INBOUND', label: 'Penempatan Inbound' },
            { id: 'OUTBOUND', label: 'Pengambilan Outbound' },
            { id: 'MUTASI', label: 'Relokasi Mutasi' },
          ].map((tab) => (
            <button
              type="button"
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                filterType === tab.id
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Table of Orders */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-[11px] font-semibold bg-slate-50/50">
                <th className="py-2.5 px-3">No. SPK</th>
                <th className="py-2.5 px-3">Jenis Tugas</th>
                <th className="py-2.5 px-3">Tag ID & Deskripsi</th>
                <th className="py-2.5 px-3">Instruksi Posisi Slot Fisik</th>
                <th className="py-2.5 px-3">Otorisasi Supervisor</th>
                <th className="py-2.5 px-3">Status Eksekusi</th>
                <th className="py-2.5 px-3 text-right">Aksi Eksekusi Petugas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-sans italic">
                    Belum ada perintah kerja fisik yang menunggu eksekusi.
                  </td>
                </tr>
              ) : (
                filtered.map((wo) => {
                  const isApproved = wo.status === 'APPROVED';
                  const isCompleted = wo.status === 'COMPLETED';

                  let taskBadge = (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <ArrowDownRight className="w-3 h-3" />
                      TARUH EMAS (INBOUND)
                    </span>
                  );
                  if (wo.type === 'OUTBOUND') {
                    if (wo.outboundCategory === 'MUTASI_INTERNAL') {
                      taskBadge = (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-300">
                          <ArrowRightLeft className="w-3 h-3" />
                          MUTASI INTERNAL LACI
                        </span>
                      );
                    } else if (wo.outboundCategory === 'RELOKASI_EKSTERNAL') {
                      taskBadge = (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300">
                          <ArrowUpRight className="w-3 h-3" />
                          RELOKASI EKSTERNAL
                        </span>
                      );
                    } else {
                      taskBadge = (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                          <ArrowUpRight className="w-3 h-3" />
                          PENEBUSAN NASABAH
                        </span>
                      );
                    }
                  } else if (wo.type === 'MUTASI') {
                    taskBadge = (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-300">
                        <ArrowRightLeft className="w-3 h-3" />
                        PINDAH FISIK (MUTASI)
                      </span>
                    );
                  }

                  const matchedItem = items.find((i) => i.id === wo.itemId);

                  return (
                    <tr key={wo.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-900">{wo.id}</td>
                      <td className="py-3 px-3 font-sans">{taskBadge}</td>
                      <td className="py-3 px-3 font-sans">
                        <span className="font-mono font-bold text-slate-900">{wo.itemId}</span>
                        <div className="text-[11px] text-slate-500 font-medium">
                          {wo.itemBrand} ({wo.weight}g) · {wo.sbg}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        {wo.type === 'INBOUND' ? (
                          <div className="font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 inline-block font-mono text-[11px]">
                            Masukkan ke: <strong>{wo.targetSlotId}</strong> (Laci {wo.targetDrawerId})
                          </div>
                        ) : wo.type === 'OUTBOUND' ? (
                          wo.outboundCategory === 'MUTASI_INTERNAL' ? (
                            <div className="font-semibold text-sky-800 bg-sky-50 px-2.5 py-1 rounded border border-sky-200 inline-block font-mono text-[11px]">
                              Pindah: <strong>{wo.sourceSlotId}</strong> → <strong>{wo.targetSlotId}</strong>
                            </div>
                          ) : wo.outboundCategory === 'RELOKASI_EKSTERNAL' ? (
                            <div className="font-semibold text-purple-800 bg-purple-50 px-2.5 py-1 rounded border border-purple-200 inline-block font-mono text-[11px]">
                              Keluarkan dari: <strong>{wo.sourceSlotId}</strong> → {wo.destinationLocation ? wo.destinationLocation.split('(')[0].trim() : 'Relokasi Cabang'}
                            </div>
                          ) : (
                            <div className="font-semibold text-rose-800 bg-rose-50 px-2.5 py-1 rounded border border-rose-200 inline-block font-mono text-[11px]">
                              Ambil dari: <strong>{wo.sourceSlotId}</strong> (Laci {wo.sourceDrawerId}) → Serahkan ke Nasabah
                            </div>
                          )
                        ) : (
                          <div className="font-semibold text-sky-800 bg-sky-50 px-2.5 py-1 rounded border border-sky-200 inline-block font-mono text-[11px]">
                            Pindahkan: <strong>{wo.sourceSlotId}</strong> → <strong>{wo.targetSlotId}</strong>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 font-sans text-[11px]">
                        <span className="text-emerald-700 font-bold block">✓ Disetujui</span>
                        <span className="text-slate-400 font-mono text-[10px]">{wo.approvedBy}</span>
                      </td>
                      <td className="py-3 px-3 font-sans">
                        {isCompleted ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            SELESAI (RFID OK)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200 animate-pulse">
                            <Clock className="w-3 h-3 text-sky-600" />
                            MENUNGGU FISIK
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-sans">
                        {isApproved ? (
                          <button
                            type="button"
                            disabled={!isPetugas}
                            onClick={() => executeWorkOrder(wo.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-all cursor-pointer ${
                              isPetugas
                                ? wo.type === 'OUTBOUND'
                                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                                  : 'bg-[#008ba3] hover:bg-[#00758a] text-white'
                                : 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed'
                            }`}
                          >
                            <Radio className="w-3.5 h-3.5 animate-pulse" />
                            <span>
                              {wo.type === 'INBOUND'
                                ? 'Konfirmasi Taruh & RFID'
                                : wo.type === 'OUTBOUND'
                                ? 'Konfirmasi Ambil & Selesai'
                                : 'Konfirmasi Pindah Fisik'}
                            </span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-700 font-medium inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Fisik Beres ({wo.executedBy})</span>
                          </span>
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
    </div>
  );
}
