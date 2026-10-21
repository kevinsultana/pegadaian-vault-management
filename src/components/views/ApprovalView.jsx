'use client';

import React from 'react';
import { useVaultStore } from '../../store/useVaultStore';
import { CheckCircle2, XCircle, Clock, ShieldCheck, ArrowRight, Lock, AlertCircle } from 'lucide-react';

export default function ApprovalView() {
  const { transfers, approveTransfer, rejectTransfer, currentRole } = useVaultStore();

  const isSupervisor = currentRole === 'SUPERVISOR';
  const pendingCount = transfers.filter((t) => t.status === 'PENDING').length;

  return (
    <div className="space-y-4">
      {/* Subheader */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-1">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">
            Persetujuan Mutasi & Otorisasi Transfer
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar pengajuan pemindahan item antar laci yang memerlukan otorisasi dual approval Supervisor
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-3 py-1 rounded bg-amber-50 text-amber-800 text-xs font-semibold font-mono tracking-wide border border-amber-200">
            {pendingCount} MENUNGGU PERSETUJUAN
          </span>
        </div>
      </div>

      {/* RBAC Notice if not Supervisor */}
      {!isSupervisor && (
        <div className="bg-amber-50/80 border border-amber-300 rounded-lg p-3 text-xs text-amber-900 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              Peran Anda saat ini: <strong>{currentRole === 'PETUGAS' ? 'Petugas Vault' : 'SPI (Auditor)'}</strong>. Tombol otorisasi persetujuan mutasi terkunci (Read-Only).
            </span>
          </div>
          <span className="text-[11px] font-bold text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded border border-amber-300 shrink-0">
            Pilih "Supervisor Vault" di Header untuk Approve
          </span>
        </div>
      )}

      {/* Main Approval Table Card */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-sky-700" />
            <h3 className="text-xs font-bold text-slate-800">
              Daftar Permohonan Mutasi Internal Vault
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">Total: {transfers.length} dokumen</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-[11px] font-semibold">
                <th className="pb-2.5">No. Dokumen</th>
                <th className="pb-2.5">Tag ID & Deskripsi</th>
                <th className="pb-2.5">Rute Mutasi</th>
                <th className="pb-2.5">Pemohon</th>
                <th className="pb-2.5">Alasan</th>
                <th className="pb-2.5">Status</th>
                <th className="pb-2.5 text-right">Otorisasi Supervisor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {transfers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-sans italic">
                    Belum ada pengajuan mutasi item. Gunakan tombol [Pindahkan Item] pada menu Lemari & Laci.
                  </td>
                </tr>
              ) : (
                transfers.map((trf) => {
                  let badge = (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      <Clock className="w-3 h-3" />
                      PENDING
                    </span>
                  );

                  if (trf.status === 'APPROVED') {
                    badge = (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                        <CheckCircle2 className="w-3 h-3" />
                        APPROVED
                      </span>
                    );
                  } else if (trf.status === 'VERIFIED') {
                    badge = (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        TERVERIFIKASI FISIK
                      </span>
                    );
                  } else if (trf.status === 'REJECTED') {
                    badge = (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                        <XCircle className="w-3 h-3" />
                        DITOLAK
                      </span>
                    );
                  }

                  return (
                    <tr key={trf.id} className="hover:bg-slate-50/70">
                      <td className="py-3 font-bold text-slate-900">{trf.id}</td>
                      <td className="py-3">
                        <span className="font-bold text-slate-800">{trf.tagId}</span>
                        <p className="text-[11px] text-slate-500 font-sans">{trf.itemDesc}</p>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center space-x-1.5 font-bold text-slate-800">
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">{trf.sourceDrawerId || trf.sourceDrawer}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                          <span className="bg-sky-50 text-sky-800 px-1.5 py-0.5 rounded text-[11px] border border-sky-200">{trf.targetDrawerId || trf.targetDrawer}</span>
                        </div>
                      </td>
                      <td className="py-3 font-sans text-slate-600">
                        <div>{trf.requestedBy}</div>
                        <span className="text-[10px] text-slate-400 font-mono">{trf.requestTime || '-'}</span>
                      </td>
                      <td className="py-3 font-sans text-slate-600 max-w-xs truncate text-[11px]">
                        {trf.reason || '-'}
                      </td>
                      <td className="py-3 font-sans">{badge}</td>
                      <td className="py-3 text-right font-sans">
                        {trf.status === 'PENDING' ? (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => isSupervisor && approveTransfer(trf.id)}
                              disabled={!isSupervisor}
                              className={`px-2.5 py-1 text-xs font-semibold rounded-md shadow-xs transition-colors ${
                                isSupervisor
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                                  : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                              }`}
                              title={
                                isSupervisor
                                  ? 'Setujui Mutasi'
                                  : 'Hanya peran Supervisor Vault yang berhak menyetujui mutasi'
                              }
                            >
                              Setujui / Approve
                            </button>
                            <button
                              onClick={() => isSupervisor && rejectTransfer(trf.id)}
                              disabled={!isSupervisor}
                              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                                isSupervisor
                                  ? 'bg-white border border-slate-300 hover:bg-rose-50 hover:text-rose-700 text-slate-600 cursor-pointer'
                                  : 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                              }`}
                              title={
                                isSupervisor
                                  ? 'Tolak Mutasi'
                                  : 'Hanya peran Supervisor Vault yang berhak menolak mutasi'
                              }
                            >
                              Tolak
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400">
                            Disahkan oleh <span className="font-semibold text-slate-700">{trf.approvedBy || '-'}</span>
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

